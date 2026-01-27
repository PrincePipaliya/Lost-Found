const mongoose = require("mongoose");

module.exports = mongoose.model("AdminLog", new mongoose.Schema({
  adminId: mongoose.Schema.Types.ObjectId,
  action: String,
  target: String,
  date: { type: Date, default: Date.now }
}));
