import mongoose from "mongoose";

const categoryAdminMappingSchema = new mongoose.Schema(
    {
        categoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
            required: true,
        },
        userSocialId: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// Ensure a user is not mapped twice to the same category
categoryAdminMappingSchema.index({ categoryId: 1, userSocialId: 1 }, { unique: true });

export default mongoose.model("CategoryAdminMapping", categoryAdminMappingSchema);