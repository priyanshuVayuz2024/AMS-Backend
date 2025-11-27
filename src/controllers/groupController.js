import {
  createGroupService,
  deleteGroupService,
  getGroupByIdService,
  getMyGroupsService,
  listGroupsService,
  updateGroupService,
} from "../services/groupService.js";

import mongoose from "mongoose";

import {
  sendResponse,
  sendErrorResponse,
  tryCatch,
} from "../util/responseHandler.js";

export const createGroup = tryCatch(async (req, res) => {
  const { subCategoryId, name, description, adminSocialIds, isActive } =
    req.body;


  const { group, adminSocialIds: admins, message } = await createGroupService(
    {
      subCategoryId,
      name,
      description,
      isActive,
    },
    adminSocialIds
  );

  return sendResponse({
    res,
    statusCode: 201,
    message: message || "Group created successfully",
    data: {
      group: {
        ...(group.toObject?.() || group),
        adminSocialIds: admins,
      },
    },
  });
});

export const updateGroup = tryCatch(async (req, res) => {
  const { id } = req.params;
  const { subCategoryId, name, description, adminSocialIds, isActive } = req.body;

  
  const { updatedGroup: group,adminSocialIds: admins, message } = await updateGroupService(
    id,
    { subCategoryId, name, description, isActive},
    adminSocialIds
    
  );

  return sendResponse({
    res,
    statusCode: 200,
    message: message || "Group updated successfully",
    data: {
      group: {
        ...(group.toObject?.() || group),
        adminSocialIds: admins,
      },
    },
  });
});

export const getAllGroups = tryCatch(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  // 🔹 Validate pagination params
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

  const result = await listGroupsService({
    page: parsedPage,
    limit: parsedLimit,
    search: search.trim(),
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Groups fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const getGroupById = tryCatch(async (req, res) => {
  const { id } = req.params;
  const group = await getGroupByIdService(id);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Group fetched successfully",
    data: group,
  });
});

export const getMyGroups = tryCatch(async (req, res) => {
  const userSocialId = req.user.socialId;
  const { page = 1, limit = 10, search = "" } = req.query;

  // 🔹 Validate pagination params
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

  const result = await getMyGroupsService(userSocialId, {
    page: parsedPage,
    limit: parsedLimit,
    search: search.trim(),
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Fetched your groups",
    data: result.data,
    meta: result.meta,
  });
});

export const deleteGroup = tryCatch(async (req, res) => {
  const { id } = req.params;

  const result = await deleteGroupService(id);

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
    message: "Group deleted successfully",
    data: result.data,
  });
});
