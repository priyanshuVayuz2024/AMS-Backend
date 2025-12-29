import Item from "../models/ItemModel.js";
import Report from "../models/ReportModel.js"
import EntityAdminMapping from "../models/EntityAdminMappingModel.js";
import mongoose from "mongoose";

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
  const item = await Item.findById(id).lean();
  if (!item) return null;

  const reportCount = await Report.countDocuments({
    assetId: id,
  });

  return {
    ...item,
    reportCount,
  };
};

/**
 * Update item by ID
 */

export const updateItemById = async (id, updateData) => {
  const updatedItem = await Item.findByIdAndUpdate(id, updateData, { new: true }).lean();
  if (!updatedItem) return null;

  const reportCount = await Report.countDocuments({ assetId: id });

  return {
    ...updatedItem,
    reportCount,
  };
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
  const pipeline = [
    { $match: filter },

    {
      $lookup: {
        from: "reports",
        let: { itemIdStr: { $toString: "$_id" } },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$assetId", "$$itemIdStr"],
              },
            },
          },
        ],
        as: "reports",
      },
    },

    // Count matched reports
    {
      $addFields: {
        reportCount: { $size: "$reports" },
      },
    },

    // Remove reports array from response
    {
      $project: {
        reports: 0,
      },
    },

    { $sort: { createdAt: -1 } },
  ];

  // Pagination
  if (page && limit) {
    pipeline.push(
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) }
    );
  }

  const data = await Item.aggregate(pipeline);
  const total = await Item.countDocuments(filter);

  return { data, total };
};



export const getActiveItemsFromDB = async (filter = {}) => {
  const finalFilter = {
    ...filter,
    isActive: true, 
  };

  const pipeline = [
    { $match: finalFilter },

    {
      $lookup: {
        from: "reports",
        let: { itemIdStr: { $toString: "$_id" } },
        pipeline: [
          {
            $match: {
              $expr: {
                $eq: ["$assetId", "$$itemIdStr"],
              },
            },
          },
        ],
        as: "reports",
      },
    },

    {
      $addFields: {
        reportCount: { $size: "$reports" },
      },
    },

    {
      $project: {
        reports: 0,
      },
    },

    { $sort: { createdAt: -1 } },
  ];

  const data = await Item.aggregate(pipeline);
  return data;
};


export const getAllItemsRepo = async (
  filter = {},
  { page, limit } = {}
) => {
  const pipeline = [];

  pipeline.push({ $match: filter });

  pipeline.push({
    $lookup: {
      from: "reports",
      let: { itemIdStr: { $toString: "$_id" } },
      pipeline: [
        {
          $match: {
            $expr: {
              $eq: ["$assetId", "$$itemIdStr"],
            },
          },
        },
      ],
      as: "reports",
    },
  });

  pipeline.push({
    $addFields: {
      reportCount: { $size: "$reports" },
    },
  });

  pipeline.push({
    $project: {
      reports: 0,
    },
  });

  pipeline.push({ $sort: { createdAt: -1 } });

  if (page && limit) {
    pipeline.push(
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) }
    );
  }

  const data = await Item.aggregate(pipeline);
  
  const total = await Item.countDocuments(filter);

  return { data, total };
};

export const getAssetsFromDB = async (filter = {}, { page, limit } = {}) => {
  const finalFilter = {
    ...filter,
    isActive: true,
  };

  const query = Item.find(finalFilter)
    .sort({ createdAt: -1 })
    .lean();

  const total = await Item.countDocuments(finalFilter);

  if (page && limit) {
    const skip = (page - 1) * limit;
    query.skip(skip).limit(limit);
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

