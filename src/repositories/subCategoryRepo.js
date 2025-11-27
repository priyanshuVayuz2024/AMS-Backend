import mongoose from "mongoose";
import SubCategory from "../models/SubCategoryModel.js";
import EntityAdminMapping from "../models/EntityAdminMappingModel.js";
import GroupModel from "../models/GroupModel.js";
import ItemModel from "../models/ItemModel.js";

export const findSubCategoryByNameAndCategoryRepo = async (
  categoryId,
  trimmedName
) => {
  try {
    return await SubCategory.findOne({
      categoryId,
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") }, // case-insensitive match
    });
  } catch (error) {
    throw new Error(
      "Error while checking existing sub-category: " + error.message
    );
  }
};

export const createSubCategoryRepo = async (data) => {
  return await SubCategory.create(data);
};

export const findSubCategoryById = async (id) => {
  return await SubCategory.findById(id);
};

export const updateSubCategoryById = async (id, updateData) => {
  return await SubCategory.findByIdAndUpdate(id, updateData, { new: true });
};

export const findSubCategoryByName = async (name) => {
  return await SubCategory.findOne({ name: new RegExp(`^${name}$`, "i") });
};

export const getSubCategoryByIdRepo = async (id) => {
  //   return await SubCategory.findById(id).populate("categoryId");
  const objectId = new mongoose.Types.ObjectId(id);

  const result = await SubCategory.aggregate([
    // Match the specific subcategory
    { $match: { _id: objectId } },

    // Lookup category details
    {
      $lookup: {
        from: "categories", // collection name (lowercase plural of model)
        localField: "categoryId",
        foreignField: "_id",
        as: "categoryId",
      },
    },

    // Unwind categoryId (convert array → single object)
    { $unwind: "$categoryId" },

    // Lookup UserRoles linked to this subcategory
    {
      $lookup: {
        from: "userroles",
        localField: "_id",
        foreignField: "entityId",
        as: "admins",
      },
    },

    // Lookup users inside those userRoles
    {
      $lookup: {
        from: "users",
        localField: "admins.user",
        foreignField: "_id",
        as: "adminUsers",
      },
    },

    // Optionally clean up the structure
    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
        categoryId: 1,
        admins: "$adminUsers", // rename populated users
      },
    },
  ]);

  return result[0];
};

export const getAllSubCategoriesRepo = async (
  filter = {},
  { page, limit } = {}
) => {
  if (!page || !limit) {
    const data = await SubCategory.find(filter).sort({ createdAt: -1 });
    const total = await SubCategory.countDocuments(filter);

    return {
      data,
      total,
    };
  }

  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

  const skip = (parsedPage - 1) * parsedLimit;

  const data = await SubCategory.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit);

  const total = await SubCategory.countDocuments(filter);

  return {
    data,
    total,
  };
};

export const getMySubCategories = async (
  userSocialId,
  filter = {},
  { page = 1, limit = 10 } = {}
) => {
  const mappings = await EntityAdminMapping.find({
    userSocialId,
    entityType: "SubCategory",
  });

  const subCategoryIds = mappings.map((m) => m.entityId);

  if (subCategoryIds.length === 0) {
    return { data: [], total: 0 };
  }

  const skip = (page - 1) * limit;

  const query = { _id: { $in: subCategoryIds }, ...filter };

  const [data, total] = await Promise.all([
    SubCategory.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    SubCategory.countDocuments(query),
  ]);

  return { data, total };
};

export const deleteSubCategoryById = async (id) => {
  await ItemModel.deleteMany({ parentType: "SubCategory", parentId: id });

  // Find all groups belonging to this subcategory
  const groups = await GroupModel.find({ subCategoryId: id });

  // Extract their IDs
  const groupIds = groups.map((g) => g._id);

  // Delete items under those groups
  await ItemModel.deleteMany({
    parentType: "Group",
    parentId: { $in: groupIds },
  });

  await GroupModel.deleteMany({ subCategoryId: id });

  return await SubCategory.findByIdAndDelete(id);
};
