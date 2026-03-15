const router = require("express").Router();
const multer = require("multer");
const path = require("path");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

const controller = require("../controllers/itemController");
const Item = require("../models/Item");

/* MULTER STORAGE */

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },

  filename: (req, file, cb) => {

    const ext = path.extname(file.originalname);

    const uniqueName =
      Date.now() + "-" + Math.round(Math.random() * 1E9) + ext;

    cb(null, uniqueName);

  }

});

const upload = multer({ storage });

/* ROUTES */

router.post("/", auth, upload.array("images", 5), controller.createItem);

router.get("/admin/all", auth, admin, controller.getAllAdminItems);

router.put("/:id/approve", auth, admin, controller.approveItem);

router.get("/mine/list", auth, controller.getMyPosts);

/* RETURNED ITEMS PAGE */

router.get("/returned/all", async (req, res) => {

  try {

    const items = await Item.find({ status: "returned" })
      .populate("user", "name")
      .sort({ updatedAt: -1 });

    res.json(items);

  } catch {

    res.status(500).json({ message: "Failed to load returned items" });

  }

});

router.get("/", controller.getApprovedItems);

router.get("/:id", controller.getItem);

/* MARK ITEM RETURNED */

router.put("/:id/returned", auth, async (req, res) => {

  try {

    const item = await Item.findById(req.params.id);

    if (!item)
      return res.status(404).json({ message: "Item not found" });

    if (item.user.toString() !== req.user.id)
      return res.status(403).json({ message: "Not authorized" });

    item.status = "returned";

    await item.save();

    res.json({ message: "Item marked as returned" });

  } catch {

    res.status(500).json({ message: "Failed to update item" });

  }

});

router.delete("/admin/:id", auth, admin, controller.adminDeleteItem);

router.delete("/:id", auth, controller.deleteOwnPost);

module.exports = router;