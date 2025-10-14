import mongoose from "mongoose";

const subCategoryAdminMappingSchema = new mongoose.Schema(
    {
        subCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory",
            required: true,
        },
        userSocialId: {
            type: String,
            required: true,
        },
    },
    { timestamps: true }
);

// Ensure unique mapping per sub-category
subCategoryAdminMappingSchema.index({ subCategoryId: 1, userSocialId: 1 }, { unique: true });

export default mongoose.model("SubCategoryAdminMapping", subCategoryAdminMappingSchema);
