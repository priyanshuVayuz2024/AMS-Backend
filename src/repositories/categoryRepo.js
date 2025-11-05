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

export const getAllCategories = async (filter = {}, { page = 1, limit = 10 } = {}) => {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
        Category.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Category.countDocuments(filter),
    ]);

    return { data, total };
};


export const getMyCategories = async (userSocialId, filter = {}, { page = 1, limit = 10 } = {}) => {
    // Find all mappings where user is admin for categories
    const mappings = await EntityAdminMapping.find({
        userSocialId,
        entityType: "Category",
    });

    const categoryIds = mappings.map((m) => m.entityId);

    if (categoryIds.length === 0) {
        return { data: [], total: 0 };
    }

    // 🔹 Add category ID filter + pagination
    const skip = (page - 1) * limit;

    const query = { _id: { $in: categoryIds }, ...filter };

    const [data, total] = await Promise.all([
        Category.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        Category.countDocuments(query),
    ]);

    return { data, total };
};
