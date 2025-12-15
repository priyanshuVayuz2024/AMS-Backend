// services/transferService.js

import {
  createTransfer,
  deleteTransferById,
  findTransferById,
  getAllTransfersRepo,
  getMyTransfersRepo,
  updateTransferById,
} from "../repositories/transferRepo.js";

import { findItemById } from "../repositories/itemRepo.js";
import TransferRequest from "../models/TransferRequestModel.js";
/**
 * Create Transfer Request
 */
export const createTransferService = async (data, requesterSocialId) => {
  if (!requesterSocialId?.trim()) {
    throw new Error("Requester socialId is required.");
  }

  if (!data?.itemId) {
    throw new Error("Item ID is required.");
  }

  if (!data?.targetGroupId) {
    throw new Error("Target group ID is required.");
  }

  // Create transfer
  const transfer = await createTransfer({
    requestedBySocialId: requesterSocialId.trim(),
    itemId: data.itemId,
    targetGroupId: data.targetGroupId,
    reason: data?.reason?.trim() || "",
    status: "pending",
  });

  // Attach item/category/subcategory
  const item = await findItemById(data.itemId);

  return {
    ...transfer.toObject(),
    itemName: item?.name || null,
    categoryName: item?.categoryName || null,
    subCategoryName: item?.subCategoryName || null,
    categoryId: item?.categoryId || null,
    subCategoryId: item?.subCategoryId || null,
  };
};

/**
 * Update Transfer Request
 */
export const updateTransferService = async (id, updates) => {
  const transfer = await TransferRequest.findById(id);
  if (!transfer) throw new Error("Transfer request not found.");

  const payload = {};

  if (typeof updates.reason === "string") {
    payload.reason = updates.reason.trim();
  }

  if (updates.status) {
    const allowed = ["pending", "approved", "rejected", "cancelled"];
    if (!allowed.includes(updates.status)) throw new Error("Invalid status value.");

    payload.status = updates.status;
  }

  const updatedTransfer = await updateTransferById(id, payload);

  const item = await findItemById(updatedTransfer.itemId);

  return {
    ...updatedTransfer,
    itemName: item?.name || null,
    categoryName: item?.categoryName || null,
    subCategoryName: item?.subCategoryName || null,
    categoryId: item?.categoryId || null,
    subCategoryId: item?.subCategoryId || null,
  };
};

/**
 * Get All Transfers
 */
export const listTransfersService = async ({ page = 1, limit = 10, filter = {} } = {}) => {
  const { transfers, total } = await getAllTransfersRepo(filter, { page, limit });

  const updated = await Promise.all(
    transfers.map(async (t) => {
      const item = await findItemById(t.itemId);
      return {
        ...t,
        itemName: item?.name || null,
        categoryName: item?.categoryName || null,
        subCategoryName: item?.subCategoryName || null,
        categoryId: item?.categoryId || null,
        subCategoryId: item?.subCategoryId || null,
      };
    })
  );

  return {
    data: updated,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Find Transfer by ID
 */
export const findTransferByIdService = async (id) => {
  const transfer = await findTransferById(id);
  if (!transfer) return null;

  const item = await findItemById(transfer.itemId);

  return {
    ...transfer,
    itemName: item?.name || null,
    categoryName: item?.categoryName || null,
    subCategoryName: item?.subCategoryName || null,
    categoryId: item?.categoryId || null,
    subCategoryId: item?.subCategoryId || null,
  };
};

/**
 * Get My Transfers
 */
export const getMyTransfersService = async (
  userSocialId,
  { page = 1, limit = 10, filter = {} } = {}
) => {
  const { transfers, total } = await getMyTransfersRepo(userSocialId, filter, { page, limit });

  const updated = await Promise.all(
    transfers.map(async (t) => {
      const item = await findItemById(t.itemId);
      return {
        ...t,
        itemName: item?.name || null,
        categoryName: item?.categoryName || null,
        subCategoryName: item?.subCategoryName || null,
        categoryId: item?.categoryId || null,
        subCategoryId: item?.subCategoryId || null,
      };
    })
  );

  return {
    data: updated,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Delete Transfer
 */
export const deleteTransferService = async (id) => {
  const deleted = await deleteTransferById(id);

  if (!deleted) {
    return { success: false, message: "Transfer not found" };
  }

  return { success: true, data: deleted };
};
