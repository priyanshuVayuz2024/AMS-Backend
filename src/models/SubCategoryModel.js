import mongoose from "mongoose";

const subCategorySchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
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

// Optional: prevent duplicate sub-categories under the same category
subCategorySchema.index({ categoryId: 1, name: 1 }, { unique: true });

const SubCategory = await mongoose.model("SubCategory", subCategorySchema);
export default SubCategory;
