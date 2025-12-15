import Category from "../models/CategoryModel.js";
import {
  addAdminMapping,
  addMultiAdminMappings,
  getAdminsForEntity,
  removeAdminMappings,
} from "../repositories/entityAdminRepo.js";
import {
  createSubCategoryRepo,
  deleteSubCategoryById,
  findSubCategoryById,
  findSubCategoryByName,
  findSubCategoryByNameAndCategoryRepo,
  getAllSubCategoriesRepo,
  getAssignedSubCategories,
  getSubCategoryByIdRepo,
  getUserCreatedSubCategories,
  updateSubCategoryById,
} from "../repositories/subCategoryRepo.js";
import {
  assignRoleToUsers,
  removeRoleFromUsers,
} from "../repositories/userRepo.js";
import { createError } from "../util/responseHandler.js";

const ENTITY_TYPE = "SubCategory";

export const createSubCategoryService = async (data) => {
  const { categoryId, name, description, adminSocialIds, createdBy } = data;

  if (!categoryId) throw new Error("Category ID is required.");
  if (!name || name.trim() === "")
    throw new Error("Sub-category name is required.");
  if (!adminSocialIds || adminSocialIds.length === 0)
    throw new Error("At least one sub-category admin is required.");

  const trimmedName = name.trim();

  // Check if subcategory already exists under the same category
  const existingSubCategory = await findSubCategoryByNameAndCategoryRepo(
    categoryId,
    trimmedName
  );
  if (existingSubCategory)
    throw createError(
      409,
      "Sub-category name already exists under this category."
    );

  // Create new subcategory
  const subCategory = await createSubCategoryRepo({
    categoryId,
    name: trimmedName,
    description: description?.trim(),
    createdBy : createdBy,
  });

  const adminDocs = adminSocialIds.map((id) => ({
    entityId: subCategory._id,
    entityType: ENTITY_TYPE,
    userSocialId: id,
  }));
  await addMultiAdminMappings(adminDocs);

  await assignRoleToUsers(adminSocialIds, "subCategoryAdmin", subCategory._id);

  return {
    subCategory,
    adminSocialIds,
    message: "Sub-category created successfully",
  };
};

export const updateSubCategoryService = async (id, updates, adminSocialIds) => {
  const subCategory = await findSubCategoryById(id);
  if (!subCategory) throw new Error("Sub-category not found.");

  let message = null;
  const newName = updates.name?.trim();
  if (newName && newName !== subCategory.name) {
    const existing = await findSubCategoryByName(newName);
    if (existing) throw new Error("Sub-category name already exists.");
  }


  let updatePayload = {
    name: updates.name?.trim() || subCategory.name,
    description: updates.description?.trim() || subCategory.description,
    categoryId: updates.categoryId || subCategory.categoryId,
  };

  if (typeof updates.isActive === "boolean") {
    updatePayload.isActive = updates.isActive;
  }

  const updatedSubCategory = await updateSubCategoryById(id, updatePayload);
  let finalAdminSocialIds = adminSocialIds;

console.log(finalAdminSocialIds,"finalAdminSocialIds");

  // Update admin mapping if provided
  if (Array.isArray(adminSocialIds)) {
    if (adminSocialIds.length === 0)
      throw new Error("At least one category admin is required.");

    const existingAdmins = (
      await getAdminsForEntity(subCategory._id, ENTITY_TYPE)
    ).map((a) => a.userSocialId);

    const newAdmins = adminSocialIds.filter(
      (id) => !existingAdmins.includes(id)
    );
    const removedAdmins = existingAdmins.filter(
      (id) => !adminSocialIds.includes(id)
    );

    // 1️⃣ Add new admin mappings and roles
    if (newAdmins.length > 0) {
      await Promise.all(
        newAdmins.map((id) => addAdminMapping(subCategory._id, ENTITY_TYPE, id))
      );
      message = await assignRoleToUsers(
        newAdmins,
        "subCategoryAdmin",
        subCategory._id
      );
    }

    // 2️⃣ Remove admin mappings and roles
    if (removedAdmins.length > 0) {
      await removeAdminMappings(subCategory._id, ENTITY_TYPE, removedAdmins);
      await removeRoleFromUsers(
        removedAdmins,
        "subCategoryAdmin",
        subCategory._id
      );
    }
    finalAdminSocialIds = adminSocialIds;
  }

  return { updatedSubCategory, adminSocialIds: finalAdminSocialIds, message };
};


const enrichWithCategoryName = async (data) => {
  const categoryIds = [...new Set(data.map(sc => sc.categoryId))];

  const categories = await Category.find(
    { _id: { $in: categoryIds } },
    { name: 1 }
  );

  const categoryNameMap = new Map();
  categories.forEach(cat =>
    categoryNameMap.set(cat._id.toString(), cat.name)
  );

  return data.map(sc => {
    const obj = sc.toObject ? sc.toObject() : sc;
    return {
      ...obj,
      categoryName: categoryNameMap.get(obj.categoryId.toString()),
    };
  });
};


export const getSubCategoryByIdService = async (id) => {
  if (!id) {
    throw new Error("SubCategory ID is required");
  }
  const subCategory = await getSubCategoryByIdRepo(id);
  if (!subCategory) {
    throw new Error("SubCategory not found");
  }
  const subCategoryObj = subCategory.toObject
    ? subCategory.toObject()
    : subCategory;
  const adminMappings = await getAdminsForEntity(subCategory._id, ENTITY_TYPE);
  const adminSocialIds = (adminMappings || []).map(
    (mapping) => mapping.userSocialId
  );
  return {
    ...subCategoryObj,
    adminSocialIds,
  };
};

export const listSubCategoriesService = async ({
  page,
  limit,
  search = "",
  categoryId,
}) => {
  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }
  if (categoryId) {
    filter.categoryId = categoryId;
  }

  // Get all subcategories
  const { data, total } = await getAllSubCategoriesRepo(filter, {
    page,
    limit,
  });

  // Extract unique categoryIds from the subcategory data
  const categoryIds = [...new Set(data.map((sc) => sc.categoryId))]; 
    console.log(categoryIds, "categoryIds");

  const categories = await Category.find(
    { _id: { $in: categoryIds } },
    { name: 1 }
  );
  console.log(categories, "categories");

  const categoryNameMap = new Map();
  categories.forEach((cat) =>
    categoryNameMap.set(cat._id.toString(), cat.name)
  );
  console.log(categoryNameMap, "categoryNameMap");

  // Enrich subcategories with adminSocialIds + categoryName
  const enrichedData = await Promise.all(
    data.map(async (subCategory) => {
      const subCategoryObj = subCategory.toObject
        ? subCategory.toObject()
        : subCategory;

      // Admins
      const adminMappings = await getAdminsForEntity(
        subCategory._id,
        ENTITY_TYPE
      );
      const adminSocialIds = (adminMappings || []).map(
        (mapping) => mapping.userSocialId
      );

      // Map categoryName from the subcategory's categoryId
      subCategoryObj.categoryName = categoryNameMap.get(
        subCategoryObj.categoryId.toString()
      );

      return {
        ...subCategoryObj,
        adminSocialIds,
      };
    })
  );

  return {
    data: enrichedData,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const getAssignedSubCategoriesService = async (
  userSocialId,
  { page, limit, search = "", categoryId }
) => {
  const filter = {};

  if (search) filter.name = { $regex: search, $options: "i" };

  if (categoryId) filter.categoryId = categoryId;

  const { data, total } = await getAssignedSubCategories(
    userSocialId,
    filter,
    { page, limit }
  );

  const enrichedData = await enrichWithCategoryName(data);

  return {
    data: enrichedData,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};



export const getUserCreatedSubCategoriesService = async (
  userSocialId,
  { page, limit, search = "", categoryId }
) => {
  const filter = {};

  if (search) filter.name = { $regex: search, $options: "i" };

  if (categoryId) filter.categoryId = categoryId;

  const { data, total } = await getUserCreatedSubCategories(
    userSocialId,
    filter,
    { page, limit }
  );

  const enrichedData = await enrichWithCategoryName(data);

  return {
    data: enrichedData,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};



export const deleteSubCategoryService = async (id) => {
  const deleted = await deleteSubCategoryById(id);

  if (!deleted) {
    return {
      success: false,
      message: "SubCategory not found",
    };
  }

  return {
    success: true,
    data: deleted,
  };
};
