import {
  addAdminMapping,
  addMultiAdminMappings,
  removeAdminMappings,
  getAdminsForEntity,
} from "../repositories/entityAdminRepo.js";

import {
  createGroup,
  deleteGroupById,
  findGroupById,
  findGroupByName,
  getAllGroups,
  getMyGroups,
  updateGroupById,
} from "../repositories/groupRepo.js";

import {
  assignRoleToUsers,
  removeRoleFromUsers,
} from "../repositories/userRepo.js";

const ENTITY_TYPE = "Group";

export const createGroupService = async (data, adminSocialIds) => {
  if (!data.name?.trim()) throw new Error("Group name is required.");
  if (!adminSocialIds || adminSocialIds.length === 0)
    throw new Error("At least one Group admin is required.");

  const trimmedName = data.name.trim();
  const existing = await findGroupByName(trimmedName);
  if (existing) throw new Error("Group name already exists.");

  const group = await createGroup({
    subCategoryId: data?.subCategoryId,
    name: trimmedName,
    description: data?.description?.trim(),
    isActive: data?.isActive,
  });

  // Wrap it in an array to reuse existing logic safely
   const adminDocs = adminSocialIds.map((id) => ({
     entityId: group._id,
     entityType: ENTITY_TYPE,
     userSocialId: id,
   }));
   await addMultiAdminMappings(adminDocs);
 
   const message = await assignRoleToUsers(
     adminSocialIds,
     "groupAdmin",
     group._id
   );

  return { group, adminSocialIds, message };
};

export const updateGroupService = async (id, updates, adminSocialIds) => {
  const group = await findGroupById(id);
  if (!group) throw new Error("Group not found.");

  let message = null;

  const newName = updates.name?.trim();
  if (newName && newName !== group.name) {
    const existing = await findGroupByName(newName);
    if (existing) throw new Error("Group name already exists.");
  }

  let updatePayload = {
    subCategoryId: updates?.subCategoryId || group.subCategoryId,
    name: updates.name?.trim() || group.name,
    description: updates.description?.trim() || group.description,
  };
  console.log("updates", updates);
  
  console.log("update payload", updatePayload);
  

  if (typeof updates.isActive === "boolean") {
    updatePayload.isActive = updates.isActive;
  }

  const updatedGroup = await updateGroupById(id, updatePayload);

   let finalAdminSocialIds = adminSocialIds;
  
    if (Array.isArray(adminSocialIds)) {
      if (adminSocialIds.length === 0)
        throw new Error("At least one group admin is required.");
  
      const existingAdmins = (
        await getAdminsForEntity(group._id, ENTITY_TYPE)
      ).map((a) => a.userSocialId);
  
      const newAdmins = adminSocialIds.filter(
        (id) => !existingAdmins.includes(id)
      );
      const removedAdmins = existingAdmins.filter(
        (id) => !adminSocialIds.includes(id)
      );
  
      // Add new admins
      if (newAdmins.length > 0) {
        await Promise.all(
          newAdmins.map((id) => addAdminMapping(group._id, ENTITY_TYPE, id))
        );
        message = await assignRoleToUsers(
          newAdmins,
          "groupAdmin",
          group._id
        );
      }
  
      // Remove admins
      if (removedAdmins.length > 0) {
        await removeAdminMappings(group._id, ENTITY_TYPE, removedAdmins);
        await removeRoleFromUsers(removedAdmins, "groupAdmin", group._id);
      }
  
      finalAdminSocialIds = adminSocialIds;
    }
  

  return { updatedGroup, adminSocialIds: finalAdminSocialIds, message };
};

export const listGroupsService = async ({
  page = 1,
  limit = 10,
  search = "",
}) => {
  const filter = {};

  // case-insensitive partial match
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const { data, total } = await getAllGroups(filter, { page, limit });

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

export const getGroupByIdService = async (groupId) => {
  const group = await findGroupById(groupId);
  if (!group) throw new Error("Group not found.");
  return group;
};

export const getMyGroupsService = async (
  userSocialId,
  { page = 1, limit = 10, search = "" }
) => {
  const filter = {};

  // case-insensitive partial match
  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const { data, total } = await getMyGroups(userSocialId, filter, {
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

export const deleteGroupService = async (id) => {
  const deleted = await deleteGroupById(id);

  if (!deleted) {
    return {
      success: false,
      message: "Group not found",
    };
  }

  return {
    success: true,
    data: deleted,
  };
};
