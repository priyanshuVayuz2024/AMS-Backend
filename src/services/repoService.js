import {
  createReport,
  deleteReportById,
  findReportById,
  getAllReportsRepo,
  getMyReportsRepo,
  updateReportById,
} from "../repositories/reportRepo.js";

import { findItemById } from "../repositories/itemRepo.js";
import User from "../models/UserModel.js";

/**
 * Create Report
 */
export const createReportService = async (data, reportedBy) => {
 
  
  if (!reportedBy?.trim()) {
    throw new Error("Reported by is required.");
  }

  if (!data?.assetId) {
    throw new Error("Asset ID is required.");
  }

  if (!data?.reportTitle?.trim()) {
    throw new Error("Report title is required.");
  }

  const report = await createReport({
    assetId: data.assetId,
    reportTitle: data.reportTitle.trim(),
    reportDescription: data.reportDescription?.trim() || "",
    reportedBy: reportedBy.trim(),
    images: data?.image || [],
    videos: data?.video || [],
    status: "open",
  });

  const asset = await findItemById(data.assetId);

  return {
    ...report.toObject(),
    assetId: asset?._id || null,
    assetName: asset?.name || null,
  };
};

/**
 * Update Report
 */
export const updateReportService = async (id, updates) => {
  const report = await findReportById(id);
  if (!report) throw new Error("Report not found.");

  const updatePayload = {};

  if (updates.reportTitle?.trim()) {
    updatePayload.reportTitle = updates.reportTitle.trim();
  }

  if (updates.assetId?.trim()) {
    updatePayload.assetId = updates.assetId.trim();
  }

  if (typeof updates.reportDescription === "string") {
    updatePayload.reportDescription = updates.reportDescription.trim();
  }

  if (updates.image !== undefined) {
  updatePayload.images = updates.image;
}

if (updates.video !== undefined) {
  updatePayload.videos = updates.video; 
}

 console.log(updatePayload, "updatePayload");

  if (updates.status) {
    const allowedStatuses = ["open", "in-progress", "resolved", "closed"];
    if (!allowedStatuses.includes(updates.status)) {
      throw new Error("Invalid status value.");
    }
    updatePayload.status = updates.status;
  }

  const updatedReport = await updateReportById(id, updatePayload);

  const asset = await findItemById(updatedReport.assetId);

  return {
    ...updatedReport,
    assetId: asset?._id || null,
    assetName: asset?.name || null,
  };
};

/**
 * List All Reports
 */
export const listReportsService = async ({ page = 1, limit = 10, filter = {} } = {}) => {
  const { reports, total } = await getAllReportsRepo(filter, { page, limit });

  const updatedReports = await Promise.all(
    reports.map(async (report) => {
      const asset = await findItemById(report.assetId);
      return {
        ...report,
        assetId: asset?._id || null,
        assetName: asset?.name || null,
      };
    })
  );

  return {
    data: updatedReports,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Find Report By ID
 */
export const findReportByIdService = async (id) => {
  const report = await findReportById(id);
  if (!report) return null;

  const asset = await findItemById(report.assetId);

  const reporter = await User.findOne(
    { socialId: report.reportedBy },
    { name: 1, email: 1, socialId: 1 }
  ).lean();

  return {
    ...report,
    reportedBy: {
      socialId: report.reportedBy,
      name: reporter?.name || null,
      email: reporter?.email || null,
    },
    assetId: asset?._id || null,
    assetName: asset?.name || null,
  };
};


/**
 * Get My Reports
 */
export const getMyReportsService = async (
  reportedBy,
  { page = 1, limit = 10, filter = {} } = {}
) => {
  const { reports, total } = await getMyReportsRepo(
    reportedBy,
    filter,
    { page, limit }
  );

  const updatedReports = await Promise.all(
    reports.map(async (report) => {
      const asset = await findItemById(report.assetId);

      return {
        ...report,
        assetId: asset?._id || null,
        assetName: asset?.name || null,
      };
    })
  );

  return {
    data: updatedReports,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Delete Report
 */
export const deleteReportService = async (id) => {
  const deletedReport = await deleteReportById(id);

  if (!deletedReport) {
    return {
      success: false,
      message: "Report not found",
    };
  }

  return {
    success: true,
    data: deletedReport,
  };
};
