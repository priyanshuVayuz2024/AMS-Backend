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
  getMySubCategories,
  getSubCategoryByIdRepo,
  updateSubCategoryById,
} from "../repositories/subCategoryRepo.js";
import {
  assignRoleToUsers,
  removeRoleFromUsers,
} from "../repositories/userRepo.js";
import { createError } from "../util/responseHandler.js";

const ENTITY_TYPE = "SubCategory";

export const createSubCategoryService = async (data) => {
  const { categoryId, name, description, adminSocialIds } = data;

  // Basic validations
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
  };

  if (typeof updates.isActive === "boolean") {
    updatePayload.isActive = updates.isActive;
  }

  const updatedSubCategory = await updateSubCategoryById(id, updatePayload);
  let finalAdminSocialIds = adminSocialIds;

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
  page = 1,
  limit = 10,
  search = "",
  categoryId,
}) => {
  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: "i" }; // case-insensitive partial match
  }
  if (categoryId) {
    filter.categoryId = categoryId;
  }

  const { data, total } = await getAllSubCategoriesRepo(filter, {
    page,
    limit,
  });

  const enrichedData = await Promise.all(
    data.map(async (subCategory) => {
      const subCategoryObj = subCategory.toObject ? subCategory.toObject() : subCategory;

      const adminMappings = await getAdminsForEntity(subCategory._id, ENTITY_TYPE);
      const adminSocialIds = (adminMappings || []).map(
        (mapping) => mapping.userSocialId
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

export const getMySubCategoriesService = async (
  userSocialId,
  { page = 1, limit = 10, search = "" }
) => {
  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: "i" }; // case-insensitive name search
  }

  const { data, total } = await getMySubCategories(userSocialId, filter, {
    page,
    limit,
  });

  return {
    data,
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
