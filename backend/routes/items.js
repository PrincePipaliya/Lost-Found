const router = require("express").Router();
const multer = require("multer");
const Item = require("../models/Item");
const auth = require("../middleware/auth");

const upload = multer({ dest: "uploads/" });

/**
 * CREATE ITEM (USER)
 * New items are pending by default
 */
router.post("/", auth, upload.single("image"), async (req, res) => {
  const item = await Item.create({
    title: req.body.title,
    description: req.body.description,
    type: req.body.type,
    contact: req.body.contact,
    image: req.file?.path,
    userId: req.user.id,
    status: "pending"
  });

  res.json(item);
});

/**
 * GET ITEMS
 * - Admin: sees ALL items
 * - User: sees ONLY approved items
 */
router.get("/", auth, async (req, res) => {
  if (req.user.role === "admin") {
    const allItems = await Item.find().sort({ date: -1 });
    return res.json(allItems);
  }

  const approvedItems = await Item.find({ status: "approved" }).sort({ date: -1 });
  res.json(approvedItems);
});

/**
 * APPROVE ITEM (ADMIN ONLY)
 */
router.put("/:id/approve", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  await Item.findByIdAndUpdate(req.params.id, { status: "approved" });
  res.json({ message: "Item approved" });
});

/**
 * DELETE ITEM (ADMIN ONLY)
 */
// DELETE ITEM (ADMIN ONLY)
router.delete("/:id", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin access required" });
  }

  await Item.findByIdAndDelete(req.params.id);
  res.json({ message: "Item permanently deleted" });
});


module.exports = router;
