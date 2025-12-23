import { itemValidationSchema } from "../validationSchema/itemValidationSchema.js";
import csv from "csvtojson";
import QRCode from "qrcode";
import cloudinary from "../cloudinary/useCloudinary.js";

import {
  createItem,
  deleteItemById,
  findItemById,
  findItemByName,
  getAllItems,
  getAssetsFromDB,
  updateItemById,
} from "../repositories/itemRepo.js";

/**
 * Create a new item
 */
export const createItemService = async (data) => {
  if (!data.name?.trim()) throw new Error("Item name is required.");

  const trimmedName = data.name.trim();
  const existing = await findItemByName(trimmedName);
  if (existing) throw new Error("Item name already exists.");

  // Upload image/video if provided
  const image = [];
  const video = [];

  if (data.image?.length) {
    for (const file of data.image) {
      const url = await cloudinary.uploader.upload(file.buffer || file, {
        folder: "items/image",
      });
      image.push(url.secure_url);
    }
  }

  if (data.video?.length) {
    for (const file of data.video) {
      const url = await cloudinary.uploader.upload(file.buffer || file, {
        folder: "items/video",
        resource_type: "video",
      });
      video.push(url.secure_url);
    }
  }



  const item = await createItem({
    name: trimmedName,
    description: data?.description?.trim(),
    createdBy: data?.createdBy,
    isActive: typeof data.isActive === "boolean" ? data.isActive : true,
    images: image,
    videos: video,
  });

  return { item };
};

/**
 * Update an item
 */
export const updateItemService = async (id, updates) => {
  const item = await findItemById(id);
  if (!item) throw new Error("Item not found.");

  const newName = updates.name?.trim();
  if (newName && newName !== item.name) {
    const existing = await findItemByName(newName);
    if (existing) throw new Error("Item name already exists.");
  }

  const updatePayload = {
    name: newName || item.name,
    description: updates.description?.trim() || item.description,
    isActive: typeof updates.isActive === "boolean" ? updates.isActive : item.isActive,
  };

  // Initialize arrays with existing data
  const images = item.images?.slice() || [];
  const videos = item.videos?.slice() || [];

  // Only handle new uploads (Buffers)
  if (updates.image?.length) {
    for (const file of updates.image) {
      if (file?.buffer) {
        const url = await cloudinary.uploader.upload(file.buffer, {
          folder: "items/image",
        });
        images.push(url.secure_url);
      }
    }
  }

  if (updates.video?.length) {
    for (const file of updates.video) {
      if (file?.buffer) {
        const url = await cloudinary.uploader.upload(file.buffer, {
          folder: "items/video",
          resource_type: "video",
        });
        videos.push(url.secure_url);
      }
    }
  }

  updatePayload.images = images;
  updatePayload.videos = videos;

  const updatedItem = await updateItemById(id, updatePayload);
  return { updatedItem };
};


/**
 * List items with optional pagination and search
 */
export const listItemsService = async ({ page, limit, search = "" }) => {  
  const filter = {};
  if (search) filter.name = { $regex: search, $options: "i" };

  const { data, total } = await getAllItems(filter, { page, limit });

  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: page && limit ? Math.ceil(total / limit) : 1,
    },
  };
};

export const listUnallocatedAssetsService = async ({
  page,
  limit,
  search = "",
}) => {
  const filter = { allocationStatus: "unallocated" };

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const { data, total } = await getAssetsFromDB(filter, { page, limit });

  return {
    data,
    meta: {
      total,
      page: page || 1,
      limit: limit || total,
      totalPages: page && limit ? Math.ceil(total / limit) : 1,
    },
  };
};

/**
 * Get a single item by ID
 */
export const getItemByIdService = async (itemId) => {
  const item = await findItemById(itemId);
  if (!item) throw new Error("Item not found.");
  return item;
};

/**
 * Delete an item
 */
export const deleteItemService = async (id) => {
  const deleted = await deleteItemById(id);
  if (!deleted) return { success: false, message: "Item not found" };

  return { success: true, data: deleted };
};

/**
 * Bulk CSV processing service
 */
const REQUIRED_COLUMNS = ["name", "description"];

export const ItemBulkService = {
  processCSV: async (filePath) => {
    const rows = await csv().fromFile(filePath);
    if (!rows.length) throw new Error("CSV file is empty");

    const csvColumns = Object.keys(rows[0]);
    const missing = REQUIRED_COLUMNS.filter((c) => !csvColumns.includes(c));
    const extra = csvColumns.filter((c) => !REQUIRED_COLUMNS.includes(c));

    if (missing.length > 0)
      throw new Error(`CSV is missing required columns: ${missing.join(", ")}`);
    if (extra.length > 0)
      throw new Error(`CSV has extra unexpected columns: ${extra.join(", ")}`);

    const results = [];

    for (const row of rows) {
      try {
        const rowData = {
          name: row.name,
          description: row.description || "",
        };

        // Validate
        const { error, value } = itemValidationSchema.validate(rowData, {
          abortEarly: false,
          convert: true,
        });

        if (error)
          throw new Error(error.details.map((d) => d.message).join(", "));

        const { item } = await createItemService(value);

        results.push({ row, status: "success", _id: item._id });
      } catch (err) {
        results.push({ row, status: "failed", reason: err.message });
      }
    }

    return results;
  },
};
