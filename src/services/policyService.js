import {
  createPolicy,
  findPolicyById,
  getAllPolicy,
  getMyPolicy,
  updatePolicyById,
} from "../repositories/policyRepo.js";
import { v4 as uuidv4 } from "uuid";
const ENTITY_TYPE = "Policy";

export const createPolicyService = async (data, assignedToSocialId) => {
  if (!assignedToSocialId) throw new Error("Assigned user is required.");
  if (!data.parentType) throw new Error("Parent type is required.");
  if (!data.parentId) throw new Error("Parent ID is required.");

  const policy = await createPolicy({
    url: data.url,
    description: data?.description?.trim(),
    parentType: data.parentType,
    parentId: data.parentId,
    assignedToSocialId,
    isActive: data?.isActive,
  });

  return { policy, message: "Policy created successfully and assigned." };
};

export const updatePolicyService = async (id, updates, assignedToSocialId) => {
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

  if (assignedToSocialId) updatePayload.assignedToSocialId = assignedToSocialId;

  const updatedPolicy = await updatePolicyById(id, updatePayload);

  return { updatedPolicy, message: "Policy updated successfully." };
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
