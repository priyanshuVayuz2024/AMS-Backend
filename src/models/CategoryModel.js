import mongoose from "mongoose";

const categorySchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            unique: true,
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
    { timestamps: true } // auto adds createdAt & updatedAt
);

const Category = mongoose.model("Category", categorySchema);
export default Category