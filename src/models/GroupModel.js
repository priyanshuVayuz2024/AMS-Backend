import mongoose from "mongoose";

const groupSchema = new mongoose.Schema(
    {
        // Parent sub-category (group always belongs to a sub-category)
        subCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "SubCategory",
            required: true,
        },

        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        isActive: {
            type: Boolean,
            required: true,
            default: true,
        },

    },
    { timestamps: true }
);

// Optional: prevent duplicate group names under the same sub-category
groupSchema.index({ subCategoryId: 1, name: 1 }, { unique: true });

export default mongoose.model("Group", groupSchema);
