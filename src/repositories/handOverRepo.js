import HandoverModel from "../models/handOverModel.js";

export const createHandoverRepo = async (handoverData) => {
  return await HandoverModel.create(handoverData);
};


export const findHandoverById = async (id) => {
  return await HandoverModel.findById(id).lean();
};

export const updateHandoverById = async (id, updateData) => {
  return await HandoverModel.findByIdAndUpdate(id, updateData, { new: true }).lean();
};

export const deleteHandoverById = async (id) => {
  return await HandoverModel.findByIdAndDelete(id).lean();
};

export const getAllHandoversRepo = async (filter = {}, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  const [handovers, total] = await Promise.all([
    HandoverModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    HandoverModel.countDocuments(filter),
  ]);

  return { handovers, total };
};

export const getMyHandoversRepo = async (userSocialId, role = "sender", filter = {}, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  let query = { ...filter };

  if (role === "sender") {
    query.fromSocialId = userSocialId;
  } else if (role === "receiver") {
    query.toSocialId = userSocialId;
  } else if (role === "both") {
    query.$or = [
      { fromSocialId: userSocialId },
      { toSocialId: userSocialId }
    ];
  }

  const [handovers, total] = await Promise.all([
    HandoverModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),

    HandoverModel.countDocuments(query),
  ]);

  return { handovers, total };
};
