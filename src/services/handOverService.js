import {
  createHandoverRepo,
  deleteHandoverById,
  findHandoverById,
  getAllHandoversRepo,
  getMyHandoversRepo,
  updateHandoverById,
} from "../repositories/handOverRepo.js";
import { findItemById } from "../repositories/itemRepo.js";

export const createHandoverService = async (data, fromSocialId) => {
  if (!fromSocialId?.trim()) {
    throw new Error("Sender socialId (fromSocialId) is required.");
  }

  if (!data?.itemId) {
    throw new Error("Item ID is required.");
  }

  if (!data?.transferRequestId) {
    throw new Error("Transfer request ID is required.");
  }

  if (!data?.toSocialId?.trim()) {
    throw new Error("Receiver socialId (toSocialId) is required.");
  }

  const handover = await createHandoverRepo({
    itemId: data.itemId,
    transferRequestId: data.transferRequestId,
    fromSocialId: fromSocialId.trim(),
    toSocialId: data.toSocialId.trim(),
    notes: data?.notes?.trim() || "",
    receiverAcknowledged: false,
    status: "handover-in-progress",
  });

  const asset = await findItemById(data.itemId);

  return {
    ...handover.toObject(),
    assetId: asset?._id || null,
    assetName: asset?.name || null,
    categoryName: asset?.categoryName || null,
    subCategoryName: asset?.subCategoryName || null,
    categoryId: asset?.categoryId || null,
    subCategoryId: asset?.subCategoryId || null,
  };
};

export const updateHandoverService = async (id, updates = {}) => {
  const existing = await findHandoverById(id);
  if (!existing) throw new Error("Handover not found.");

  const updatePayload = {};

  if (typeof updates.notes === "string") {
    updatePayload.notes = updates.notes.trim();
  }

  
  if (updates.status) {
    const allowedStatuses = [
      "pending",
      "handover-in-progress",
      "completed",
      "cancelled",
    ];

    if (!allowedStatuses.includes(updates.status)) {
      throw new Error("Invalid status value.");
    }

    updatePayload.status = updates.status;
  }

  if (Object.keys(updatePayload).length === 0) {
    throw new Error("No valid update fields provided.");
  }

  const updated = await updateHandoverById(id, updatePayload);
  if (!updated) throw new Error("Handover not found.");

  const asset = await findItemById(updated.itemId);

  return {
    ...updated,
    assetId: asset?._id || null,
    assetName: asset?.name || null,
    categoryName: asset?.categoryName || null,
    subCategoryName: asset?.subCategoryName || null,
    categoryId: asset?.categoryId || null,
    subCategoryId: asset?.subCategoryId || null,
  };
};


export const acknowledgeHandoverService = async (id, receiverSocialId) => {
  const handover = await findHandoverById(id);
  if (!handover) throw new Error("Handover not found.");

  if (handover.toSocialId !== receiverSocialId) {
    throw new Error("Only the receiver can acknowledge this handover.");
  }

  const updated = await updateHandoverById(id, {
    receiverAcknowledged: true,
    status: "completed",
  });

  return updated;
};


export const listHandoversService = async ({
  page = 1,
  limit = 10,
  filter = {},
} = {}) => {
  const { handovers, total } = await getAllHandoversRepo(filter, {
    page,
    limit,
  });

  const enriched = await Promise.all(
    handovers.map(async (record) => {
      const asset = await findItemById(record.itemId);

      return {
        ...record,
        assetId: asset?._id || null,
        assetName: asset?.name || null,
        categoryName: asset?.categoryName || null,
        subCategoryName: asset?.subCategoryName || null,
        categoryId: asset?.categoryId || null,
        subCategoryId: asset?.subCategoryId || null,
      };
    })
  );

  return {
    data: enriched,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const findHandoverByIdService = async (id) => {
  const handover = await findHandoverById(id);
  if (!handover) return null;

  const asset = await findItemById(handover.itemId);

  return {
    ...handover,
    assetId: asset?._id || null,
    assetName: asset?.name || null,
    categoryName: asset?.categoryName || null,
    subCategoryName: asset?.subCategoryName || null,
    categoryId: asset?.categoryId || null,
    subCategoryId: asset?.subCategoryId || null,
  };
};

export const getMyHandoversService = async (
  userSocialId,
  { role = "both", page = 1, limit = 10, filter = {} } = {}
) => {
  const { handovers, total } = await getMyHandoversRepo(
    userSocialId,
    role,
    filter,
    { page, limit }
  );

  const enriched = await Promise.all(
    handovers.map(async (record) => {
      const asset = await findItemById(record.itemId);

      return {
        ...record,
        assetId: asset?._id || null,
        assetName: asset?.name || null,
        categoryName: asset?.categoryName || null,
        subCategoryName: asset?.subCategoryName || null,
        categoryId: asset?.categoryId || null,
        subCategoryId: asset?.subCategoryId || null,
      };
    })
  );

  return {
    data: enriched,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

export const deleteHandoverService = async (id) => {
  const deleted = await deleteHandoverById(id);

  if (!deleted) {
    return {
      success: false,
      message: "Handover not found",
    };
  }

  return {
    success: true,
    data: deleted,
  };
};
