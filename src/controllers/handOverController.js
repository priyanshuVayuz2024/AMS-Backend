import {
  createHandoverService,
  updateHandoverService,
  listHandoversService,
  getMyHandoversService,
  deleteHandoverService,
  findHandoverByIdService,
  acknowledgeHandoverService,
} from "../services/handOverService.js";

import {
  sendResponse,
  sendErrorResponse,
  tryCatch,
} from "../util/responseHandler.js";


export const createHandoverController = tryCatch(async (req, res) => {
  const userSocialId = req.user?.socialId;
  const result = await createHandoverService(req.body, userSocialId);

  return sendResponse({
    res,
    statusCode: 201,
    message: "Handover created successfully",
    data: result,
  });
});


export const updateHandoverController = tryCatch(async (req, res) => {
  const { id } = req.params;
  const updated = await updateHandoverService(id, req.body);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Handover updated successfully",
    data: updated,
  });
});


export const acknowledgeHandoverController = tryCatch(async (req, res) => {
  const { id } = req.params;
  const receiverSocialId = req.user.socialId;

  const updated = await acknowledgeHandoverService(id, receiverSocialId);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Handover acknowledged successfully",
    data: updated,
  });
});


export const getAllHandoversController = tryCatch(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const filter = {};

  if (search.trim()) {
    filter.notes = { $regex: search.trim(), $options: "i" };
  }

  const result = await listHandoversService({
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    filter,
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Handovers fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});



export const getHandoverByIdController = tryCatch(async (req, res) => {
  const { id } = req.params;

  const handover = await findHandoverByIdService(id);

  if (!handover) {
    return sendResponse({
      res,
      statusCode: 404,
      message: "Handover not found",
      data: null,
    });
  }

  return sendResponse({
    res,
    statusCode: 200,
    message: "Handover fetched successfully",
    data: handover,
  });
});



export const getMyHandoversController = tryCatch(async (req, res) => {
  const userSocialId = req.user.socialId;

  const { page = 1, limit = 10, search = "" } = req.query;

  const filter = {};

  if (search.trim()) {
    filter.notes = { $regex: search.trim(), $options: "i" };
  }

  const result = await getMyHandoversService(userSocialId, {
    page: parseInt(page, 10),
    limit: parseInt(limit, 10),
    filter,
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Fetched your handovers",
    data: result.data,
    meta: result.meta,
  });
});


export const deleteHandoverController = tryCatch(async (req, res) => {
  const { id } = req.params;

  const result = await deleteHandoverService(id);

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
    message: "Handover deleted successfully",
    data: result.data,
  });
});


