import GroupModel from "../models/GroupModel.js";
import EntityAdminMapping from "../models/EntityAdminMappingModel.js";
import ItemModel from "../models/ItemModel.js";

export const createGroup = async (groupData) => {
  return await GroupModel.create(groupData);
};

export const findGroupById = async (id) => {
  return await GroupModel.findById(id);
};

export const updateGroupById = async (id, updateData) => {
  return await GroupModel.findByIdAndUpdate(id, updateData, { new: true });
};

export const findGroupByName = async (name) => {
  return await GroupModel.findOne({ name: new RegExp(`^${name}$`, "i") });
};

export const deleteGroupById = async (id) => {
  await ItemModel.deleteMany({ parentType: "Group", parentId: id });

  return await GroupModel.findByIdAndDelete(id);
};

export const getAllGroups = async (
  filter = {},
  { page, limit } = {}
) => {
  if (!page || !limit) {
    const data = await GroupModel.find(filter).sort({ createdAt: -1 });
    const total = await GroupModel.countDocuments(filter);

    return {
      data,
      total,
    };
  }

  const parsedPage = Number(page);
  const parsedLimit = Number(limit);

  const skip = (parsedPage - 1) * parsedLimit;

  const data = await GroupModel.find(filter)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(parsedLimit);

  const total = await GroupModel.countDocuments(filter);

  return {
    data,
    total,
  };
};


export const getAssignedGroups = async (
  userSocialId,
  filter = {},
  { page, limit } = {}
) => {
  const mappings = await EntityAdminMapping.find({
    userSocialId,
    entityType: "Group",
  });

  const groupIds = mappings.map(m => m.entityId);
console.log(groupIds, "idsss");

  if (groupIds.length === 0) {
    return { data: [], total: 0 };
  }

  const query = { _id: { $in: groupIds }, ...filter };

  if (!page || !limit) {
    const data = await GroupModel.find(query).sort({ createdAt: -1 });
    const total = await GroupModel.countDocuments(query);
    return { data, total };
  }

  const parsedPage = Number(page);
  const parsedLimit = Number(limit);
  const skip = (parsedPage - 1) * parsedLimit;

  const [data, total] = await Promise.all([
    GroupModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit),

    GroupModel.countDocuments(query),
  ]);

  return { data, total };
};



export const getUserCreatedGroups = async (
  userSocialId,
  filter = {},
  { page, limit } = {}
) => {
  const query = { createdBy: userSocialId, ...filter };

  if (!page || !limit) {
    const data = await GroupModel.find(query).sort({ createdAt: -1 });
    const total = await GroupModel.countDocuments(query);
    return { data, total };
  }

  const parsedPage = Number(page);
  const parsedLimit = Number(limit);
  const skip = (parsedPage - 1) * parsedLimit;

  const [data, total] = await Promise.all([
    GroupModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parsedLimit),

    GroupModel.countDocuments(query),
  ]);

  return { data, total };
};
