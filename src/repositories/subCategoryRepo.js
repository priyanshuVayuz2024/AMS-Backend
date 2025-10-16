import mongoose from "mongoose";
import SubCategory from "../models/SubCategoryModel.js";

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
