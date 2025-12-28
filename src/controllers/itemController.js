import QRCode from "qrcode";
import cloudinary from "../cloudinary/useCloudinary.js";
import {
  createItemService,
  deleteItemService,
  getItemByIdService,
  listItemsService,
  updateItemService,
  ItemBulkService,
  listUnallocatedAssetsService,
  listItemsServiceForReports,
} from "../services/itemService.js";

import {
  sendResponse,
  sendErrorResponse,
  tryCatch,
} from "../util/responseHandler.js";
import { uploadToCloudinary } from "../middlewares/cloudinaryUploadMiddleware.js";

/**
 * Create a new item (no assigned user)
 */
export const createItem = tryCatch(async (req, res) => {
  const { name, description, isActive } = req.body;
  const createdBy = req.user.socialId;

  // Handle uploaded image/video
  const imageFiles = req.files?.image || [];
  const videoFiles = req.files?.video || [];

  const imageUrls = await Promise.all(
    imageFiles.map((file) => uploadToCloudinary(file.buffer, "items", "image"))
  );

  const videoUrls = await Promise.all(
    videoFiles.map((file) => uploadToCloudinary(file.buffer, "items", "video"))
  );

  const item = await createItemService({
    name,
    description,
    createdBy,
    isActive,
    image: imageUrls,
    video: videoUrls,
  });

  // // Generate QR code
  // const qrUrl = `https://ams-backend-2-0.onrender.com/report?itemId=${item._id}`;
  // const qrBase64 = await QRCode.toDataURL(qrUrl);

  // const uploadResponse = await cloudinary.uploader.upload(qrBase64, {
  //   folder: "qr",
  //   public_id: `item-${item._id}`,
  //   overwrite: true,
  // });

  // item.qrCodeUrl = uploadResponse.secure_url;

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

  // Get uploaded files
  const imageFiles = req.files?.image || [];
  const videoFiles = req.files?.video || [];

  // Upload new images/videos to Cloudinary
  const imageUrls = await Promise.all(
    imageFiles.map((file) => uploadToCloudinary(file.buffer, "items", "image"))
  );

  const videoUrls = await Promise.all(
    videoFiles.map((file) => uploadToCloudinary(file.buffer, "items", "video"))
  );

  // Build update payload
  const payload = { name, description, isActive };

  if (imageUrls.length > 0) payload.image = imageUrls;
  if (videoUrls.length > 0) payload.video = videoUrls;

  // Call service
  const { updatedItem: item } = await updateItemService(id, payload);

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



export const getAllItemsForReports = tryCatch(async (req, res) => {
  const { page, limit, search = "" } = req.query;

  const options = {
    search: search.trim(),
    user: req.user,
    isModuleAdmin: req.isModuleAdmin, 
  };

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

  const result = await listItemsServiceForReports(options);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Items fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});


export const getUnallocatedAssets = tryCatch(async (req, res) => {
  const { page, limit, search = "", selectedAssetId } = req.query;

  const parsedPage = page ? parseInt(page, 10) : undefined;
  const parsedLimit = limit ? parseInt(limit, 10) : undefined;

  if (
    (page && isNaN(parsedPage)) ||
    (limit && isNaN(parsedLimit)) ||
    (parsedPage && parsedPage <= 0) ||
    (parsedLimit && parsedLimit <= 0)
  ) {
    return sendErrorResponse({
      res,
      statusCode: 400,
      message:
        "Invalid pagination parameters. 'page' and 'limit' must be positive numbers.",
    });
  }

  const options = {
    page: parsedPage,
    limit: parsedLimit,
    search: search.trim(),
    selectedAssetId, 
  };

  const result = await listUnallocatedAssetsService(options);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Unallocated assets fetched successfully",
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
