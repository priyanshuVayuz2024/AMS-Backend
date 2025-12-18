import {
  createAssetAssignment,
  findAssetAssignmentById,
  findAssetAssignment,
  getAllAssetAssignments,
  updateAssetAssignmentById,
 
  deleteAssetAssignmentById,
} from "../repositories/assetAssignmentRepo.js";

/**
 * Create a new asset assignment
 */
export const createAssetAssignmentService = async (data) => {
  // Check if the asset is already assigned to this user
  const existing = await findAssetAssignment({
    entityId: data.entityId,
    userSocialId: data.userSocialId,
  });

  if (existing && existing.status === "assigned") {
    throw new Error("Asset is already assigned to this user.");
  }

  const assignment = await createAssetAssignment({
    entityId: data.entityId,
    userSocialId: data.userSocialId,
    status: data.status || "assigned",
  });

  return { assignment };
};

/**
 * Update an asset assignment (e.g., mark as returned)
 */
export const updateAssetAssignmentService = async (id, updates) => {
  const assignment = await findAssetAssignmentById(id);
  if (!assignment) throw new Error("Assignment not found.");

  const updatePayload = {};
  if (updates.status) {
    if (!["assigned", "returned"].includes(updates.status)) {
      throw new Error("Status must be either 'assigned' or 'returned'.");
    }
    updatePayload.status = updates?.status;
  }
  if(updates.entityId){
    updatePayload.entityId = updates?.entityId;
  }
  if(updates.userSocialId){
    updatePayload.userSocialId = updates?.userSocialId;
  }

  const updatedAssignment = await updateAssetAssignmentById(id, updatePayload);
  return { updatedAssignment };
};

/**
 * List all asset assignments with optional search & pagination
 */
export const listAssetAssignmentsService = async ({ page, limit, search = "" }) => {
  const filter = {};

  if (search) {
    filter.userSocialId = { $regex: search, $options: "i" };
  }

  const { data, total } = await getAllAssetAssignments(filter, { page, limit });

  return {
    data,
    meta: {
      total,
      page: page || 1,
      limit: limit || 10,
      totalPages: page && limit ? Math.ceil(total / limit) : 1,
    },
  };
};


export const getAssetAssignmentByIdService = async (itemId) => {
  const asset = await findAssetAssignmentById(itemId);
  if (!asset) throw new Error("Asset not found.");
  return asset;
};

/**
 * Delete an asset assignment
 */
export const deleteAssetAssignmentService = async (id) => {
  const deleted = await deleteAssetAssignmentById(id);
  if (!deleted) return { success: false, message: "Assignment not found" };

  return { success: true, data: deleted };
};
