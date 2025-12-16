import Item from "../models/ItemModel.js";
import EntityAdminMapping from "../models/EntityAdminMappingModel.js";

/**
 * Create a new item
 */
export const createItem = async (itemData) => {
  return await Item.create(itemData);
};

/**
 * Find item by ID
 */
export const findItemById = async (id) => {
  return await Item.findById(id).lean();
};

/**
 * Update item by ID
 */
export const updateItemById = async (id, updateData) => {
  return await Item.findByIdAndUpdate(id, updateData, { new: true });
};

/**
 * Find item by name (case-insensitive)
 */
export const findItemByName = async (name) => {
  return await Item.findOne({ name: new RegExp(`^${name}$`, "i") });
};

/**
 * Delete item by ID
 */
export const deleteItemById = async (id) => {
  return await Item.findByIdAndDelete(id);
};

/**
 * Get all items with optional pagination and filters
 */
export const getAllItems = async (filter = {}, { page, limit } = {}) => {
  const query = Item.find(filter).sort({ createdAt: -1 }).lean();
  const total = await Item.countDocuments(filter);

  if (page && limit) {
    const skip = (Number(page) - 1) * Number(limit);
    query.skip(skip).limit(Number(limit));
  }

  const data = await query;
  return { data, total };
};

/**
 * Get items assigned to a specific user via EntityAdminMapping
 * Only one user can be assigned per item
 */
export const getAssignedItems = async (
  userSocialId,
  filter = {},
  { page = 1, limit = 10 } = {}
) => {
  // Find mappings where this user is assigned to an item
  const mappings = await EntityAdminMapping.find({
    userSocialId,
    entityType: "Item",
  }).select("entityId");

  const itemIds = mappings.map((m) => m.entityId.toString());
  if (itemIds.length === 0) return { data: [], total: 0 };

  const skip = (Number(page) - 1) * Number(limit);
  const query = { _id: { $in: itemIds }, ...filter };

  const [data, total] = await Promise.all([
    Item.find(query).sort({ createdAt: -1 }).skip(skip).limit(Number(limit)).lean(),
    Item.countDocuments(query),
  ]);

  return { data, total };
};

