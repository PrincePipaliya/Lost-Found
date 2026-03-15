const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema(
{
  title: {
    type: String,
    required: true,
    trim: true
  },

  description: {
    type: String,
    required: true
  },

  category: {
    type: String
  },

  type: {
    type: String,
    enum: ["lost", "found"],
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "approved", "returned"],
    default: "pending"
  },

  images: [String],

  contact: {
    type: String,
    required: true
  },

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }

},
{ timestamps: true }
);

module.exports = mongoose.model("Item", ItemSchema);