import {
  createModuleService,
  deleteModuleService,
  getModuleByIdService,
  listActiveModulesService,
  listModulesService,
  updateModuleService,
} from "../services/moduleService.js";

import {
  sendResponse,
  sendErrorResponse,
  tryCatch,
} from "../util/responseHandler.js";

/**
 * Create Module
 */
export const createModule = tryCatch(async (req, res) => {
  const { name, description } = req.body;

  const { module } = await createModuleService({ name, description });

  return sendResponse({
    res,
    statusCode: 201,
    message: "Module created successfully",
    data: {
      module: module.toObject?.() || module,
    },
  });
});

/**
 * Update Module
 */
export const updateModule = tryCatch(async (req, res) => {
  const { id } = req.params;
  const { name, description, isActive } = req.body;

  const { updatedModule } = await updateModuleService(id, {
    name,
    description,
    isActive,
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Module updated successfully",
    data: {
      module: updatedModule.toObject?.() || updatedModule,
    },
  });
});

/**
 * Get All Modules (search + optional pagination)
 */
export const getAllModules = tryCatch(async (req, res) => {
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

  const loggedInUser = req.user;
  
  const result = await listModulesService(payload, loggedInUser);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Modules fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});


export const listActiveModulesController = tryCatch(async (req, res) => {
  const { search } = req.query;

  const result = await listActiveModulesService(
    { search },
    req.user
  );

  return sendResponse({
    res,
    statusCode: 200,
    message: "Active modules fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});


/* 
 Get Module by ID
*/
export const getModuleById = tryCatch(async (req, res) => {
  const { id } = req.params;

  const module = await getModuleByIdService(id);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Module fetched successfully",
    data: module,
  });
});

/**
 * Delete Module
 */
export const deleteModule = tryCatch(async (req, res) => {
  const { id } = req.params;

  const result = await deleteModuleService(id);

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
    message: "Module deleted successfully",
    data: result.data,
  });
});
