import mongoose from "mongoose";

const userRoleSchema = new mongoose.Schema(
    {
        user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
        role: { type: mongoose.Schema.Types.ObjectId, ref: "Role", required: true },
        entityId: { type: mongoose.Schema.Types.ObjectId, required: false },
        // could reference different entities (e.g., sub-module, group, etc.)
    },
    { timestamps: true }
);

// Combination of user + role + entityId must be unique
userRoleSchema.index({ user: 1, role: 1, entityId: 1 }, { unique: true });

export default mongoose.model("UserRole", userRoleSchema);
