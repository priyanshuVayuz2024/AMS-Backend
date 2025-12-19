import {
  createAssetAssignmentService,
  updateAssetAssignmentService,
  listAssetAssignmentsService,
  deleteAssetAssignmentService,
  getAssetAssignmentByIdService,
} from "../services/assetAssignmentService.js";

import {
  sendResponse,
  sendErrorResponse,
  tryCatch,
} from "../util/responseHandler.js";

/**
 * Assign asset to user
 */
export const createAssetAssignment = tryCatch(async (req, res) => {
  const { entityId, userSocialId, status } = req.body;

  const { assignment } = await createAssetAssignmentService({
    entityId,
    userSocialId,
    status,
  });

  return sendResponse({
    res,
    statusCode: 201,
    message: "Asset assigned successfully",
    data: assignment,
  });
});

/**
 * Update asset assignment (assign / return)
 */
export const updateAssetAssignment = tryCatch(async (req, res) => {
  const { id } = req.params;
  const { status, entityId, userSocialId } = req.body;

  const { updatedAssignment } = await updateAssetAssignmentService(id, {
    status,
    entityId,
    userSocialId
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Asset assignment updated successfully",
    data: updatedAssignment,
  });
});

/**
 * List asset assignments (search + optional pagination)
 */
export const getAllAssetAssignments = tryCatch(async (req, res) => {
  const { page, limit, search = "" } = req.query;

  // Parse pagination
  const parsedPage = page ? parseInt(page, 10) : 1;
  const parsedLimit = limit ? parseInt(limit, 10) : 10;

  if (isNaN(parsedPage) || isNaN(parsedLimit) || parsedPage <= 0 || parsedLimit <= 0) {
    return sendErrorResponse({
      res,
      statusCode: 400,
      message: "Invalid pagination parameters. 'page' and 'limit' must be positive numbers.",
    });
  }

  // ✅ Pass user and read-only flag to service
  const options = {
    page: parsedPage,
    limit: parsedLimit,
    search: search.trim(),
    user: req.user,                        // 👈 pass logged-in user
    isStrictReadOnly: req.isStrictReadOnly || false, // 👈 pass read-only flag
  };

  const result = await listAssetAssignmentsService(options);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Asset assignments fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});


/**
 * Get a single asset by ID
 */
export const getAssetAssignmentById = tryCatch(async (req, res) => {
  const { id } = req.params;
  
  const asset = await getAssetAssignmentByIdService(id);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Asset fetched successfully",
    data: asset,
  });
});

/**
 * Delete asset assignment
 */
export const deleteAssetAssignment = tryCatch(async (req, res) => {
  const { id } = req.params;

  const result = await deleteAssetAssignmentService(id);

  if (!result.success) {
    return sendErrorResponse({
      res,
      statusCode: 404,
      message: result.message,
    });
  }

  return sendResponse({
    res,
    statusCode: 200,
    message: "Asset assignment deleted successfully",
    data: result.data,
  });
});
