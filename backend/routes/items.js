const router = require("express").Router();
const multer = require("multer");
const mongoose = require("mongoose");
const Item = require("../models/Item");
const auth = require("../middleware/auth");
const { generateQuestions, scoreClaim } = require("../services/aiService");

const upload = multer({ dest: "uploads/" });

/* =========================
   ADMIN: VIEW CLAIMS
========================= */
router.get("/admin/claims", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const items = await Item.find({
      "claims.0": { $exists: true }
    }).populate("claims.userId", "name email");

    res.json(items);
  } catch (err) {
    console.error("VIEW CLAIMS ERROR:", err);
    res.status(500).json({ message: "Failed to load claims" });
  }
});

/* =========================
   CREATE ITEM
   🔥 LOST → manual questions
   🔥 FOUND → no questions yet
========================= */
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    let verificationQuestions = [];

    // If LOST → owner must provide questions
    if (req.body.type === "lost" && req.body.verificationQuestions) {
      verificationQuestions = JSON.parse(req.body.verificationQuestions);
    }

    const item = await Item.create({
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      contact: req.body.contact,
      image: req.file ? req.file.path : null,
      userId: new mongoose.Types.ObjectId(req.user.id),
      status: "pending",
      verificationQuestions
    });

    res.json(item);
  } catch (err) {
    console.error("CREATE ITEM ERROR:", err);
    res.status(500).json({ message: "Failed to create item" });
  }
});

/* =========================
   GET MY POSTS
========================= */
router.get("/mine", auth, async (req, res) => {
  try {
    const items = await Item.find({
      userId: new mongoose.Types.ObjectId(req.user.id)
    }).sort({ date: -1 });

    res.json(items);
  } catch {
    res.status(500).json({ message: "Failed to load your posts" });
  }
});

/* =========================
   GET ITEMS
========================= */
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      return res.json(await Item.find().sort({ date: -1 }));
    }

    const approved = await Item.find({
      status: "approved",
      claimed: false
    }).sort({ date: -1 });

    res.json(approved);
  } catch {
    res.status(500).json({ message: "Failed to load items" });
  }
});

/* =========================
   APPROVE ITEM
   🔥 FOUND → AI generates questions
========================= */
router.put("/:id/approve", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    item.status = "approved";

    // If FOUND and no questions → generate AI questions
    if (
      item.type === "found" &&
      (!item.verificationQuestions || item.verificationQuestions.length === 0)
    ) {
      try {
        const questions = await generateQuestions(item);

        item.verificationQuestions = questions.map(q => ({
          question: q.question,
          correctAnswer: "ai_generated"
        }));
      } catch (aiError) {
        console.error("AI QUESTION ERROR:", aiError.message);
      }
    }

    await item.save();

    res.json({ message: "Item approved successfully" });

  } catch (err) {
    console.error("APPROVE ERROR:", err);
    res.status(500).json({ message: "Failed to approve item" });
  }
});

/* =========================
   PUBLIC ITEM DETAIL
   (Hide correct answers)
========================= */
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item || item.status !== "approved") {
      return res.status(404).json({ message: "Item not found" });
    }

    const cleanItem = item.toObject();

    cleanItem.verificationQuestions =
      cleanItem.verificationQuestions?.map(q => ({
        question: q.question
      })) || [];

    res.json(cleanItem);

  } catch {
    res.status(500).json({ message: "Failed to load item" });
  }
});

/* =========================
   SUBMIT CLAIM
========================= */
router.post("/:id/claim", auth, async (req, res) => {
  try {
    const { answers } = req.body;

    if (!Array.isArray(answers) || answers.length === 0) {
      return res.status(400).json({ message: "Invalid answers" });
    }

    const item = await Item.findById(req.params.id);
    if (!item || item.status !== "approved") {
      return res.status(404).json({ message: "Item not available" });
    }

    if (item.claimed) {
      return res.status(400).json({ message: "Item already claimed" });
    }

    // Prevent owner from claiming own item
    if (item.userId.toString() === req.user.id) {
      return res.status(400).json({ message: "Owner cannot claim this item" });
    }

    const alreadyClaimed = item.claims.find(
      c => c.userId.toString() === req.user.id
    );

    if (alreadyClaimed) {
      return res.status(400).json({ message: "You already submitted a claim" });
    }

    let confidence = 0;

    try {
      confidence = await scoreClaim(item, answers);
    } catch (aiError) {
      console.error("AI SCORING ERROR:", aiError.message);
    }

    item.claims.push({
      userId: req.user.id,
      answers,
      confidence,
      status: "pending"
    });

    await item.save();

    res.json({
      message: "Claim submitted successfully",
      confidence
    });

  } catch (err) {
    console.error("CLAIM ERROR:", err);
    res.status(500).json({ message: "Failed to submit claim" });
  }
});

/* =========================
   ADMIN: APPROVE CLAIM
========================= */
router.put("/:itemId/claim/:index/approve", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const item = await Item.findById(req.params.itemId);
    if (!item) return res.status(404).json({ message: "Item not found" });

    const claim = item.claims[req.params.index];
    if (!claim) return res.status(404).json({ message: "Claim not found" });

    claim.status = "approved";
    item.claimed = true;

    item.claims.forEach((c, i) => {
      if (i != req.params.index) c.status = "rejected";
    });

    await item.save();

    res.json({ message: "Claim approved successfully" });

  } catch (err) {
    console.error("APPROVE CLAIM ERROR:", err);
    res.status(500).json({ message: "Failed to approve claim" });
  }
});

/* =========================
   DELETE ITEM (ADMIN)
========================= */
router.delete("/:id", auth, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Admin access required" });
    }

    const item = await Item.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ message: "Item not found" });
    }

    await item.deleteOne();
    res.json({ message: "Item deleted successfully" });

  } catch {
    res.status(500).json({ message: "Failed to delete item" });
  }
});

module.exports = router;
