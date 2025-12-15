import QRCode from "qrcode";
import cloudinary from "../cloudinary/useCloudinary.js";
import {
  createItemService,
  deleteItemService,
  getItemByIdService,
  listItemsService,
  updateItemService,
  ItemBulkService,
  getAssignedItemsService,
  getUserCreatedItemsService,
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
  } = req.body;

  const createdBy = req.user.socialId;

  const { item, message } = await createItemService(
    {
      name,
      description,
      parentType,
      parentId,
      parentItemId,
      createdBy,
    },
    assignedToSocialId
  );

  const qrUrl = `http://localhost:5000/report?itemId=${item.id}`;
  // const qrUrl = `https://ams-backend-2-0.onrender.com/report?itemId=${item.id}`;

  const qrBase64 = await QRCode.toDataURL(qrUrl);

  const uploadResponse = await cloudinary.uploader.upload(qrBase64, {
    folder: "qr",
    public_id: `item-${item.id}`,
    overwrite: true,
  });

  item.qrCodeUrl = uploadResponse.secure_url;

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
  const {
    page,
    limit,
    search = "",
    categoryId = "",
    subCategoryId = "",
  } = req.query;

  const options = { search: search.trim() };

  if (categoryId) {
    options.categoryId = categoryId.trim();
  }

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

  const result = await listItemsService(options);

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

export const getAssignedItems = tryCatch(async (req, res) => {
  const userSocialId = req.user.socialId;
  const { page, limit, search = "", categoryId = "", subCategoryId = "" } = req.query;

  const options = { search: search.trim() };

  if (categoryId) {
    options.categoryId = categoryId.trim();
  }

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

  const result = await getAssignedItemsService(userSocialId, options);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Fetched your items",
    data: result.data,
    meta: result.meta,
  });
});


export const getUserCreatedItemsController = tryCatch(async (req, res) => {
  const userSocialId = req.user.socialId;
  const { page, limit, search = "", categoryId = "", subCategoryId = "" } = req.query;

  const options = { search: search.trim() };

  if (categoryId) {
    options.categoryId = categoryId.trim();
  }

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

  const result = await getUserCreatedItemsService(userSocialId, options);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Fetched items created by you",
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

export const uploadItemsBulk = tryCatch(async (req, res) => {
  if (!req.file) {
    return sendErrorResponse({
      res,
      statusCode: 400,
      message: "CSV file is required.",
    });
  }

  const filePath = req.file.path; 
  const results = await ItemBulkService.processCSV(filePath);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Bulk upload completed",
    data: results,
  });
});
