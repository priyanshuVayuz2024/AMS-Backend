import mongoose from "mongoose";

const entityAdminMappingSchema = new mongoose.Schema(
  {
    entityId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      refPath: "Asset", 
    },
    userSocialId: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["assigned", "returned"],
      default: "assigned",
      required: true,
    },
  },
  { timestamps: true }
);

// Unique index for Item-type entities
entityAdminMappingSchema.index(
  { entityId: 1, userSocialId: 1 },
  {
    unique: true,
  }
);

const EntityAdminMapping = mongoose.model(
  "EntityAdminMapping",
  entityAdminMappingSchema
);

export default EntityAdminMapping;
