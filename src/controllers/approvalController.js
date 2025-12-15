import {
  initializeApprovalFlowService,
  approveOrRejectService,
  getApprovalTrailService,
  getApprovalsService,
} from "../services/approvalService.js";

/**
 * Initialize Approval Flow for a Transfer
 */
export const initializeApprovalFlow = async (req, res) => {
  try {
    const { transferId } = req.params;
    const approvals = await initializeApprovalFlowService(transferId);

    res.status(201).json({ success: true, data: approvals });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Approve or Reject a Transfer Request
 */
export const approveOrReject = async (req, res) => {
  try {
    const { requestId } = req.params;
    const { approverSocialId, action } = req.body;

    const result = await approveOrRejectService(requestId, approverSocialId, action);
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Get Approval Trail for a Transfer Request
 */
export const getApprovalTrail = async (req, res) => {
  try {
    const { requestId } = req.params;
    const trail = await getApprovalTrailService(requestId);

    res.status(200).json({ success: true, data: trail });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Get All Approvals for a Request
 */
export const getApprovals = async (req, res) => {
  try {
    const { requestId } = req.params;
    const approvals = await getApprovalsService(requestId);

    res.status(200).json({ success: true, data: approvals });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};
