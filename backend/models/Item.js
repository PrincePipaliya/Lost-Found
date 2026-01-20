const mongoose = require("mongoose");

const ItemSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },

  description: {
    type: String,
    required: true
  },

  type: {
    type: String,
    enum: ["lost", "found"],
    required: true
  },

  image: {
    type: String
  },

  contact: {
    type: String,
    required: true
  },

  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "approved"],
    default: "pending"
  },

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Item", ItemSchema);
