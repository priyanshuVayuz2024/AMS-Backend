import TransferRequest from "../models/TransferRequestModel.js"

/**
 * Create a new transfer request
 */
export const createTransfer = async (data) => {
  return await TransferRequest.create(data);
};

/**
 * Find transfer by ID
 */
export const findTransferById = async (id) => {
  return await TransferRequest.findById(id).lean();
};

/**
 * Update transfer by ID
 */
export const updateTransferById = async (id, updateData) => {
  return await TransferRequest.findByIdAndUpdate(id, updateData, { new: true }).lean();
};

/**
 * Delete transfer by ID
 */
export const deleteTransferById = async (id) => {
  return await TransferRequest.findByIdAndDelete(id).lean();
};

/**
 * Get ALL transfers with pagination + filter
 */
export const getAllTransfersRepo = async (filter = {}, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  const [transfers, total] = await Promise.all([
    TransferRequest.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    TransferRequest.countDocuments(filter),
  ]);

  return { transfers, total };
};

/**
 * Get transfers created by a specific user
 */
export const getMyTransfersRepo = async (userSocialId, filter = {}, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  const query = {
    requestedBySocialId: userSocialId,
    ...filter,
  };

  const [transfers, total] = await Promise.all([
    TransferRequest.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    TransferRequest.countDocuments(query),
  ]);

  return { transfers, total };
};
