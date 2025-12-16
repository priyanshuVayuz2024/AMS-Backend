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

  const item = await createItem({
    name: trimmedName,
    description: data?.description?.trim(),
    createdBy: data?.createdBy,
    isActive: typeof data.isActive === "boolean" ? data.isActive : true,
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
const REQUIRED_COLUMNS = ["name", "description", "isActive"];

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
          isActive: row.isActive?.toLowerCase() === "true",
          createdBy: row.createdBy || null,
        };

        // Validate
        const { error, value } = itemValidationSchema.validate(rowData, {
          abortEarly: false,
          convert: true,
        });

        if (error) throw new Error(error.details.map((d) => d.message).join(", "));

        // Create item
        const { item } = await createItemService(value);

        // Generate QR code
        const qrUrl = `http://localhost:5000/report?itemId=${item._id}`;
        const qrBase64 = await QRCode.toDataURL(qrUrl);

        const upload = await cloudinary.uploader.upload(qrBase64, {
          folder: "qr",
          public_id: `item-${item._id}`,
          overwrite: true,
        });

        item.qrCodeUrl = upload.secure_url;

        results.push({ row, status: "success", _id: item._id });
      } catch (err) {
        results.push({ row, status: "failed", reason: err.message });
      }
    }

    return results;
  },
};
