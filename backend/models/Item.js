const mongoose = require("mongoose");

/* =========================
   CLAIM SCHEMA
========================= */
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

    score: {
      type: Number,
      default: 0
    },

    confidence: {
      type: Number,
      default: 0
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

/* =========================
   ITEM SCHEMA
========================= */
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

  /* 🔐 SMART VERIFICATION QUESTIONS */
  verificationQuestions: [
    {
      question: { type: String, required: true },
      correctAnswer: { type: String, required: true } // hidden from public
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
