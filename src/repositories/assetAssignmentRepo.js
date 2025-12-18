import EntityAdminMapping from "../models/EntityAdminMappingModel.js"; // rename model file later if you want

/**
 * Create a new asset assignment
 */
export const createAssetAssignment = async (data) => {
  return await EntityAdminMapping.create(data);
};

/**
 * Find assignment by ID
 */
export const findAssetAssignmentById = async (id) => {
  return await EntityAdminMapping.findById(id).lean();
};

/**
 * Update assignment by ID
 */
export const updateAssetAssignmentById = async (id, updateData) => {
  return await EntityAdminMapping.findByIdAndUpdate(id, updateData, { new: true });
};

/**
 * Find assignment by assetId and userSocialId
 */
export const findAssetAssignment = async ({ entityId, userSocialId }) => {
  return await EntityAdminMapping.findOne({ entityId, userSocialId }).lean();
};

/**
 * Get all assignments with optional filters and pagination
 */
export const getAllAssetAssignments = async (
  filter = {},
  { page, limit } = {}
) => {
  const query = EntityAdminMapping.find(filter).sort({ createdAt: -1 }).lean();
  const total = await EntityAdminMapping.countDocuments(filter);

  if (page && limit) {
    const skip = (Number(page) - 1) * Number(limit);
    query.skip(skip).limit(Number(limit));
  }

  const data = await query;
  return { data, total };
};

/**
 * Get assignments assigned to a specific user
 */
export const getAssignmentsByUser = async (
  userSocialId,
  filter = {},
  { page = 1, limit = 10 } = {}
) => {
  const queryFilter = { userSocialId, ...filter };
  const skip = (Number(page) - 1) * Number(limit);

  const [data, total] = await Promise.all([
    EntityAdminMapping.find(queryFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    EntityAdminMapping.countDocuments(queryFilter),
  ]);

  return { data, total };
};

/**
 * Get assignments for a specific asset
 */
export const getAssignmentsByAsset = async (entityId, filter = {}) => {
  return await EntityAdminMapping.find({ entityId, ...filter }).lean();
};

/**
 * Delete assignment by ID
 */
export const deleteAssetAssignmentById = async (id) => {
  return await EntityAdminMapping.findByIdAndDelete(id);
};
