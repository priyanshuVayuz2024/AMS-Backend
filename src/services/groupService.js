import SubCategory from "../models/SubCategoryModel.js";
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
  getAssignedGroups,
  getUserCreatedGroups,
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
    createdBy: data.createdBy,
  });

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

const enrichWithSubCategoryName = async (data) => {
  const subCategoryIds = [...new Set(data.map(sc => sc.subCategoryId))];

  const subCategories = await SubCategory.find(
    { _id: { $in: subCategoryIds } },
    { name: 1 }
  );

  const subCategoryNameMap = new Map();
  subCategories.forEach(cat =>
    subCategoryNameMap.set(cat._id.toString(), cat.name)
  );

  return data.map(sc => {
    const obj = sc.toObject ? sc.toObject() : sc;
    return {
      ...obj,
      subCategoryName: subCategoryNameMap.get(obj.subCategoryId.toString()),
    };
  });
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

    if (newAdmins.length > 0) {
      await Promise.all(
        newAdmins.map((id) => addAdminMapping(group._id, ENTITY_TYPE, id))
      );
      message = await assignRoleToUsers(newAdmins, "groupAdmin", group._id);
    }

    if (removedAdmins.length > 0) {
      await removeAdminMappings(group._id, ENTITY_TYPE, removedAdmins);
      await removeRoleFromUsers(removedAdmins, "groupAdmin", group._id);
    }

    finalAdminSocialIds = adminSocialIds;
  }

  return { updatedGroup, adminSocialIds: finalAdminSocialIds, message };
};

export const listGroupsService = async ({
  page,
  limit,
  search = "",
  subCategoryId,
}) => {
  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  if (subCategoryId) {
    filter.subCategoryId = subCategoryId;
  }

  const { data, total } = await getAllGroups(filter, { page, limit });
  const subCategoryIds = [...new Set(data.map((g) => g.subCategoryId))];
  const subCategories = await SubCategory.find(
    { _id: { $in: subCategoryIds } },
    { name: 1 }
  );

  const subCategoryNameMap = new Map();
  subCategories.forEach((sc) =>
    subCategoryNameMap.set(sc._id.toString(), sc.name)
  );

  const enrichedData = await Promise.all(
    data.map(async (group) => {
      const groupObj = group.toObject ? group.toObject() : group;

      groupObj.subCategoryName = subCategoryNameMap.get(
        groupObj.subCategoryId?.toString()
      );

      const adminMappings = await getAdminsForEntity(
        group._id,
        ENTITY_TYPE 
      );

      const adminSocialIds = (adminMappings || []).map(
        (mapping) => mapping.userSocialId
      );

      return {
        ...groupObj,
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


export const getGroupByIdService = async (groupId) => {
  if (!groupId) {
    throw new Error("Group ID is required");
  }

  const group = await findGroupById(groupId);

  if (!group) {
    throw new Error("Group not found.");
  }

  const groupObj = group.toObject ? group.toObject() : group;

  const adminMappings = await getAdminsForEntity(
    group._id,
    ENTITY_TYPE 
  );

  const adminSocialIds = (adminMappings || []).map(
    (mapping) => mapping.userSocialId
  );

  return {
    ...groupObj,
    adminSocialIds, 
  };
};

export const getAssignedGroupsService = async (
  userSocialId,
  { page, limit, search = "", subCategoryId }
) => {
  const filter = {};

  if (search) filter.name = { $regex: search, $options: "i" };

  if (subCategoryId) filter.subCategoryId = subCategoryId;

  const { data, total } = await getAssignedGroups(userSocialId, filter, {
    page,
    limit,
  });
  

  const enrichedData = await enrichWithSubCategoryName(data);

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

export const getUserCreatedGroupsService = async (
  userSocialId,
  { page, limit, search = "", subCategoryId }
) => {
  const filter = {};

  if (search) filter.name = { $regex: search, $options: "i" };

  if (subCategoryId) filter.subCategoryId = subCategoryId;

  const { data, total } = await getUserCreatedGroups(userSocialId, filter, {
    page,
    limit,
  });

  const enrichedData = await enrichWithSubCategoryName(data);

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
