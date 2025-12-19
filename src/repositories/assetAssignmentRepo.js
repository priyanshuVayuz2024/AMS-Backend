import EntityAdminMapping from "../models/EntityAdminMappingModel.js"; // rename model file later if you want
import Item from "../models/ItemModel.js";
import User from "../models/UserModel.js";

/**
 * Create a new asset assignment
 */
export const createAssetAssignment = async (data) => {
  return await EntityAdminMapping.create(data);
};

/**
 * Find assignment by ID
 */
export const findAssetAssignmentById = async (id) => {
  const data = await EntityAdminMapping
    .findById(id)
    .populate({
      path: "entityId",
      select: "name",
    })
    .lean();
  console.log(data, "data23432");

  const userDetails = await User.find({socialId:data?.userSocialId})
  const assetDetails = await Item.findById(data?.entityId?._id)
  if (!data) return null;

  return {
    _id: data._id,
    userSocialId: data.userSocialId,
    status: data.status,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
    userDetails,
    assetDetails,
    assetId: data.entityId?._id,
    assetName: data.entityId?.name, 
  };
};

export const getAllAssetAssignmentsForUser = async (socialId) => {
  const assignments = await EntityAdminMapping.find({
    userSocialId: socialId,
    status: "assigned",
  }).lean();

  return assignments; 
};


/**
 * Update assignment by ID
 */
export const updateAssetAssignmentById = async (id, updateData) => {
  return await EntityAdminMapping.findByIdAndUpdate(id, updateData, { new: true });
};

/**
 * Find assignment by assetId and userSocialId
 */
export const findAssetAssignment = async ({ entityId, userSocialId }) => {
  return await EntityAdminMapping.findOne({ entityId, userSocialId }).lean();
};

/**
 * Get all assignments with optional filters and pagination
 */
export const getAllAssetAssignments = async (
  filter = {},
  { page, limit, search = "" } = {}
) => {
  const pipeline = [];

  pipeline.push({ $match: filter });

  pipeline.push({
    $lookup: {
      from: "items",
      localField: "entityId",
      foreignField: "_id",
      as: "asset",
    },
  });
  pipeline.push({ $unwind: "$asset" });

  pipeline.push({
    $lookup: {
      from: "users", 
      localField: "userSocialId",
      foreignField: "socialId",
      as: "user",
    },
  });
  pipeline.push({ $unwind: "$user" }); 

  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { "asset.name": { $regex: search, $options: "i" } },
          { "user.name": { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  pipeline.push({ $sort: { createdAt: -1 } });

  if (page && limit) {
    pipeline.push(
      { $skip: (Number(page) - 1) * Number(limit) },
      { $limit: Number(limit) }
    );
  }

  pipeline.push({
    $project: {
      _id: 1,
      userSocialId: 1,
      userName: "$user.name", 
      status: 1,
      createdAt: 1,
      assetId: "$asset._id",
      assetName: "$asset.name",
    },
  });

  const data = await EntityAdminMapping.aggregate(pipeline);

  const countPipeline = pipeline.filter(stage => !stage.$skip && !stage.$limit);
  const countResult = await EntityAdminMapping.aggregate([
    ...countPipeline,
    { $count: "total" },
  ]);
  const total = countResult[0]?.total || 0;

  return { data, total };
};




/**
 * Get assignments assigned to a specific user
 */
export const getAssignmentsByUser = async (
  userSocialId,
  filter = {},
  { page = 1, limit = 10 } = {}
) => {
  const queryFilter = { userSocialId, ...filter };
  const skip = (Number(page) - 1) * Number(limit);

  const [data, total] = await Promise.all([
    EntityAdminMapping.find(queryFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean(),
    EntityAdminMapping.countDocuments(queryFilter),
  ]);

  return { data, total };
};

/**
 * Get assignments for a specific asset
 */
export const getAssignmentsByAsset = async (entityId, filter = {}) => {
  return await EntityAdminMapping.find({ entityId, ...filter }).lean();
};

/**
 * Delete assignment by ID
 */
export const deleteAssetAssignmentById = async (id) => {
  return await EntityAdminMapping.findByIdAndDelete(id);
};
