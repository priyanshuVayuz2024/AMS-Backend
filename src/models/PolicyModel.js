import mongoose from "mongoose";

const policySchema = new mongoose.Schema(
  {
    url: {
      type: String,
      required: true,
      trim: true,
      unique: true,

    },

    description: {
      type: String,
      trim: true,
      default: "",
      unique: true,

    },

    parentType: {
      type: String,
      enum: ["Category", "SubCategory","Group"],
      required: true,
    },
    parentId: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "parentType",
      required: true,
    },

    assignedToSocialId: {
      type: String,        
      required: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Policy", policySchema);
