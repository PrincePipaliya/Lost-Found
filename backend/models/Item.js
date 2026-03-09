const mongoose = require("mongoose");

/* ================= CLAIM SUBSCHEMA ================= */

const ClaimSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    message: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending"
    }

  },
  { timestamps: true }
);

/* ================= ITEM SCHEMA ================= */

const ItemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      text: true
    },

    description: {
      type: String,
      required: true,
      text: true
    },

    category: {
      type: String,
      index: true
    },

    type: {
      type: String,
      enum: ["lost", "found"],
      required: true,
      index: true
    },

    images: [String],

    contact: {
      type: String,
      required: true
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true
    },

    status: {
      type: String,
      enum: ["pending", "approved", "matched"],
      default: "pending",
      index: true
    },

    /* CLAIMS SYSTEM */

    claims: [ClaimSchema],

    /* LOCATION */

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point"
      },
      coordinates: {
        type: [Number],
        index: "2dsphere"
      }
    }

  },
  { timestamps: true }
);

/* ================= INDEXES ================= */

ItemSchema.index({ title: "text", description: "text" });
ItemSchema.index({ createdAt: -1 });

module.exports = mongoose.model("Item", ItemSchema);