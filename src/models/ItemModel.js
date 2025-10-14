import mongoose from "mongoose";

const itemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },

        description: {
            type: String,
            trim: true,
        },

        // Dynamic parent reference: can point to Category, SubCategory, or Group
        parentType: {
            type: String,
            required: true,
            enum: ["Category", "SubCategory", "Group"],
        },
        parentId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            refPath: "parentType", // Dynamically references one of the above models
        },

        // The user currently responsible for or holding this item
        assignedToSocialId: {
            type: String, // e.g. "SOC222"
            default: [],
        },

        // Optional parent item (for sub-item relationships)
        parentItemId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Item",
            default: null,
        },



        isActive: {
            type: Boolean,
            required: true,
            default: true,
        },

    },
    { timestamps: true }
);

// Optional: enforce unique item name within the same parent
itemSchema.index({ name: 1, parentId: 1, parentType: 1 }, { unique: true });

export default mongoose.model("Item", itemSchema);
