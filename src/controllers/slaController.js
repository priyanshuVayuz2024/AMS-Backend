import {
  createSlaService,
  getSlaByIdService,
  listSlaService,
  updateSlaService,
  getMySlaService,
  deleteSlaService,
} from "../services/slaService.js";

import {
  sendResponse,
  sendErrorResponse,
  tryCatch,
} from "../util/responseHandler.js";

export const createSla = tryCatch(async (req, res) => {
  let {
    slaId,
    url,
    description,
    parentType,
    parentId,
    adminSocialIds,
    isActive,
  } = req.body;

  const {
    sla,
    adminSocialIds: admins,
    message,
  } = await createSlaService(
    {
      slaId,
      url,
      description,
      parentType,
      parentId,
      isActive,
    },
    adminSocialIds
  );

  return sendResponse({
    res,
    statusCode: 201,
    message: message || "Sla created successfully",
    data: {
      sla: {
        ...(sla.toObject?.() || sla),
        adminSocialIds: admins,
      },
    },
  });
});

export const updateSla = tryCatch(async (req, res) => {
  const { id } = req.params;
  const { slaId, url, description, adminSocialIds, isActive } = req.body;

  const {
    updatedSla: sla,
    adminSocialIds: admins,
    message,
  } = await updateSlaService(
    id,
    { slaId, url, description, isActive },
    adminSocialIds
  );

  return sendResponse({
    res,
    statusCode: 200,
    message: message || "Sla updated successfully",
    data: {
      sla: {
        ...(sla.toObject?.() || sla),
        adminSocialIds: admins,
      },
    },
  });
});

export const getAllSla = tryCatch(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  if (
    isNaN(parsedPage) ||
    isNaN(parsedLimit) ||
    parsedPage <= 0 ||
    parsedLimit <= 0
  ) {
    return sendErrorResponse({
      res,
      statusCode: 400,
      message:
        "Invalid pagination parameters. 'page' and 'limit' must be positive numbers.",
    });
  }

  const result = await listSlaService({
    page: parsedPage,
    limit: parsedLimit,
    search: search.trim(),
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Sla fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const getSlaById = tryCatch(async (req, res) => {
  const { id } = req.params;
  const sla = await getSlaByIdService(id);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Sla fetched successfully",
    data: sla,
  });
});

export const getMySla = tryCatch(async (req, res) => {
  const userSocialId = req.user.socialId;
  const { page = 1, limit = 10, search = "" } = req.query;
  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  if (
    isNaN(parsedPage) ||
    isNaN(parsedLimit) ||
    parsedPage <= 0 ||
    parsedLimit <= 0
  ) {
    return sendErrorResponse({
      res,
      statusCode: 400,
      message:
        "Invalid pagination parameters. 'page' and 'limit' must be positive numbers.",
    });
  }

  const result = await getMySlaService(userSocialId, {
    page: parsedPage,
    limit: parsedLimit,
    search: search.trim(),
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Fetched your sla",
    data: result.data,
    meta: result.meta,
  });
});


export const deleteSla = tryCatch(async (req, res) => {
  const { id } = req.params;
  const result = await deleteSlaService(id);

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
    message: "Sla deleted successfully",
    data: result.data,
  });
});
