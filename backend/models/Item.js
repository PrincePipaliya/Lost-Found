
const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  title: String,
  description: String,
  type: { type: String, enum: ["lost", "found"] },
  location: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Item", ItemSchema);
