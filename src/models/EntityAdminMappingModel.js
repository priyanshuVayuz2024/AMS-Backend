import mongoose from "mongoose";

const entityAdminMappingSchema = new mongoose.Schema(
    {
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "entityType", // dynamic reference
        },
        entityType: {
            type: String,
            required: true,
            enum: ["Category", "SubCategory", "Group", "Item"], // add more as needed
        },
        userSocialId: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// Ensure a user is not mapped twice to the same entity
entityAdminMappingSchema.index({ entityId: 1, entityType: 1, userSocialId: 1 }, { unique: true });

const EntityAdminMapping = mongoose.model("EntityAdminMapping", entityAdminMappingSchema);

export default EntityAdminMapping;
