const router = require("express").Router();
const auth = require("../middleware/auth");
const User = require("../models/User");

/* Example: Get current user profile */
router.get("/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Failed to load user" });
  }
});

module.exports = router;