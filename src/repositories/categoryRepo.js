import Category from "../models/CategoryModel.js";
import EntityAdminMapping from "../models/EntityAdminMappingModel.js";
import GroupModel from "../models/GroupModel.js";
import ItemModel from "../models/ItemModel.js";
import SubCategory from "../models/SubCategoryModel.js";

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

export const getAllCategories = async (filter = {}, options = {}) => {

  let query = Category.find(filter).sort({ createdAt: -1 });
  if (options.page !== undefined && options.limit !== undefined) {
    const skip = (options.page - 1) * options.limit;
    query = query.skip(skip).limit(options.limit);
  }

   const [data, total] = await Promise.all([
          query.exec(), 
          Category.countDocuments(filter),
    ]);


  return { data, total };
};

export const getMyCategories = async (
  userSocialId,
  filter = {},
  { page = 1, limit = 10 } = {}
) => {
  // Find all mappings where user is admin for categories
  const mappings = await EntityAdminMapping.find({
    userSocialId,
    entityType: "Category",
  });

  const categoryIds = mappings.map((m) => m.entityId);

  if (categoryIds.length === 0) {
    return { data: [], total: 0 };
  }

  // Add category ID filter + pagination
  const skip = (page - 1) * limit;

  const query = { _id: { $in: categoryIds }, ...filter };

  const [data, total] = await Promise.all([
    Category.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Category.countDocuments(query),
  ]);

  return { data, total };
};

export const deleteCategoryById = async (id) => {
  // 1. Delete items where parent is the Category
  await ItemModel.deleteMany({ parentType: "Category", parentId: id });

  // 2. Find all subcategories of the Category
  const subcategories = await SubCategory.find({ categoryId: id });
  const subcategoryIds = subcategories.map(sc => sc._id);

  // 3. Delete items belonging to subcategories
  await ItemModel.deleteMany({ 
    parentType: "SubCategory",
    parentId: { $in: subcategoryIds }
  });

  // 4. Delete subcategories
  await SubCategory.deleteMany({ categoryId: id });

  // 5. Delete the category
  return await Category.findByIdAndDelete(id);
};
