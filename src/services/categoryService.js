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
    let message = await assignRoleToUsers(adminSocialIds, "categoryAdmin", category._id);

    return { category, message };
};


export const updateCategoryService = async (id, updates, adminSocialIds) => {
    const category = await findCategoryById(id);
    if (!category) throw new Error("Category not found.");

    let message = null;

    const newName = updates.name?.trim();
    if (newName && newName !== category.name) {
        const existing = await findCategoryByName(newName);
        if (existing) throw new Error("Category name already exists.");
    }

    let updatePayload = {
        name: updates.name?.trim() || category.name,
        description: updates.description?.trim() || category.description,
    };


    if (typeof updates.isActive === "boolean") {
        updatePayload.isActive = updates.isActive;
    }

    const updatedCategory = await updateCategoryById(id, updatePayload);

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

        // Add new admins
        if (newAdmins.length > 0) {
            await Promise.all(newAdmins.map((id) =>
                addAdminMapping(category._id, ENTITY_TYPE, id)
            ));
            message = await assignRoleToUsers(newAdmins, "categoryAdmin", category._id);
        }

        // Remove admins
        if (removedAdmins.length > 0) {
            await removeAdminMappings(category._id, ENTITY_TYPE, removedAdmins);
            await removeRoleFromUsers(removedAdmins, "categoryAdmin", category._id);
        }
    }

    return { updatedCategory, message };
};

export const listCategoriesService = async ({ page = 1, limit = 10, search = "" }) => {
    const filter = {};

    // case-insensitive partial match
    if (search) {
        filter.name = { $regex: search, $options: "i" }; 
    }

    const { data, total } = await getAllCategories(filter, { page, limit });

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

export const getCategoryByIdService = async (categoryId) => {
    const category = await findCategoryById(categoryId);
    if (!category) throw new Error("Category not found.");
    return category;
};

export const getMyCategoriesService = async (userSocialId, { page = 1, limit = 10, search = "" }) => {
    const filter = {};

    // case-insensitive partial match
    if (search) {
        filter.name = { $regex: search, $options: "i" };
    }

    const { data, total } = await getMyCategories(userSocialId, filter, { page, limit });

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
