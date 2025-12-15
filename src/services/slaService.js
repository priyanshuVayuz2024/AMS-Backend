import { addAdminMapping, addMultiAdminMappings, getAdminsForEntity } from "../repositories/entityAdminRepo.js";
import {
  createSla,
  deleteSlaById,
  findSlaById,
  getAllSla,
  getMySla,
  updateSlaById,
} from "../repositories/slaRepo.js";
import { v4 as uuidv4 } from "uuid";
const ENTITY_TYPE = "Sla";

export const createSlaService = async (data, adminSocialIds) => {
  if (!adminSocialIds) throw new Error("Assigned user is required.");
  if (!data.parentType) throw new Error("Parent type is required.");
  if (!data.parentId) throw new Error("Parent ID is required.");

  
  const sla = await createSla({
    url: data.url,
    description: data?.description?.trim(),
    parentType: data.parentType,
    parentId: data.parentId,
    isActive: data?.isActive,
  });

  const adminDocs = adminSocialIds?.map((id) => ({
    entityId: sla._id,
    entityType: ENTITY_TYPE,
    userSocialId: id,
  }));
  await addMultiAdminMappings(adminDocs);

  return {
    sla,
    adminSocialIds,
    message: "Sla created successfully and assigned.",
  };
};

export const updateSlaService = async (id, updates, adminSocialIds) => {
  const sla = await findSlaById(id);
  if (!sla) throw new Error("Sla not found.");

  const updatePayload = {};

  if (updates.slaId) updatePayload.slaId = updates.slaId.trim();
  if (updates.description)
    updatePayload.description = updates.description.trim();
  if (updates.url) updatePayload.url = updates.url;

  if (typeof updates.isActive === "boolean") {
    updatePayload.isActive = updates.isActive;
  }


  const updatedSla = await updateSlaById(id, updatePayload);

  let finalAdminSocialIds = adminSocialIds;

  if (Array.isArray(adminSocialIds)) {
    if (adminSocialIds.length === 0)
      throw new Error("At least one sla admin is required.");

    const existingAdmins = (
      await getAdminsForEntity(sla._id, ENTITY_TYPE)
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
        newAdmins.map((id) => addAdminMapping(sla._id, ENTITY_TYPE, id))
      );
    }

    // Remove admins
    if (removedAdmins.length > 0) {
      await removeAdminMappings(sla._id, ENTITY_TYPE, removedAdmins);
    }

    finalAdminSocialIds = adminSocialIds;
  }

  return {
    updatedSla,
    adminSocialIds: finalAdminSocialIds,
    message: "Sla updated successfully.",
  };
};

export const listSlaService = async ({
  page = 1,
  limit = 10,
  search = "",
}) => {
  const filter = {};

  if (search) {
    filter.slaId = { $regex: search, $options: "i" };
  }

  const { data, total } = await getAllSla(filter, { page, limit });

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

export const getSlaByIdService = async (slaId) => {
  const sla = await findSlaById(slaId);
  if (!sla) throw new Error("Sla not found.");
  return sla;
};

export const getMySlaService = async (
  userSocialId,
  { page = 1, limit = 10, search = "" }
) => {
  const filter = {};

  if (search) {
    filter.slaIdId = { $regex: search, $options: "i" };
  }

  const { data, total } = await getMySla(userSocialId, filter, {
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

export const deleteSlaService = async (id) => {
  const deleted = await deleteSlaById(id);

  if (!deleted) {
    return {
      success: false,
      message: "Sla not found",
    };
  }

  return {
    success: true,
    data: deleted,
  };
};
