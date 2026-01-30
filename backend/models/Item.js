const mongoose = require("mongoose");

const ClaimSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    answers: {
      type: [String],
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    },

    createdAt: {
      type: Date,
      default: Date.now
    }
  },
  { _id: false }
);

const ItemSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },

  type: {
    type: String,
    enum: ["lost", "found"],
    required: true
  },

  image: String,

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

  verificationQuestions: [
    {
      question: { type: String, required: true }
    }
  ],

  claims: [ClaimSchema],

  claimed: {
    type: Boolean,
    default: false
  },

  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Item", ItemSchema);
