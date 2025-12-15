
import {
  createReportService,
  deleteReportService,
  findReportByIdService,
  getMyReportsService,
  listReportsService,
  updateReportService,
} from "../services/repoService.js";

import {
  sendResponse,
  sendErrorResponse,
  tryCatch,
} from "../util/responseHandler.js";


export const createReportController = tryCatch(async (req, res) => {
  const reporterSocialId = req.user?.socialId;
console.log("Creating report for user:", reporterSocialId);

  const result = await createReportService(req.body, reporterSocialId);

  return res.status(201).json({
    success: true,
    message: "Report created successfully",
    data: result,
  });
});


export const updateReportController = tryCatch(async (req, res) => {
  const { id } = req.params;
  const { title, issue, status } = req.body;

  const updatedReport = await updateReportService(id, { title, issue, status });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Report updated successfully",
    data: updatedReport,
  });
});


export const getAllReportsController = tryCatch(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const filter = {};
  if (search.trim()) {
    filter.title = { $regex: search.trim(), $options: "i" };
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


export const getMyReportsController = tryCatch(async (req, res) => {
  const userSocialId = req.user.socialId;
  const { page = 1, limit = 10, search = "" } = req.query;

  const filter = {};
  if (search.trim()) {
    filter.title = { $regex: search.trim(), $options: "i" };
  }

  const result = await getMyReportsService(userSocialId, {
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
