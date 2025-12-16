import QRCode from "qrcode";
import cloudinary from "../cloudinary/useCloudinary.js";
import {
  createItemService,
  deleteItemService,
  getItemByIdService,
  listItemsService,
  updateItemService,
  ItemBulkService,
} from "../services/itemService.js";

import {
  sendResponse,
  sendErrorResponse,
  tryCatch,
} from "../util/responseHandler.js";

/**
 * Create a new item (no assigned user)
 */
export const createItem = tryCatch(async (req, res) => {
  const { name, description, isActive } = req.body;
  const createdBy = req.user.socialId;

  const { item } = await createItemService({
    name,
    description,
    createdBy,
    isActive,
  });

  const qrUrl = `http://localhost:5000/report?itemId=${item._id}`;
  const qrBase64 = await QRCode.toDataURL(qrUrl);

  const uploadResponse = await cloudinary.uploader.upload(qrBase64, {
    folder: "qr",
    public_id: `item-${item._id}`,
    overwrite: true,
  });

  item.qrCodeUrl = uploadResponse.secure_url;

  return sendResponse({
    res,
    statusCode: 201,
    message: "Item created successfully",
    data: item,
  });
});

/**
 * Update an item
 */
export const updateItem = tryCatch(async (req, res) => {
  const { id } = req.params;
  const { name, description, isActive } = req.body;

  const { updatedItem: item } = await updateItemService(id, {
    name,
    description,
    isActive,
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Item updated successfully",
    data: item,
  });
});

/**
 * List items with optional pagination and search
 */
export const getAllItems = tryCatch(async (req, res) => {
  const { page, limit, search = "" } = req.query;

  const options = { search: search.trim() };

  if (page !== undefined && limit !== undefined) {
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);

    if (isNaN(parsedPage) || isNaN(parsedLimit) || parsedPage <= 0 || parsedLimit <= 0) {
      return sendErrorResponse({
        res,
        statusCode: 400,
        message: "Invalid pagination parameters. 'page' and 'limit' must be positive numbers.",
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

/**
 * Get a single item by ID
 */
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



/**
 * Delete an item
 */
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

/**
 * Bulk upload items via CSV
 */
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
