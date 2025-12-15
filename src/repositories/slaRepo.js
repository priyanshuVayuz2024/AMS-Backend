import SlaModel from "../models/SlaModel.js";
import EntityAdminMapping from "../models/EntityAdminMappingModel.js";

export const createSla = async (slaData) => {
  return await SlaModel.create(slaData);
};

export const findSlaById = async (id) => {
  return await SlaModel.findById(id);
};

export const updateSlaById = async (id, updateData) => {
  return await SlaModel.findByIdAndUpdate(id, updateData, { new: true });
};

export const deleteSlaById = async (id) => {
  await EntityAdminMapping.deleteMany({
    entityId: id,
    entityType: "Sla",
  });

  return await SlaModel.findByIdAndDelete(id);
};

/**
 * Get all sla (admin / super admin)
 */
export const getAllSla = async (filter = {}, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    SlaModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    SlaModel.countDocuments(filter)
  ]);

  return { data, total };
};

/**
 * Get policies only assigned to the logged-in user (Sla responsibility)
 */
export const getMySla = async (userSocialId, filter = {}, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  const query = {
    assignedToSocialId: userSocialId,
    ...filter
  };

  const [data, total] = await Promise.all([
    SlaModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    SlaModel.countDocuments(query)
  ]);

  return { data, total };
};
