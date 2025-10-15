import Category from "../models/CategoryModel";

export const createCategory = async (categoryData) => {
    return await Category.create(categoryData);
};

export const findCategoryById = async (id) => {
    return await Category.findById(id);
};

export const updateCategoryById = async (id, updateData) => {
    return await Category.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteCategoryById = async (id) => {
    return await Category.findByIdAndDelete(id);
};

export const getAllCategories = async () => {
    return await Category.find().sort({ createdAt: -1 });
};

// Admin mappings
export const getAdminsForCategory = async (categoryId) => {
    return await CategoryAdminMapping.find({ categoryId });
};

export const addAdminMapping = async (categoryId, userSocialId) => {
    return await CategoryAdminMapping.create({ categoryId, userSocialId });
};

export const removeAdminMappings = async (categoryId, adminIds) => {
    return await CategoryAdminMapping.deleteMany({
        categoryId,
        userSocialId: { $in: adminIds },
    });
};
