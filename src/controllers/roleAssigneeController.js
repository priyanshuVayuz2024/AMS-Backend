import {
  createRoleAssigneeService,
  updateRoleAssigneeService,
  getRoleAssigneeByIdService,
  getRolesBySocialIdService,
  getAssigneesByRoleIdService,
  listRoleAssigneesService,
  deleteRoleAssigneeService,
} from "../services/roleAssigneeService.js";

import {
  sendResponse,
  sendErrorResponse,
  tryCatch,
} from "../util/responseHandler.js";

/**
 * Create Role Assignee
 */
export const createRoleAssignee = tryCatch(async (req, res) => {
  const { roleId, assignedToSocialId, description, isActive } = req.body;

  const { assignee } = await createRoleAssigneeService({
    roleId,
    assignedToSocialId,
    description,
    isActive,
  });

  return sendResponse({
    res,
    statusCode: 201,
    message: "Role assigned successfully",
    data: {
      assignee: assignee.toObject?.() || assignee,
    },
  });
});

/**
 * Update Role Assignee
 */
export const updateRoleAssignee = tryCatch(async (req, res) => {
  const { id } = req.params;
  const {
    roleId,
    assignedToSocialId,
    description,
    isActive,
  } = req.body;

  const { updatedAssignee } = await updateRoleAssigneeService(id, {
    roleId,
    assignedToSocialId,
    description,
    isActive,
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Role assignment updated successfully",
    data: {
      assignee: updatedAssignee.toObject?.() || updatedAssignee,
    },
  });
});


/**
 * Get All Role Assignees (search + optional pagination)
 */
export const getAllRoleAssignees = tryCatch(async (req, res) => {
  const { page, limit, search = "", roleId, isActive } = req.query;

  const payload = {
    search: search.trim(),
    roleId,
  };

  if (isActive !== undefined) {
    if (isActive !== "true" && isActive !== "false") {
      return sendErrorResponse({
        res,
        statusCode: 400,
        message: "'isActive' must be true or false.",
      });
    }
    payload.isActive = isActive === "true";
  }

  if (page !== undefined) {
    const parsedPage = parseInt(page, 10);
    if (isNaN(parsedPage) || parsedPage <= 0) {
      return sendErrorResponse({
        res,
        statusCode: 400,
        message: "'page' must be a positive number.",
      });
    }
    payload.page = parsedPage;
  }

  if (limit !== undefined) {
    const parsedLimit = parseInt(limit, 10);
    if (isNaN(parsedLimit) || parsedLimit <= 0) {
      return sendErrorResponse({
        res,
        statusCode: 400,
        message: "'limit' must be a positive number.",
      });
    }
    payload.limit = parsedLimit;
  }

  const result = await listRoleAssigneesService(payload);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Role assignees fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

/**
 * Get Role Assignee by ID
 */
export const getRoleAssigneeById = tryCatch(async (req, res) => {
  const { id } = req.params;

  const assignee = await getRoleAssigneeByIdService(id);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Role assignee fetched successfully",
    data: assignee,
  });
});

/**
 * Get Roles by Social ID
 */
export const getRolesBySocialId = tryCatch(async (req, res) => {
  const { socialId } = req.params;

  const roles = await getRolesBySocialIdService(socialId);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Roles fetched successfully",
    data: roles,
  });
});

/**
 * Get Assignees by Role ID
 */
export const getAssigneesByRoleId = tryCatch(async (req, res) => {
  const { roleId } = req.params;

  const assignees = await getAssigneesByRoleIdService(roleId);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Role assignees fetched successfully",
    data: assignees,
  });
});

/**
 * Delete Role Assignee
 */
export const deleteRoleAssignee = tryCatch(async (req, res) => {
  const { id } = req.params;

  const result = await deleteRoleAssigneeService(id);

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
    message: "Role assignment deleted successfully",
    data: result.data,
  });
});
