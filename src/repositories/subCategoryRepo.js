import mongoose from "mongoose";
import SubCategory from "../models/SubCategoryModel.js";
<<<<<<< HEAD
import EntityAdminMapping from "../models/EntityAdminMappingModel.js";
=======
>>>>>>> 615604e9a16e590e1477d1190a5a1a7ba4013a49

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

<<<<<<< HEAD
export const findSubCategoryById = async (id) => {
    return await SubCategory.findById(id);
};

export const updateSubCategoryById = async (id, updateData) => {
    return await SubCategory.findByIdAndUpdate(id, updateData, { new: true });
};

export const findSubCategoryByName = async (name) => {
    return await SubCategory.findOne({ name: new RegExp(`^${name}$`, "i") });
};


=======
>>>>>>> 615604e9a16e590e1477d1190a5a1a7ba4013a49
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

export const getAllSubCategoriesRepo = async (filter = {}, { page, limit }) => {
  const skip = (page - 1) * limit;

  const data = await SubCategory.find(filter).skip(skip).limit(limit);

  const total = await SubCategory.countDocuments(filter);

  return {
    data,
    total,
  };
};
<<<<<<< HEAD



export const getMySubCategories = async (userSocialId, filter = {}, { page = 1, limit = 10 } = {}) => {
  console.log("testing if here")
    // Find all mappings where user is admin for categories
    const mappings = await EntityAdminMapping.find({
        userSocialId,
        entityType: "SubCategory",
    });

    console.log(mappings, "13");
    
    const subCategoryIds = mappings.map((m) => m.entityId);

    console.log(subCategoryIds,"14")
    if (subCategoryIds.length === 0) {
        return { data: [], total: 0 };
    }

    // 🔹 Add sub-category ID filter + pagination
    const skip = (page - 1) * limit;

    const query = { _id: { $in: subCategoryIds }, ...filter };

    const [data, total] = await Promise.all([
        SubCategory.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
        SubCategory.countDocuments(query),
    ]);

    return { data, total };
};
=======
>>>>>>> 615604e9a16e590e1477d1190a5a1a7ba4013a49
