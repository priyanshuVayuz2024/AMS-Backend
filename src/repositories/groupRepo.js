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
  { page = 1, limit = 10 } = {}
) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    GroupModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    GroupModel.countDocuments(filter),
  ]);

  return { data, total };
};

export const getMyGroups = async (
  userSocialId,
  filter = {},
  { page = 1, limit = 10 } = {}
) => {
  // Find all mappings where user is admin for items
  const mappings = await EntityAdminMapping.find({
    userSocialId,
    entityType: "GroupModel",
  });

  const groupIds = mappings.map((m) => m.entityId);

  if (groupIds.length === 0) {
    return { data: [], total: 0 };
  }

  // 🔹 Add GroupModel ID filter + pagination
  const skip = (page - 1) * limit;

  const query = { _id: { $in: groupIds }, ...filter };

  const [data, total] = await Promise.all([
    GroupModel.find(query).sort({ createdAt: -1 }).skip(skip).limit(limit),
    GroupModel.countDocuments(query),
  ]);

  return { data, total };
};
