const router = require("express").Router();
const multer = require("multer");
const mongoose = require("mongoose");
const Item = require("../models/Item");
const auth = require("../middleware/auth");
const { generateQuestions, scoreClaim } = require("../services/aiService");
const Chat = require("../models/Chat");

const upload = multer({ dest: "uploads/" });

/* ======================================================
   ADMIN: VIEW CLAIMS
====================================================== */
router.get("/admin/claims", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Admin only" });

    const items = await Item.find({
      "claims.0": { $exists: true }
    }).populate("claims.userId", "name email");

    res.json(items);
  } catch (err) {
    console.error("ADMIN CLAIM LOAD ERROR:", err);
    res.status(500).json({ message: "Failed to load claims" });
  }
});

/* ======================================================
   GET MY POSTS  ✅ (THIS WAS MISSING)
====================================================== */
router.get("/mine", auth, async (req, res) => {
  try {
    const items = await Item.find({
      userId: req.user.id
    }).sort({ date: -1 });

    res.json(items);
  } catch (err) {
    console.error("MY POSTS ERROR:", err);
    res.status(500).json({ message: "Failed to load your posts" });
  }
});

/* ======================================================
   CREATE ITEM
====================================================== */
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    let verificationQuestions = [];

    if (req.body.type === "lost" && req.body.verificationQuestions) {
      const parsed = JSON.parse(req.body.verificationQuestions);

      verificationQuestions = parsed.map(q => ({
        question: q.question,
        correctAnswer: q.correctAnswer || "",
        createdByOwner: true
      }));
    }

    const item = await Item.create({
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      contact: req.body.contact,
      image: req.file ? req.file.path : null,
      userId: req.user.id,
      status: "pending",
      verificationQuestions
    });

    res.json(item);
  } catch (err) {
    console.error("CREATE ITEM ERROR:", err);
    res.status(500).json({ message: "Failed to create item" });
  }
});

/* ======================================================
   GET DASHBOARD ITEMS
====================================================== */
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const all = await Item.find().sort({ date: -1 });
      return res.json(all);
    }

    const approved = await Item.find({
      status: "approved"
    }).sort({ date: -1 });

    res.json(approved);
  } catch (err) {
    console.error("LOAD ITEMS ERROR:", err);
    res.status(500).json({ message: "Failed to load items" });
  }
});

/* ======================================================
   APPROVE ITEM (ADMIN)
====================================================== */
router.put("/:id/approve", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin")
      return res.status(403).json({ message: "Admin only" });

    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: "Invalid item ID" });

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    item.status = "approved";

    if (
      item.type === "found" &&
      (!item.verificationQuestions || item.verificationQuestions.length === 0)
    ) {
      const questions = await generateQuestions(item);

      item.verificationQuestions = questions.map(q => ({
        question: q.question,
        correctAnswer: "",
        createdByOwner: false
      }));
    }

    await item.save();
    res.json({ message: "Item approved successfully" });
  } catch (err) {
    console.error("APPROVE ERROR:", err);
    res.status(500).json({ message: "Approval failed" });
  }
});

/* ======================================================
   SUBMIT CLAIM
====================================================== */
router.post("/:id/claim", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: "Invalid item ID" });

    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0)
      return res.status(400).json({ message: "Invalid answers" });

    const item = await Item.findById(req.params.id);
    if (!item || item.status !== "approved")
      return res.status(404).json({ message: "Item not available" });

    if (item.claimed)
      return res.status(400).json({ message: "Item already claimed" });

    if (item.userId.toString() === req.user.id)
      return res.status(400).json({ message: "Owner cannot claim" });

    const already = item.claims.find(
      c => c.userId.toString() === req.user.id
    );

    if (already)
      return res.status(400).json({ message: "Already claimed" });

    const confidence = await scoreClaim(item, answers);

    item.claims.push({
      userId: req.user.id,
      answers,
      confidence,
      status: "pending"
    });

    await item.save();

    res.json({ message: "Claim submitted", confidence });
  } catch (err) {
    console.error("CLAIM ERROR:", err);
    res.status(500).json({ message: "Claim failed" });
  }
});

/* ======================================================
   GET CHAT HISTORY
====================================================== */
router.get("/:id/chat", auth, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: "Invalid item ID" });

    const item = await Item.findById(req.params.id);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const isOwner = item.userId.toString() === req.user.id;
    const approvedClaim = item.claims.find(
      c =>
        c.userId.toString() === req.user.id &&
        c.status === "approved"
    );

    if (!isOwner && !approvedClaim)
      return res.status(403).json({ message: "Chat not allowed" });

    const messages = await Chat.find({ itemId: item._id })
      .sort({ createdAt: 1 });

    res.json(
      messages.map(m => ({
        sender: m.senderId.toString(),
        text: m.message,
        time: new Date(m.createdAt).toLocaleTimeString()
      }))
    );
  } catch (err) {
    console.error("CHAT ERROR:", err);
    res.status(500).json({ message: "Chat load failed" });
  }
});

/* ======================================================
   ITEM DETAIL (KEEP THIS LAST!)
====================================================== */
router.get("/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id))
      return res.status(400).json({ message: "Invalid item ID" });

    const item = await Item.findById(req.params.id)
      .populate("claims.userId", "name email");

    if (!item)
      return res.status(404).json({ message: "Item not found" });

    if (item.status !== "approved")
      return res.status(403).json({ message: "Item not approved yet" });

    const clean = item.toObject();

    clean.verificationQuestions =
      clean.verificationQuestions?.map(q => ({
        question: q.question
      })) || [];

    if (!item.claimed) {
      clean.contact = null;
    }

    res.json(clean);
  } catch (err) {
    console.error("ITEM DETAIL ERROR:", err);
    res.status(500).json({ message: "Failed to load item" });
  }
});

module.exports = router;
