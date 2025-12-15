import {
  createGroupService,
  deleteGroupService,
  getAssignedGroupsService,
  getGroupByIdService,
  getUserCreatedGroupsService,
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
  const { subCategoryId, name, description, adminSocialIds } = req.body;
  const createdBy = req.user.socialId;
  const {
    group,
    adminSocialIds: admins,
    message,
  } = await createGroupService(
    {
      subCategoryId,
      name,
      description,
      createdBy,
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
  const { subCategoryId, name, description, adminSocialIds, isActive } =
    req.body;

  const {
    updatedGroup: group,
    adminSocialIds: admins,
    message,
  } = await updateGroupService(
    id,
    { subCategoryId, name, description, isActive },
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
  const { page, limit, search = "", subCategoryId = "" } = req.query;

  const options = { search: search.trim() };

  if (subCategoryId) {
    options.subCategoryId = subCategoryId.trim();
  }

  if (page !== undefined && limit !== undefined) {
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

    options.page = parsedPage;
    options.limit = parsedLimit;
  }

  const result = await listGroupsService(options);

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

export const getAssignedGroups = tryCatch(async (req, res) => {
  const userSocialId = req.user.socialId;
  const { page, limit, search = "", subCategoryId = "" } = req.query;

  const options = { search: search.trim() };

  if (subCategoryId) {
    options.subCategoryId = subCategoryId.trim();
  }

  if (page !== undefined && limit !== undefined) {
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

    options.page = parsedPage;
    options.limit = parsedLimit;
  }

  const result = await getAssignedGroupsService(userSocialId, options);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Fetched groups assigned to you",
    data: result.data,
    meta: result.meta,
  });
});

export const getUserCreatedGroupsController = tryCatch(async (req, res) => {
  const userSocialId = req.user.socialId;
  const { page, limit, search = "", subCategoryId = "" } = req.query;

  const options = { search: search.trim() };

  if (subCategoryId) {
    options.subCategoryId = subCategoryId.trim();
  }

  if (page !== undefined && limit !== undefined) {
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

    options.page = parsedPage;
    options.limit = parsedLimit;
  }

  const result = await getUserCreatedGroupsService(userSocialId, options);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Fetched groups created by you",
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
