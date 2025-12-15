import mongoose from "mongoose";

const userRoleSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    roleId: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
    entityId: { type: mongoose.Schema.Types.ObjectId, required: false },
  },
  { timestamps: true }
);

userRoleSchema.index({ user: 1, role: 1, entityId: 1 }, { unique: true });

const UserRole = mongoose.model("UserRole", userRoleSchema);

export default UserRole;
