import mongoose from "mongoose";

const groupAdminMappingSchema = new mongoose.Schema(
    {
        groupId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Group",
            required: true,
        },
        userSocialId: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// Ensure unique mapping per group
groupAdminMappingSchema.index({ groupId: 1, userSocialId: 1 }, { unique: true });

export default mongoose.model("GroupAdminMapping", groupAdminMappingSchema);
