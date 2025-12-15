import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    assignedToSocialId: {
      type: String, 
      default: [],
    },

    reportCount: {
      type: Number,
      required: true,
      default: 0,
    },

    allocationStatus: {
      type: String,
      enum: ["unallocated", "allocated", "in-use", "under-maintenance"],
      required: true,
      default: "unallocated",
    },

    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

itemSchema.index({ name: 1 }, { unique: true });

export default mongoose.model("Item", itemSchema);
