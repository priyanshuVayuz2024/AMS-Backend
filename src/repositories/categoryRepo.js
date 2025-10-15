import Category from "../models/CategoryModel.js";
import EntityAdminMapping from "../models/EntityAdminMappingModel.js";

export const createCategory = async (categoryData) => {
    return await Category.create(categoryData);
};

export const findCategoryById = async (id) => {
    return await Category.findById(id);
};

export const updateCategoryById = async (id, updateData) => {
    return await Category.findByIdAndUpdate(id, updateData, { new: true });
};


export const findCategoryByName = async (name) => {
    return await Category.findOne({ name: new RegExp(`^${name}$`, "i") });
};

export const deleteCategoryById = async (id) => {
    return await Category.findByIdAndDelete(id);
};

export const getAllCategories = async () => {
    return await Category.find().sort({ createdAt: -1 });
};



export const getMyCategories = async (userSocialId) => {
    // Find all mappings for categories
    const mappings = await EntityAdminMapping.find({
        userSocialId,
        entityType: "Category",
    });

    const categoryIds = mappings.map((m) => m.entityId);

    if (categoryIds.length === 0) return [];

    // Fetch categories by IDs
    const categories = await Category.find({ _id: { $in: categoryIds } }).sort({ createdAt: -1 });

    return categories;
};