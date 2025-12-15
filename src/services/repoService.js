import {
  addAdminMapping,
  addMultiAdminMappings,
  removeAdminMappings,
  getAdminsForEntity,
} from "../repositories/entityAdminRepo.js";


import {
  createReport,
  deleteReportById,
  findReportById,
  getAllReportsRepo,
  getMyReportsRepo,
} from "../repositories/reportRepo.js";


import ReportModel from "../models/ReportModel.js";
import { findItemById } from "../repositories/itemRepo.js";

const ENTITY_TYPE = "Report";


export const createReportService = async (data, reporterSocialId) => {
    
  if (!reporterSocialId?.trim()) {
    throw new Error("Reporter socialId is required.");
  }

  if (!data?.reportedAssetId) {
    throw new Error("Asset ID is required.");
  }

  if (!data?.title?.trim()) {
    throw new Error("Report title is required.");
  }

  // Create report
  const report = await createReport({
    reportedBySocialId: reporterSocialId.trim(), 
    reportedAssetId: data.reportedAssetId,
    title: data.title.trim(),
    issue: data?.issue?.trim() || "",
    status: "open", 
  });

  
  // Fetch asset info using existing findItemById (includes category/subcategory)
  const asset = await findItemById(data.reportedAssetId);
  

  return {
    ...report.toObject(),
    assetName: asset?.name || null,
    categoryName: asset?.categoryName || null,
    subCategoryName: asset?.subCategoryName || null,
    categoryId: asset?.categoryId || null,
    subCategoryId: asset?.subCategoryId || null,
  };
};


export const updateReportService = async (id, updates) => {
  const report = await ReportModel.findById(id);
  if (!report) throw new Error("Report not found.");

  const updatePayload = {};

  if (updates.title?.trim()) {
    updatePayload.title = updates.title.trim();
  }

  if (typeof updates.issue === "string") {
    updatePayload.issue = updates.issue.trim();
  }

  if (updates.status) {
    const allowedStatuses = ["open", "in-progress", "resolved", "closed"];
    if (!allowedStatuses.includes(updates.status)) {
      throw new Error("Invalid status value.");
    }
    updatePayload.status = updates.status;
  }

  const updatedReport = await ReportModel.findByIdAndUpdate(id, updatePayload, {
    new: true,
  }).lean();

  console.log(updatedReport,"updatedReport");
  

  // Fetch asset info using findItemById (includes category/subcategory)
  const asset = await findItemById(updatedReport.reportedAssetId);

  return {
    ...updatedReport,
    assetId: asset?._id || null,
    assetName: asset?.name || null,
    categoryName: asset?.categoryName || null,
    subCategoryName: asset?.subCategoryName || null,
    categoryId: asset?.categoryId || null,
    subCategoryId: asset?.subCategoryId || null,
  };
};


export const listReportsService = async ({ page = 1, limit = 10, filter = {} } = {}) => {
  const { reports, total } = await getAllReportsRepo(filter, { page, limit });

  // Attach asset info (name + category/subcategory)
  const updatedReports = await Promise.all(
    reports.map(async (report) => {
      const asset = await findItemById(report.reportedAssetId);

      return {
        ...report,
        assetId: asset?._id || null,
        assetName: asset?.name || null,
        categoryName: asset?.categoryName || null,
        subCategoryName: asset?.subCategoryName || null,
        categoryId: asset?.categoryId || null,
        subCategoryId: asset?.subCategoryId || null,
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



export const findReportByIdService = async (id) => {
  const report = await findReportById(id);
  if (!report) return null;

  const asset = await findItemById(report.reportedAssetId);

  return {
    ...report,
    assetId: asset?._id || null,
    assetName: asset?.name || null,
    categoryName: asset?.categoryName || null,
    subCategoryName: asset?.subCategoryName || null,
    categoryId: asset?.categoryId || null,
    subCategoryId: asset?.subCategoryId || null,
  };
}


export const getMyReportsService = async (userSocialId, { page = 1, limit = 10, filter = {} } = {}) => {
  const { reports, total } = await getMyReportsRepo(userSocialId, filter, { page, limit });

  const updatedReports = await Promise.all(
    reports.map(async (report) => {
      const asset = await findItemById(report.reportedAssetId);

      return {
        ...report,
        assetId: asset?._id || null,
        assetName: asset?.name || null,
        categoryName: asset?.categoryName || null,
        subCategoryName: asset?.subCategoryName || null,
        categoryId: asset?.categoryId || null,
        subCategoryId: asset?.subCategoryId || null,
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
