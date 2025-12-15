import {
  createRoleService,
  deleteRoleService,
  getRoleByIdService,
  listRolesService,
  updateRoleService,
} from "../services/roleService.js";

import {
  sendResponse,
  sendErrorResponse,
  tryCatch,
} from "../util/responseHandler.js";

/**
 * Create Role
 */
export const createRole = tryCatch(async (req, res) => {
  const { name, description, modules } = req.body;

  const { role } = await createRoleService({ name, description, modules });

  return sendResponse({
    res,
    statusCode: 201,
    message: "Role created successfully",
    data: {
      role: role.toObject?.() || role,
    },
  });
});

/**
 * Update Role
 */
export const updateRole = tryCatch(async (req, res) => {
  const { id } = req.params;
  const { name, description, modules, isActive } = req.body;

  const { updatedRole } = await updateRoleService(id, {
    name,
    description,
    modules,
    isActive    
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Role updated successfully",
    data: {
      role: updatedRole.toObject?.() || updatedRole,
    },
  });
});

/**
 * Get All Roles (search + optional pagination)
 */
export const getAllRoles = tryCatch(async (req, res) => {
  const { page, limit, search = "" } = req.query;

  const payload = {
    search: search.trim(),
  };

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

  const result = await listRolesService(payload);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Roles fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

/**
 * Get Role by ID
 */
export const getRoleById = tryCatch(async (req, res) => {
  const { id } = req.params;

  const role = await getRoleByIdService(id);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Role fetched successfully",
    data: role,
  });
});

/**
 * Delete Role
 */
export const deleteRole = tryCatch(async (req, res) => {
  const { id } = req.params;

  const result = await deleteRoleService(id);

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
    message: "Role deleted successfully",
    data: result.data,
  });
});
