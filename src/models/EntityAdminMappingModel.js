import mongoose from "mongoose";

const entityAdminMappingSchema = new mongoose.Schema(
    {
        entityId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "entityType", 
        },
        entityType: {
            type: String,
            required: true,
            enum: ["Category", "SubCategory", "Group", "Item", "Policy", "Sla"], 
        },
        userSocialId: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

entityAdminMappingSchema.index({ entityId: 1, entityType: 1, userSocialId: 1 }, { unique: true });

const EntityAdminMapping = mongoose.model("EntityAdminMapping", entityAdminMappingSchema);

export default EntityAdminMapping;
