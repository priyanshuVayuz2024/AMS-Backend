import ApproveModel from "../models/ApproveModel.js";


/**
 * Create approval record for a level
 */
export const createApproval = async (data) => {
  return await ApproveModel.create(data);
};

/**
 * Get ALL approvals for a specific request (transfer/report/etc.)
 */
export const getApprovalsForRequest = async (requestId) => {
  return await ApproveModel.find({ requestId }).sort({ level: 1 }).lean();
};

/**
 * Find the pending approval entry (who needs to approve now)
 */
export const findPendingApproval = async (requestId) => {
  return await ApproveModel.findOne({
    requestId,
    status: "pending",
  })
    .sort({ level: 1 })
    .lean();
};

/**
 * Update approval entry
 */
export const updateApprovalById = async (id, updateData) => {
  return await ApproveModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
};

/**
 * Get approval trail (history)
 */
export const getApprovalTrail = async (requestId) => {
  return await ApproveModel.find({ requestId }).sort({ level: 1 }).lean();
};

/**
 * Find next approver after given level
 */
export const findNextApprover = async (requestId, currentLevel) => {
  return await ApproveModel.findOne({
    requestId,
    level: { $gt: currentLevel },
  })
    .sort({ level: 1 })
    .lean();
};
