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
    })
      .populate("claims.user", "name email")
      .lean();

    const result = items.map((item) => ({
      ...item,
      claims: item.claims.map((c) => ({
        _id: c._id,
        answers: c.answers || [],
        confidence: c.confidence || 0,
        status: c.status,
        userId: c.user || null
      }))
    }));

    res.json(result);

  } catch (err) {

    console.error(err);
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
   CREATE ITEM
====================================================== */

router.post("/", auth, upload.array("images", 5), async (req, res) => {
  try {

    const { title, description, type, contact, category, lat, lng } = req.body;

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

      /* IMAGE FIX */
      images: req.files
        ? req.files.map((f) => `/uploads/${f.filename}`)
        : [],

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

    console.error(err);
    res.status(500).json({ message: "Failed to create item" });

  }
});

/* ======================================================
   GET APPROVED ITEMS
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
   ADMIN: GET ALL ITEMS
====================================================== */

router.get("/admin/all", auth, admin, async (req, res) => {
  try {

    const items = await Item.find()
      .sort({ createdAt: -1 });

    res.json(items);

  } catch (err) {

    res.status(500).json({ message: "Failed to load items" });

  }
});

/* ======================================================
   APPROVE ITEM
====================================================== */

router.put("/:id/approve", auth, admin, async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: "Invalid item ID" });

    const item = await Item.findById(req.params.id);

    if (!item)
      return res.status(404).json({ message: "Item not found" });

    item.status = "approved";

    if (item.type === "found" && item.verificationQuestions.length === 0) {

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

    console.error(err);
    res.status(500).json({ message: "Approval failed" });

  }
});

/* ======================================================
   DELETE ITEM
====================================================== */

router.delete("/:id", auth, admin, async (req, res) => {
  try {

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: "Invalid item ID" });

    const item = await Item.findById(req.params.id);

    if (!item)
      return res.status(404).json({ message: "Item not found" });

    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: "Item deleted successfully" });

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Delete failed" });

  }
});

/* ======================================================
   SUBMIT CLAIM
====================================================== */

router.post("/:id/claim", auth, async (req, res) => {
  try {

    const { answers } = req.body;

    const item = await Item.findById(req.params.id);

    if (!item || item.status !== "approved")
      return res.status(404).json({ message: "Item not available" });

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

    console.error(err);
    res.status(500).json({ message: "Claim failed" });

  }
});

/* ======================================================
   APPROVE CLAIM
====================================================== */

router.put("/:itemId/claims/:claimId/approve", auth, admin, async (req, res) => {
  try {

    const item = await Item.findById(req.params.itemId);

    const claim = item.claims.id(req.params.claimId);

    claim.status = "approved";
    item.status = "matched";

    await item.save();

    res.json({ message: "Claim approved" });

  } catch (err) {

    res.status(500).json({ message: "Claim approval failed" });

  }
});

/* ======================================================
   REJECT CLAIM
====================================================== */

router.put("/:itemId/claims/:claimId/reject", auth, admin, async (req, res) => {
  try {

    const item = await Item.findById(req.params.itemId);

    const claim = item.claims.id(req.params.claimId);

    claim.status = "rejected";

    await item.save();

    res.json({ message: "Claim rejected" });

  } catch (err) {

    res.status(500).json({ message: "Claim rejection failed" });

  }
});

/* ======================================================
   GET CHAT HISTORY
====================================================== */

router.get("/:id/chat", auth, async (req, res) => {
  try {

    const item = await Item.findById(req.params.id);

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
      .populate("claims.user", "name email")
      .lean();

    if (!item)
      return res.status(404).json({ message: "Item not found" });

    if (item.status === "pending")
      return res.status(403).json({ message: "Not approved yet" });

    item.verificationQuestions =
      item.verificationQuestions?.map((q) => ({
        question: q.question
      })) || [];

    if (item.status !== "matched") {
      item.contact = null;
    }

    res.json(item);

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Failed to load item" });

  }
});

module.exports = router;