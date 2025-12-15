import mongoose from "mongoose";

const moduleSchema = new mongoose.Schema(
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

    isActive: {
      type: Boolean,
      required: true,
      default: true,
    },
  },
  { timestamps: true }
);

moduleSchema.index({ name: 1}, { unique: true });

export default mongoose.model("Module", moduleSchema);