import mongoose from "mongoose";

const assigneeSchema = new mongoose.Schema(
  {

    assignedAssetId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "assignedType",
      required: true,
    },

    assignedToSocialId: {
      type: String,
      required: true,
    },

     title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

   status: {
      type: String,
      enum: ["pending", "allocated", "returned"],
      default: "pending",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

  },
  { timestamps: true }
);

export default mongoose.model("Assignee", assigneeSchema);
