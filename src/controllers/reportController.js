import {
  createReportService,
  deleteReportService,
  findReportByIdService,
  getMyReportsService,
  listReportsService,
  updateReportService,
} from "../services/repoService.js";
import { uploadToCloudinary } from "../middlewares/cloudinaryUploadMiddleware.js";

import {
  sendResponse,
  sendErrorResponse,
  tryCatch,
} from "../util/responseHandler.js";
import { getAllAssetAssignmentsForUser } from "../repositories/assetAssignmentRepo.js";
import UserRole from "../models/UserRoleModel.js";
import { findRoleById } from "../repositories/roleRepo.js";

/**
 * Create Report
 */
export const createReportController = tryCatch(async (req, res, next) => {
  const reportedBy = req.user?.socialId;
  console.log(req.files, "req filesss");

  const imageFiles = req.files?.image || [];
  const videoFiles = req.files?.video || [];

  const imageUrls = await Promise.all(
    imageFiles.map((file) =>
      uploadToCloudinary(file.buffer, "reports", "image")
    )
  );

  const videoUrls = await Promise.all(
    videoFiles.map((file) =>
      uploadToCloudinary(file.buffer, "reports", "video")
    )
  );


  const report = await createReportService(
    {
      ...req.body,
      image: imageUrls,
      video: videoUrls,
    },
    reportedBy
  );

  return res.status(201).json({
    success: true,
    message: "Report created successfully",
    data: report,
  });
});

/**
 * Update Report
 */
export const updateReportController = tryCatch(async (req, res) => {
  const { id } = req.params;

  const { reportTitle, reportDescription, status, assetId } = req.body;

  const imageFiles = req.files?.image || [];
  const videoFiles = req.files?.video || [];

  const imageUrls = await Promise.all(
    imageFiles.map((file) =>
      uploadToCloudinary(file.buffer, "reports", "image")
    )
  );

  const videoUrls = await Promise.all(
    videoFiles.map((file) =>
      uploadToCloudinary(file.buffer, "reports", "video")
    )
  );

  
  const updatedReport = await updateReportService(id, {
    assetId,
    reportTitle,
    reportDescription,
    status,
    image: imageUrls,
    video: videoUrls,
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Report updated successfully",
    data: updatedReport,
  });
});

/**
 * Get All Reports
 */
export const getAllReportsController = tryCatch(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  let filter = {};

  /**
   * req.isModuleAdmin is set by checkModulePermission middleware
   * true  -> user has all permissions (or system admin)
   * false -> user has partial permissions
   */

  if (!req.isModuleAdmin) {
    const assignedAssets = await getAllAssetAssignmentsForUser(
      req.user.socialId
    );

    const assignedAssetIds = assignedAssets.map((a) =>
      a.entityId.toString()
    );

    filter.assetId = { $in: assignedAssetIds };
  }

  if (search.trim()) {
    filter.reportTitle = { $regex: search.trim(), $options: "i" };
  }

  const result = await listReportsService({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    filter,
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Reports fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});



/**
 * Get Report By ID
 */
export const getReportByIdController = tryCatch(async (req, res) => {
  const { id } = req.params;

  const report = await findReportByIdService(id);

  if (!report) {
    return sendResponse({
      res,
      statusCode: 404,
      message: "Report not found",
      data: null,
    });
  }

  return sendResponse({
    res,
    statusCode: 200,
    message: "Report fetched successfully",
    data: report,
  });
});

/**
 * Get My Reports
 */
export const getMyReportsController = tryCatch(async (req, res) => {
  const reportedBy = req.user?.socialId;
  const { page = 1, limit = 10, search = "" } = req.query;

  const filter = {};
  if (search.trim()) {
    filter.reportTitle = { $regex: search.trim(), $options: "i" };
  }

  const result = await getMyReportsService(reportedBy, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    filter,
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Fetched your reports",
    data: result.data,
    meta: result.meta,
  });
});

/**
 * Delete Report
 */
export const deleteReportController = tryCatch(async (req, res) => {
  const { id } = req.params;

  const result = await deleteReportService(id);

  if (!result.success) {
    return sendErrorResponse({
      res,
      statusCode: 404,
      message: result.message,
    });
  }

  return sendResponse({
    res,
    statusCode: 200,
    message: "Report deleted successfully",
    data: result.data,
  });
});
