import Category from "../models/CategoryModel.js";

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
