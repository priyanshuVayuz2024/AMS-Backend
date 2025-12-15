import ReportModel from "../models/ReportModel.js";
import ItemModel from "../models/ItemModel.js";


export const createReport = async (reportData) => {
  return await ReportModel.create(reportData);
};

export const findReportById = async (id) => {
  return await ReportModel.findById(id).lean();
};


export const updateReportById = async (id, updateData) => {
  return await ReportModel.findByIdAndUpdate(id, updateData, { new: true });
};


export const getAllReportsRepo = async (filter = {}, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    ReportModel.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit).lean(),
    ReportModel.countDocuments(filter),
  ]);

  return { reports, total };
};

export const getMyReportsRepo = async (userSocialId, filter = {}, { page = 1, limit = 10 } = {}) => {
  const skip = (page - 1) * limit;

  const query = {
    reportedBySocialId: userSocialId,
    ...filter,
  };

  const [reports, total] = await Promise.all([
    ReportModel.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ReportModel.countDocuments(query),
  ]);

  return { reports, total };
};


export const deleteReportById = async (id) => {
  return await ReportModel.findByIdAndDelete(id).lean();
};
