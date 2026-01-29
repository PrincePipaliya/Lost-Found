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
    }).sort({ createdAt: -1 });

    res.json(myItems);
  } catch (err) {
    console.error("MY POSTS ERROR:", err);
    res.status(500).json({ message: "Failed to load your posts" });
  }
});

/* =========================
   PUBLIC ITEM DETAIL
   (Approved items only)
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
   GET ITEMS
   - Admin: all items
   - User: approved only
========================= */
router.get("/", auth, async (req, res) => {
  try {
    if (req.user.role === "admin") {
      const allItems = await Item.find().sort({ createdAt: -1 });
      return res.json(allItems);
    }

    const approvedItems = await Item.find({ status: "approved" })
      .sort({ createdAt: -1 });

    res.json(approvedItems);
  } catch (err) {
    res.status(500).json({ message: "Failed to load items" });
  }
});

/* =========================
   APPROVE ITEM (ADMIN)
========================= */
router.put("/:id/approve", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  await Item.findByIdAndUpdate(req.params.id, { status: "approved" });
  res.json({ message: "Item approved" });
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
