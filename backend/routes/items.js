const router = require("express").Router();
const multer = require("multer");
const mongoose = require("mongoose");
const Item = require("../models/Item");
const Chat = require("../models/Chat");
const auth = require("../middleware/auth");
const admin = require("../middleware/admin");
const { generateQuestions, scoreClaim } = require("../services/aiService");

/* ======================================================
   MULTER CONFIG
====================================================== */

const upload = multer({
  dest: "uploads/",
  limits: { fileSize: 5 * 1024 * 1024 },
});

/* ======================================================
   ADMIN: VIEW CLAIMS
====================================================== */

router.get("/admin/claims", auth, admin, async (req, res) => {
  try {
    const items = await Item.find({
      "claims.0": { $exists: true },
    }).populate("claims.user", "name email");

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to load claims" });
  }
});

/* ======================================================
   GET MY POSTS
====================================================== */

router.get("/mine", auth, async (req, res) => {
  try {
    const items = await Item.find({ user: req.user.id })
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to load your posts" });
  }
});

/* ======================================================
   CREATE ITEM (WITH GEO SUPPORT)
====================================================== */

router.post("/", auth, upload.array("images", 5), async (req, res) => {
  try {
    const {
      title,
      description,
      type,
      contact,
      category,
      lat,
      lng,
    } = req.body;

    if (!title || !description || !type)
      return res.status(400).json({ message: "Missing required fields" });

    let verificationQuestions = [];

    if (type === "lost" && req.body.verificationQuestions) {
      const parsed = JSON.parse(req.body.verificationQuestions);

      verificationQuestions = parsed.map((q) => ({
        question: q.question,
        correctAnswer: q.correctAnswer || "",
        createdByOwner: true,
      }));
    }

    const item = await Item.create({
      title,
      description,
      type,
      category,
      contact,
      user: req.user.id,
      status: "pending",
      images: req.files ? req.files.map((f) => f.path) : [],
      verificationQuestions,
      location:
        lat && lng
          ? {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)],
            }
          : undefined,
    });

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to create item" });
  }
});

/* ======================================================
   GET ITEMS (SEARCH + FILTER)
====================================================== */

router.get("/", async (req, res) => {
  try {
    const { search, category } = req.query;

    let query = { status: "approved" };

    if (category) query.category = category;
    if (search) query.$text = { $search: search };

    const items = await Item.find(query)
      .sort({ createdAt: -1 });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Failed to load items" });
  }
});

/* ======================================================
   GEO SEARCH
====================================================== */

router.get("/search/near", async (req, res) => {
  try {
    const { lat, lng, distance = 5000 } = req.query;

    const items = await Item.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [parseFloat(lng), parseFloat(lat)],
          },
          $maxDistance: parseInt(distance),
        },
      },
      status: "approved",
    });

    res.json(items);
  } catch (err) {
    res.status(500).json({ message: "Geo search failed" });
  }
});

/* ======================================================
   APPROVE ITEM (ADMIN)
====================================================== */

router.put("/:id/approve", auth, admin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: "Invalid item ID" });

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.status = "approved";

    if (
      item.type === "found" &&
      (!item.verificationQuestions ||
        item.verificationQuestions.length === 0)
    ) {
      const questions = await generateQuestions(item);

      item.verificationQuestions = questions.map((q) => ({
        question: q.question,
        correctAnswer: "",
        createdByOwner: false,
      }));
    }

    await item.save();

    res.json({ message: "Item approved successfully" });
  } catch (err) {
    res.status(500).json({ message: "Approval failed" });
  }
});

/* ======================================================
   SUBMIT CLAIM
====================================================== */

router.post("/:id/claim", auth, async (req, res) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0)
      return res.status(400).json({ message: "Invalid answers" });

    const item = await Item.findById(req.params.id);
    if (!item || item.status !== "approved")
      return res.status(404).json({ message: "Item not available" });

    if (item.user.toString() === req.user.id)
      return res.status(400).json({ message: "Owner cannot claim" });

    const already = item.claims.find(
      (c) => c.user.toString() === req.user.id
    );

    if (already)
      return res.status(400).json({ message: "Already claimed" });

    const confidence = await scoreClaim(item, answers);

    item.claims.push({
      user: req.user.id,
      answers,
      confidence,
      status: "pending",
    });

    await item.save();

    res.json({ message: "Claim submitted", confidence });
  } catch (err) {
    res.status(500).json({ message: "Claim failed" });
  }
});

/* ======================================================
   APPROVE CLAIM (ADMIN)
====================================================== */

router.put("/:itemId/claims/:claimId/approve", auth, admin, async (req, res) => {
  try {
    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const claim = item.claims.id(req.params.claimId);
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    claim.status = "approved";
    item.status = "matched";

    await item.save();

    res.json({ message: "Claim approved, item matched" });
  } catch (err) {
    res.status(500).json({ message: "Claim approval failed" });
  }
});

/* ======================================================
   GET CHAT HISTORY
====================================================== */

router.get("/:id/chat", auth, async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const isOwner = item.user.toString() === req.user.id;
    const approvedClaim = item.claims.find(
      (c) =>
        c.user.toString() === req.user.id &&
        c.status === "approved"
    );

    if (!isOwner && !approvedClaim)
      return res.status(403).json({ message: "Chat not allowed" });

    const messages = await Chat.find({ itemId: item._id })
      .sort({ createdAt: 1 });

    res.json(messages);
  } catch (err) {
    res.status(500).json({ message: "Chat load failed" });
  }
});

/* ======================================================
   ITEM DETAIL
====================================================== */

router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id)
      .populate("claims.user", "name email");

    if (!item) return res.status(404).json({ message: "Item not found" });

    if (item.status === "pending")
      return res.status(403).json({ message: "Not approved yet" });

    const clean = item.toObject();

    clean.verificationQuestions =
      clean.verificationQuestions?.map((q) => ({
        question: q.question,
      })) || [];

    if (item.status !== "matched") {
      clean.contact = null;
    }

    res.json(clean);
  } catch (err) {
    res.status(500).json({ message: "Failed to load item" });
  }
});

module.exports = router;