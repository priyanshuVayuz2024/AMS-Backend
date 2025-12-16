import mongoose from "mongoose";

const roleAssigneeSchema = new mongoose.Schema(
  {
    roleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    assignedToSocialId: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      trim: true,
      default: "",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

roleAssigneeSchema.index(
  { assignedToSocialId: 1, roleId: 1 },
  { unique: true }
);

export default mongoose.model("UserRole", roleAssigneeSchema);
