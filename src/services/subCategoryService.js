import { addMultiAdminMappings } from "../repositories/entityAdminRepo.js";
import {
  createSubCategoryRepo,
  findSubCategoryByNameAndCategoryRepo,
  getAllSubCategoriesRepo,
  getSubCategoryByIdRepo,
} from "../repositories/subCategoryRepo.js";
import { assignRoleToUsers } from "../repositories/userRepo.js";
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
    message: "Sub-category created successfully",
  };
};

export const getSubCategoryByIdService = async (id) => {
  return await getSubCategoryByIdRepo(id);
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
