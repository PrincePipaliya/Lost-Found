const router = require("express").Router();
const multer = require("multer");
const mongoose = require("mongoose");
const Item = require("../models/Item");
const auth = require("../middleware/auth");

const upload = multer({ dest: "uploads/" });

/* =========================
   CREATE ITEM (USER)
========================= */
router.post("/", auth, upload.single("image"), async (req, res) => {
  try {
    const item = await Item.create({
      title: req.body.title,
      description: req.body.description,
      type: req.body.type,
      contact: req.body.contact,
      image: req.file ? req.file.path : null,
      userId: new mongoose.Types.ObjectId(req.user.id),
      status: "pending"
    });

    res.json(item);
  } catch (err) {
    console.error("CREATE ITEM ERROR:", err);
    res.status(500).json({ message: "Failed to create item" });
  }
});

/* =========================
   GET MY POSTS (USER)
========================= */
router.get("/mine", auth, async (req, res) => {
  try {
    const myItems = await Item.find({
      userId: new mongoose.Types.ObjectId(req.user.id)
    }).sort({ date: -1 });

    res.json(myItems);
  } catch (err) {
    console.error("MY POSTS ERROR:", err);
    res.status(500).json({ message: "Failed to load your posts" });
  }
});

/* =========================
   GET ITEMS
   - Admin: all items
   - User: approved only
========================= */
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const allItems = await Item.find().sort({ date: -1 });
      return res.json(allItems);
    }

    const approvedItems = await Item.find({
      status: "approved",
      claimed: false
    }).sort({ date: -1 });

    res.json(approvedItems);
  } catch (err) {
    res.status(500).json({ message: "Failed to load items" });
  }
});

/* =========================
   PUBLIC ITEM DETAIL
========================= */
router.get("/:id", async (req, res) => {
  try {
    const item = await Item.findById(req.params.id);

    if (!item || item.status !== "approved") {
      return res.status(404).json({ message: "Item not found" });
    }

    res.json(item);
  } catch (err) {
    res.status(500).json({ message: "Failed to load item" });
  }
});

/* =========================
   SUBMIT CLAIM (USER)
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

    const alreadyClaimed = item.claims.find(
      c => c.userId.toString() === req.user.id
    );

    if (alreadyClaimed) {
      return res.status(400).json({ message: "You already submitted a claim" });
    }

    item.claims.push({
      userId: req.user.id,
      answers
    });

    await item.save();

    res.json({ message: "Claim submitted successfully" });
  } catch (err) {
    console.error("CLAIM ERROR:", err);
    res.status(500).json({ message: "Failed to submit claim" });
  }
});

/* =========================
   ADMIN: VIEW CLAIMS
========================= */
router.get("/claims/all", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  const items = await Item.find({
    "claims.0": { $exists: true }
  }).populate("claims.userId", "name email");

  res.json(items);
});

/* =========================
   ADMIN: APPROVE CLAIM
========================= */
router.put("/:itemId/claim/:index/approve", auth, async (req, res) => {
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

  res.json({ message: "Claim approved" });
});

/* =========================
   ADMIN: REJECT CLAIM
========================= */
router.put("/:itemId/claim/:index/reject", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  const item = await Item.findById(req.params.itemId);
  if (!item) return res.status(404).json({ message: "Item not found" });

  const claim = item.claims[req.params.index];
  if (!claim) return res.status(404).json({ message: "Claim not found" });

  claim.status = "rejected";
  await item.save();

  res.json({ message: "Claim rejected" });
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
  } catch (err) {
    console.error("ADMIN DELETE ERROR:", err);
    res.status(500).json({ message: "Failed to delete item" });
  }
});

/* =========================
   UPDATE OWN ITEM (USER)
========================= */
router.put("/:id/own", auth, async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) return res.status(404).json({ message: "Not found" });
  if (item.userId.toString() !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  Object.assign(item, req.body);
  await item.save();

  res.json(item);
});

/* =========================
   DELETE OWN ITEM (USER)
========================= */
router.delete("/:id/own", auth, async (req, res) => {
  const item = await Item.findById(req.params.id);

  if (!item) return res.status(404).json({ message: "Not found" });
  if (item.userId.toString() !== req.user.id) {
    return res.status(403).json({ message: "Forbidden" });
  }

  await item.deleteOne();
  res.json({ message: "Deleted" });
});

module.exports = router;
