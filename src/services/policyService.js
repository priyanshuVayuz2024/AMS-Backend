import { addAdminMapping, addMultiAdminMappings, getAdminsForEntity } from "../repositories/entityAdminRepo.js";
import {
  createPolicy,
  deletePolicyById,
  findPolicyById,
  getAllPolicy,
  getMyPolicy,
  updatePolicyById,
} from "../repositories/policyRepo.js";
import { v4 as uuidv4 } from "uuid";
const ENTITY_TYPE = "Policy";

export const createPolicyService = async (data, adminSocialIds) => {
  if (!adminSocialIds) throw new Error("Assigned user is required.");
  if (!data.parentType) throw new Error("Parent type is required.");
  if (!data.parentId) throw new Error("Parent ID is required.");

  console.log(adminSocialIds, "adinids");
  
  const policy = await createPolicy({
    url: data.url,
    description: data?.description?.trim(),
    parentType: data.parentType,
    parentId: data.parentId,
    isActive: data?.isActive,
  });

  const adminDocs = adminSocialIds?.map((id) => ({
    entityId: policy._id,
    entityType: ENTITY_TYPE,
    userSocialId: id,
  }));
  await addMultiAdminMappings(adminDocs);

  return {
    policy,
    adminSocialIds,
    message: "Policy created successfully and assigned.",
  };
};

export const updatePolicyService = async (id, updates, adminSocialIds) => {
  const policy = await findPolicyById(id);
  if (!policy) throw new Error("Policy not found.");

  const updatePayload = {};

  if (updates.policyId) updatePayload.policyId = updates.policyId.trim();
  if (updates.description)
    updatePayload.description = updates.description.trim();
  if (updates.url) updatePayload.url = updates.url;

  if (typeof updates.isActive === "boolean") {
    updatePayload.isActive = updates.isActive;
  }


  const updatedPolicy = await updatePolicyById(id, updatePayload);

  let finalAdminSocialIds = adminSocialIds;

  if (Array.isArray(adminSocialIds)) {
    if (adminSocialIds.length === 0)
      throw new Error("At least one category admin is required.");

    const existingAdmins = (
      await getAdminsForEntity(policy._id, ENTITY_TYPE)
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
        newAdmins.map((id) => addAdminMapping(policy._id, ENTITY_TYPE, id))
      );
    }

    // Remove admins
    if (removedAdmins.length > 0) {
      await removeAdminMappings(policy._id, ENTITY_TYPE, removedAdmins);
    }

    finalAdminSocialIds = adminSocialIds;
  }

  return {
    updatedPolicy,
    adminSocialIds: finalAdminSocialIds,
    message: "Policy updated successfully.",
  };
};

export const listPolicyService = async ({
  page = 1,
  limit = 10,
  search = "",
}) => {
  const filter = {};

  if (search) {
    filter.policyId = { $regex: search, $options: "i" };
  }

  const { data, total } = await getAllPolicy(filter, { page, limit });

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

export const getPolicyByIdService = async (policyId) => {
  const policy = await findPolicyById(policyId);
  if (!policy) throw new Error("Policy not found.");
  return policy;
};

export const getMyPolicyService = async (
  userSocialId,
  { page = 1, limit = 10, search = "" }
) => {
  const filter = {};

  if (search) {
    filter.policyId = { $regex: search, $options: "i" };
  }

  const { data, total } = await getMyPolicy(userSocialId, filter, {
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

export const deletePolicyService = async (id) => {
  const deleted = await deletePolicyById(id);

  if (!deleted) {
    return {
      success: false,
      message: "Policy not found",
    };
  }

  return {
    success: true,
    data: deleted,
  };
};
