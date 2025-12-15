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
      name: { $regex: new RegExp(`^${trimmedName}$`, "i") }, 
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
  const objectId = new mongoose.Types.ObjectId(id);

  const result = await SubCategory.aggregate([
    { $match: { _id: objectId } },

    {
      $lookup: {
        from: "categories", 
        localField: "categoryId",
        foreignField: "_id",
        as: "categoryId",
      },
    },

    { $unwind: "$categoryId" },

    {
      $lookup: {
        from: "userroles",
        localField: "_id",
        foreignField: "entityId",
        as: "admins",
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "admins.user",
        foreignField: "_id",
        as: "adminUsers",
      },
    },

    {
      $project: {
        _id: 1,
        name: 1,
        description: 1,
        isActive: 1,
        createdAt: 1,
        updatedAt: 1,
        categoryId: 1,
        admins: "$adminUsers", 
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

export const getAssignedSubCategories = async (
  userSocialId,
  filter = {},
  { page, limit } = {}
) => {
  const mappings = await EntityAdminMapping.find({
    userSocialId,
    entityType: "SubCategory",
  });

  const subCategoryIds = mappings.map(m => m.entityId);

  if (subCategoryIds.length === 0) {
    return { data: [], total: 0 };
  }

  const query = { _id: { $in: subCategoryIds }, ...filter };

  if (!page || !limit) {
    const data = await SubCategory.find(query).sort({ createdAt: -1 });
    const total = await SubCategory.countDocuments(query);
    return { data, total };
  }

  const parsedPage = Number(page);
  const parsedLimit = Number(limit);
  const skip = (parsedPage - 1) * parsedLimit;

  const [data, total] = await Promise.all([
    SubCategory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit),

    SubCategory.countDocuments(query),
  ]);

  return { data, total };
};



export const getUserCreatedSubCategories = async (
  userSocialId,
  filter = {},
  { page, limit } = {}
) => {
  const query = { createdBy: userSocialId, ...filter };

  if (!page || !limit) {
    const data = await SubCategory.find(query).sort({ createdAt: -1 });
    const total = await SubCategory.countDocuments(query);
    return { data, total };
  }

  const parsedPage = Number(page);
  const parsedLimit = Number(limit);
  const skip = (parsedPage - 1) * parsedLimit;

  const [data, total] = await Promise.all([
    SubCategory.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit),

    SubCategory.countDocuments(query),
  ]);

  return { data, total };
};




export const deleteSubCategoryById = async (id) => {
  await ItemModel.deleteMany({ parentType: "SubCategory", parentId: id });

  const groups = await GroupModel.find({ subCategoryId: id });

  const groupIds = groups.map((g) => g._id);

  await ItemModel.deleteMany({
    parentType: "Group",
    parentId: { $in: groupIds },
  });

  await GroupModel.deleteMany({ subCategoryId: id });

  return await SubCategory.findByIdAndDelete(id);
};
