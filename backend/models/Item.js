const mongoose = require("mongoose");

/* CLAIM SUBDOC */
const ClaimSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    answers: [String],

    confidence: {
      type: Number,
      default: 0,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
  },
  { timestamps: true }
);

/* VERIFICATION */
const VerificationSchema = new mongoose.Schema(
  {
    question: { type: String, required: true },
    correctAnswer: { type: String, default: "" },
    createdByOwner: { type: Boolean, default: false },
  },
  { _id: false }
);

/* MAIN ITEM */
const ItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      text: true,
    },

    description: {
      type: String,
      required: true,
      text: true,
    },

    category: {
      type: String,
      index: true,
    },

    type: {
      type: String,
      enum: ["lost", "found"],
      required: true,
      index: true,
    },

    images: [String],

    contact: {
      type: String,
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "matched", "closed"],
      default: "pending",
      index: true,
    },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        index: "2dsphere",
      },
    },

    verificationQuestions: [VerificationSchema],

    claims: [ClaimSchema],

    aiMatchScore: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

/* INDEXING */
ItemSchema.index({ title: "text", description: "text" });
ItemSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Item", ItemSchema);