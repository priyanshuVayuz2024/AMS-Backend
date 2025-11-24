import PolicyModel from "../models/PolicyModel.js";
import EntityAdminMapping from "../models/EntityAdminMappingModel.js";

export const createPolicy = async (policyData) => {
  return await PolicyModel.create(policyData);
};

export const findPolicyById = async (id) => {
  return await PolicyModel.findById(id);
};

export const updatePolicyById = async (id, updateData) => {
  return await PolicyModel.findByIdAndUpdate(id, updateData, { new: true });
};

export const deletePolicyById = async (id) => {
  return await PolicyModel.findByIdAndDelete(id);
};

/**
 * Get all policies (admin / super admin)
 */
export const getAllPolicy = async (filter = {}, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    PolicyModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    PolicyModel.countDocuments(filter)
  ]);

  return { data, total };
};

/**
 * Get policies only assigned to the logged-in user (Policy responsibility)
 */
export const getMyPolicy = async (userSocialId, filter = {}, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  const query = {
    assignedToSocialId: userSocialId,
    ...filter
  };

  const [data, total] = await Promise.all([
    PolicyModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    PolicyModel.countDocuments(query)
  ]);

  return { data, total };
};
