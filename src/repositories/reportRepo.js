import ReportModel from "../models/ReportModel.js";

/**
 * Create a new report
 */
export const createReport = async (reportData) => {
  return await ReportModel.create(reportData);
};

/**
 * Find report by ID
 */
export const findReportById = async (id) => {
  return await ReportModel.findById(id).lean();
};

/**
 * Update report by ID
 */
export const updateReportById = async (id, updateData) => {
  return await ReportModel.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).lean();
};

/**
 * Get all reports (Admin / Manager)
 */
export const getAllReportsRepo = async (
  filter = {},
  { page = 1, limit = 10 } = {}
) => {
  const skip = (page - 1) * limit;

  const [reports, total] = await Promise.all([
    ReportModel.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    ReportModel.countDocuments(filter),
  ]);

  return { reports, total, page, limit };
};

/**
 * Get reports created by a specific user
 */
export const getMyReportsRepo = async (
  reportedBy,
  filter = {},
  { page = 1, limit = 10 } = {}
) => {
  const skip = (page - 1) * limit;

  const query = {
    reportedBy,
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

  return { reports, total, page, limit };
};

/**
 * Delete report by ID
 */
export const deleteReportById = async (id) => {
  return await ReportModel.findByIdAndDelete(id).lean();
};
