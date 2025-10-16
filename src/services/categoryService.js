import {
  addAdminMapping,
  addMultiAdminMappings,
  removeAdminMappings,
  getAdminsForEntity,
} from "../repositories/entityAdminRepo.js";

import {
    createCategory,
    findCategoryById,
    findCategoryByName,
    getAllCategories,
    getMyCategories,
    updateCategoryById
} from "../repositories/categoryRepo.js";

import {
  assignRoleToUsers,
  removeRoleFromUsers,
} from "../repositories/userRepo.js";

const ENTITY_TYPE = "Category"; // constant for this service

export const createCategoryService = async (data, adminSocialIds) => {
    if (!data.name || data.name.trim() === "") throw new Error("Category name is required.");
    if (!adminSocialIds || adminSocialIds.length === 0) throw new Error("At least one category admin is required.");

    const trimmedName = data.name.trim();

    const existing = await findCategoryByName(trimmedName);
    if (existing) throw new Error("Category name already exists.");


  const category = await createCategory({
    name: data.name.trim(),
    description: data.description?.trim(),
  });

  // Map admins
  const adminDocs = adminSocialIds.map((id) => ({
    entityId: category._id,
    entityType: ENTITY_TYPE,
    userSocialId: id,
  }));
  await addMultiAdminMappings(adminDocs);

  // Assign categoryAdmin role to these users
  await assignRoleToUsers(adminSocialIds, "categoryAdmin", category._id);

  return category;
};

export const updateCategoryService = async (id, updates, adminSocialIds) => {
    const category = await findCategoryById(id);
    if (!category) throw new Error("Category not found.");


    const newName = updates.name?.trim();
    if (newName && newName !== category.name) {
        const existing = await findCategoryByName(newName);
        if (existing) throw new Error("Category name already exists.");
    }


  // Update main fields
  const updatedCategory = await updateCategoryById(id, {
    name: updates.name?.trim() || category.name,
    description: updates.description?.trim() || category.description,
  });

  // Update admin mapping if provided
  if (Array.isArray(adminSocialIds)) {
    if (adminSocialIds.length === 0)
      throw new Error("At least one category admin is required.");

    const existingAdmins = (
      await getAdminsForEntity(category._id, ENTITY_TYPE)
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
        newAdmins.map((id) => addAdminMapping(category._id, ENTITY_TYPE, id))
      );
      await assignRoleToUsers(newAdmins, "categoryAdmin", category._id);
    }

    // 2️⃣ Remove admin mappings and roles
    if (removedAdmins.length > 0) {
      await removeAdminMappings(category._id, ENTITY_TYPE, removedAdmins);
      await removeRoleFromUsers(removedAdmins, "categoryAdmin", category._id);
    }
  }

  return updatedCategory;
};

export const listCategoriesService = async (filter = {}) => {
  const categories = await getAllCategories(filter);
  return categories;
};

export const getCategoryByIdService = async (categoryId) => {
  const category = await findCategoryById(categoryId);
  if (!category) throw new Error("Category not found.");
  return category;
};

export const getMyCategoriesService = async (userSocialId) => {
  const categories = await getMyCategories(userSocialId);
  return categories.length ? categories : [];
};
