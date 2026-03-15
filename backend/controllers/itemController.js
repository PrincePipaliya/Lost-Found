const Item = require("../models/Item");

/* CREATE ITEM */

exports.createItem = async (req, res) => {

  try {

    const { title, description, type, contact, category } = req.body;

    const item = await Item.create({

      title,
      description,
      type,
      category,
      contact,
      user: req.user.id,
      status: "pending",

      images: req.files
        ? req.files.map(file => `/uploads/${file.filename}`)
        : []

    });

    res.json(item);

  } catch (err) {

    console.error(err);
    res.status(500).json({ message: "Failed to create item" });

  }

};

/* ADMIN GET ALL */

exports.getAllAdminItems = async (req, res) => {

  try {

    const items = await Item.find()
      .populate("user", "name email")
      .sort({ createdAt: -1 });

    res.json(items);

  } catch {

    res.status(500).json({ message: "Failed to load admin items" });

  }

};

/* APPROVE ITEM */

exports.approveItem = async (req, res) => {

  try {

    const item = await Item.findById(req.params.id);

    if (!item)
      return res.status(404).json({ message: "Item not found" });

    item.status = "approved";

    await item.save();

    res.json({ message: "Item approved" });

  } catch {

    res.status(500).json({ message: "Approval failed" });

  }

};

/* GET MY POSTS */

exports.getMyPosts = async (req, res) => {

  try {

    const items = await Item.find({
      user: req.user.id
    }).sort({ createdAt: -1 });

    res.json(items);

  } catch {

    res.status(500).json({ message: "Failed to load posts" });

  }

};

/* GET ALL APPROVED */

exports.getApprovedItems = async (req, res) => {

  try {

    const items = await Item.find({ status: "approved" })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.json(items);

  } catch {

    res.status(500).json({ message: "Failed to load items" });

  }

};

/* GET ITEM */

exports.getItem = async (req, res) => {

  try {

    const item = await Item.findById(req.params.id)
      .populate("user", "name email");

    if (!item)
      return res.status(404).json({ message: "Item not found" });

    res.json(item);

  } catch {

    res.status(500).json({ message: "Failed to load item" });

  }

};

/* ADMIN DELETE */

exports.adminDeleteItem = async (req, res) => {

  try {

    await Item.findByIdAndDelete(req.params.id);

    res.json({ message: "Item deleted" });

  } catch {

    res.status(500).json({ message: "Delete failed" });

  }

};

/* USER DELETE */

exports.deleteOwnPost = async (req, res) => {

  try {

    const item = await Item.findById(req.params.id);

    if (!item)
      return res.status(404).json({ message: "Item not found" });

    if (item.user.toString() !== req.user.id)
      return res.status(403).json({
        message: "You can only delete your own post"
      });

    await item.deleteOne();

    res.json({ message: "Post deleted" });

  } catch {

    res.status(500).json({ message: "Delete failed" });

  }

};