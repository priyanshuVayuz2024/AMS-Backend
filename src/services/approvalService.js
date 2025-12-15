import {
  createApproval,
  findPendingApproval,
  updateApprovalById,
  getApprovalTrail,
  getApprovalsForRequest,
  findNextApprover,
} from "../repositories/approvalRepo.js";

import { getAdminsForEntity } from "../repositories/entityAdminRepo.js";
import { findTransferById } from "../repositories/transferRepo.js";
import { findItemById } from "../repositories/itemRepo.js";

const ENTITY_TYPE = "Transfer";

/**
 * Build approval chain for a transfer request
 */
export const initializeApprovalFlowService = async (transferId) => {
  const transfer = await findTransferById(transferId);
  if (!transfer) throw new Error("Transfer request not found.");

  const item = await findItemById(transfer.itemId);

  const admins = await getAdminsForEntity({
    categoryId: item.categoryId,
    subCategoryId: item.subCategoryId,
    groupId: item.groupId,
  });

  if (!admins?.length) {
    throw new Error("No approvers found for this transfer request.");
  }

  const approvals = [];

  let level = 1;
  for (const admin of admins) {
    approvals.push(
      await createApproval({
        requestId: transferId,
        approverSocialId: admin.socialId,
        level,
        status: "pending",
      })
    );
    level++;
  }

  return approvals;
};

/**
 * Approve / Reject Request
 */
export const approveOrRejectService = async (
  requestId,
  approverSocialId,
  action
) => {
  const allowed = ["approved", "rejected"];
  if (!allowed.includes(action)) throw new Error("Invalid action.");

  const approval = await findPendingApproval(requestId);
  if (!approval) throw new Error("No pending approval found.");

  if (approval.approverSocialId !== approverSocialId) {
    throw new Error("You are not authorized to approve this request.");
  }

  const updated = await updateApprovalById(approval._id, {
    status: action,
    actedAt: new Date(),
  });

  if (action === "rejected") {
    return { message: "Request rejected.", level: approval.level };
  }

  const next = await findNextApprover(requestId, approval.level);

  if (!next) {
    return { message: "Request fully approved." };
  }

  return {
    message: "Approval recorded. Next approver must approve.",
    nextApprover: next.approverSocialId,
  };
};

/**
 * Get Approval Trail
 */
export const getApprovalTrailService = async (requestId) => {
  const approvals = await getApprovalTrail(requestId);

  return {
    requestId,
    approvals,
  };
};

/**
 * Get All Approvals for a Request
 */
export const getApprovalsService = async (requestId) => {
  return await getApprovalsForRequest(requestId);
};
