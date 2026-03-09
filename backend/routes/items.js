const router = require("express").Router();
const multer = require("multer");
const mongoose = require("mongoose");
const path = require("path");

const Item = require("../models/Item");

const auth = require("../middleware/auth");
const admin = require("../middleware/admin");

/* ======================================================
   MULTER STORAGE
====================================================== */

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

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }
});

/* ======================================================
   CREATE ITEM
====================================================== */

router.post("/", auth, upload.array("images", 5), async (req, res) => {

  try {

    const { title, description, type, contact, category, lat, lng } = req.body;

    const item = await Item.create({

      title,
      description,
      type,
      category,
      contact,
      user: req.user.id,
      status: "pending",
      claims: [],

      images: req.files ? req.files.map(f => `/uploads/${f.filename}`) : [],

      location:
        lat && lng
          ? {
              type: "Point",
              coordinates: [parseFloat(lng), parseFloat(lat)]
            }
          : undefined

    });

    res.json(item);

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Failed to create item" });

  }

});

/* ======================================================
   GET ITEMS
====================================================== */

router.get("/", async (req, res) => {

  try {

    const { search, category } = req.query;

    let query = { status: "approved" };

    if (category) query.category = category;

    if (search) {

      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];

    }

    const items = await Item.find(query).sort({ createdAt: -1 });

    res.json(items);

  } catch {

    res.status(500).json({ message: "Failed to load items" });

  }

});

/* ======================================================
   CLAIM ITEM
====================================================== */

router.post("/:id/claim", auth, async (req, res) => {

  try {

    const { message } = req.body;

    const item = await Item.findById(req.params.id);

    if (!item) return res.status(404).json({ message: "Item not found" });

    item.claims.push({
      user: req.user.id,
      message,
      status: "pending"
    });

    await item.save();

    res.json({ message: "Claim submitted" });

  } catch {

    res.status(500).json({ message: "Claim failed" });

  }

});

/* ======================================================
   ADMIN CLAIM APPROVE
====================================================== */

router.put("/:id/claims/:claimId/approve", auth, admin, async (req, res) => {

  try {

    const item = await Item.findById(req.params.id);

    const claim = item.claims.id(req.params.claimId);

    claim.status = "approved";

    item.status = "matched";

    await item.save();

    res.json({ message: "Claim approved" });

  } catch {

    res.status(500).json({ message: "Approval failed" });

  }

});

/* ======================================================
   ADMIN CLAIM REJECT
====================================================== */

router.put("/:id/claims/:claimId/reject", auth, admin, async (req, res) => {

  try {

    const item = await Item.findById(req.params.id);

    const claim = item.claims.id(req.params.claimId);

    claim.status = "rejected";

    await item.save();

    res.json({ message: "Claim rejected" });

  } catch {

    res.status(500).json({ message: "Rejection failed" });

  }

});

/* ======================================================
   ITEM DETAIL
====================================================== */

router.get("/:id", async (req, res) => {

  try {

    const item = await Item.findById(req.params.id).lean();

    if (!item) return res.status(404).json({ message: "Item not found" });

    res.json(item);

  } catch {

    res.status(500).json({ message: "Failed to load item" });

  }

});

module.exports = router;