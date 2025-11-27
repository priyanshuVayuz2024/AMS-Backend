import {
  createItemService,
  deleteItemService,
  getItemByIdService,
  getMyItemsService,
  listItemsService,
  updateItemService,
} from "../services/itemService.js";
import mongoose from "mongoose";

import {
  sendResponse,
  sendErrorResponse,
  tryCatch,
} from "../util/responseHandler.js";

export const createItem = tryCatch(async (req, res) => {
  const {
    name,
    description,
    parentType,
    parentId,
    assignedToSocialId,
    parentItemId,
    isActive,
  } = req.body;

  console.log(typeof assignedToSocialId, "type of social id");

  // if (Array.isArray(assignedToSocialId)) {
  //   assignedToSocialId = assignedToSocialId[0] || null; 
  // }

  // if (parentItemId === "") {
  //   parentItemId = null; 
  // }

  const { item, message } = await createItemService(
    {
      name,
      description,
      parentType,
      parentId,
      parentItemId,
      isActive,
    },
    assignedToSocialId
  );

  return sendResponse({
    res,
    statusCode: 201,
    message: message || "Item created successfully",
    data: item,
  });
});

export const updateItem = tryCatch(async (req, res) => {
  const { id } = req.params;
  const { name, description, assignedToSocialId, isActive } = req.body;
  console.log("upload adminSocialIds", assignedToSocialId);

  const { updatedItem: item, message } = await updateItemService(
    id,
    { name, description, isActive },
    assignedToSocialId
  );

  return sendResponse({
    res,
    statusCode: 200,
    message: message || "Item updated successfully",
    data: item,
  });
});

export const getAllItems = tryCatch(async (req, res) => {
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

  const result = await listItemsService({
    page: parsedPage,
    limit: parsedLimit,
    search: search.trim(),
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Items fetched successfully",
    data: result.data,
    meta: result.meta,
       
  });
});

export const getItemById = tryCatch(async (req, res) => {
  const { id } = req.params;
  const item = await getItemByIdService(id);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Item fetched successfully",
    data: item,
  });
});

export const getMyItems = tryCatch(async (req, res) => {
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

  const result = await getMyItemsService(userSocialId, {
    page: parsedPage,
    limit: parsedLimit,
    search: search.trim(),
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Fetched your items",
    data: result.data,
    meta: result.meta,
  });
});

export const deleteItem = tryCatch(async (req, res) => {
    const { id } = req.params;

    const result = await deleteItemService(id);

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
        message: "Item deleted successfully",
        data: result.data,
    });
});
