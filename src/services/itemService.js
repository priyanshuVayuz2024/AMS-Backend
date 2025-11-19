import {
    addAdminMapping,
    addMultiAdminMappings,
    removeAdminMappings,
    getAdminsForEntity,
} from "../repositories/entityAdminRepo.js";

import {
    createItem,
    findItemById,
    findItemByName,
    getAllItems,
    getMyItems,
    updateItemById
} from "../repositories/itemRepo.js";



import {
    assignRoleToUsers,
    removeRoleFromUsers,
} from "../repositories/userRepo.js";

const ENTITY_TYPE = "Item"; 

export const createItemService = async (data, assignedToSocialId) => {
  if (!data.name?.trim()) throw new Error("Item name is required.");
  if (!assignedToSocialId) throw new Error("Assigned user is required.");

  const trimmedName = data.name.trim();
  const existing = await findItemByName(trimmedName);
  if (existing) throw new Error("Item name already exists.");

  const item = await createItem({
    name: trimmedName,
    description: data?.description?.trim(),
    parentType: data?.parentType,
    parentId: data?.parentId,
    parentItemId: data?.parentItemId || null,
    isActive: data?.isActive,
    assignedToSocialId, // store directly (single string)
  });

  // Wrap it in an array to reuse existing logic safely
  const ids = [assignedToSocialId];

  const adminDocs = ids.map((id) => ({
    entityId: item._id,
    entityType: ENTITY_TYPE,
    userSocialId: id,
  }));

  await addMultiAdminMappings(adminDocs);

  const message = await assignRoleToUsers(ids, "itemUser", item._id);

  return { item, message };
};



export const updateItemService = async (id, updates, adminSocialIds) => {
    const item = await findItemById(id);
    if (!item) throw new Error("Item not found.");

    let message = null;

    const newName = updates.name?.trim();
    if (newName && newName !== item.name) {
        const existing = await findItemByName(newName);
        if (existing) throw new Error("Item name already exists.");
    }

    let updatePayload = {
        name: updates.name?.trim() || item.name,
        description: updates.description?.trim() || item.description,
    };


    if (typeof updates.isActive === "boolean") {
        updatePayload.isActive = updates.isActive;
    }

    const updatedItem = await updateItemById(id, updatePayload);

    if (Array.isArray(adminSocialIds)) {
        if (adminSocialIds.length === 0)
            throw new Error("At least one item admin is required.");

        const existingAdmins = (
            await getAdminsForEntity(item._id, ENTITY_TYPE)
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
                addAdminMapping(item._id, ENTITY_TYPE, id)
            ));
            message = await assignRoleToUsers(newAdmins, "itemUser", item._id);
        }

        // Remove admins
        if (removedAdmins.length > 0) {
            await removeAdminMappings(item._id, ENTITY_TYPE, removedAdmins);
            await removeRoleFromUsers(removedAdmins, "itemUser", item._id);
        }
    }

    return { updatedItem, message };
};

export const listItemsService = async ({ page = 1, limit = 10, search = "" }) => {
    const filter = {};

    // case-insensitive partial match
    if (search) {
        filter.name = { $regex: search, $options: "i" }; 
    }

    const { data, total } = await getAllItems(filter, { page, limit });

    
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

export const getItemByIdService = async (itemId) => {
    const item = await findItemById(itemId);
    if (!item) throw new Error("Item not found.");
    return item;
};

export const getMyItemsService = async (userSocialId, { page = 1, limit = 10, search = "" }) => {
    const filter = {};

    // case-insensitive partial match
    if (search) {
        filter.name = { $regex: search, $options: "i" };
    }

    const { data, total } = await getMyItems(userSocialId, filter, { page, limit });

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
