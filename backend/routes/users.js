const router = require("express").Router();
const User = require("../models/User");
const auth = require("../middleware/auth");

/* GET ALL USERS (ADMIN) */
router.get("/", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }

  const users = await User.find().select("-password");
  res.json(users);
});

/* PROMOTE / DEMOTE USER */
router.put("/:id/role", auth, async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Admin only" });
  }

  const { role } = req.body;
  if (!["admin", "user"].includes(role)) {
    return res.status(400).json({ message: "Invalid role" });
  }

  await User.findByIdAndUpdate(req.params.id, { role });
  res.json({ message: "Role updated" });
});

module.exports = router;
