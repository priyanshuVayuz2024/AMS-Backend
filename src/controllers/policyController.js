import {
  createPolicyService,
  getPolicyByIdService,
  listPolicyService,
  updatePolicyService,
  getMyPolicyService,
  deletePolicyService,
} from "../services/policyService.js";

import {
  sendResponse,
  sendErrorResponse,
  tryCatch,
} from "../util/responseHandler.js";

export const createPolicy = tryCatch(async (req, res) => {
  let {
    policyId,
    url,
    description,
    parentType,
    parentId,
    adminSocialIds,
    isActive,
  } = req.body;


  const {
    policy,
    adminSocialIds: admins,
    message,
  } = await createPolicyService(
    {
      policyId,
      url,
      description,
      parentType,
      parentId,
      isActive,
    },
    adminSocialIds
  );

  return sendResponse({
    res,
    statusCode: 201,
    message: message || "Policy created successfully",
    data: {
      policy: {
        ...(policy.toObject?.() || policy),
        adminSocialIds: admins,
      },
    },
  });
});

export const updatePolicy = tryCatch(async (req, res) => {
  const { id } = req.params;
  const { policyId, url, description, adminSocialIds, isActive } = req.body;

  const {
    updatedPolicy: policy,
    adminSocialIds: admins,
    message,
  } = await updatePolicyService(
    id,
    { policyId, url, description, isActive },
    adminSocialIds
  );

  return sendResponse({
    res,
    statusCode: 200,
    message: message || "Policy updated successfully",
    data: {
      policy: {
        ...(policy.toObject?.() || policy),
        adminSocialIds: admins,
      },
    },
  });
});

export const getAllPolicies = tryCatch(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  if (
    isNaN(parsedPage) ||
    isNaN(parsedLimit) ||
    parsedPage <= 0 ||
    parsedLimit <= 0
  ) {
    return sendErrorResponse({
      res,
      statusCode: 400,
      message:
        "Invalid pagination parameters. 'page' and 'limit' must be positive numbers.",
    });
  }

  const result = await listPolicyService({
    page: parsedPage,
    limit: parsedLimit,
    search: search.trim(),
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Policies fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const getPolicyById = tryCatch(async (req, res) => {
  const { id } = req.params;
  const policy = await getPolicyByIdService(id);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Policy fetched successfully",
    data: policy,
  });
});

export const getMyPolicies = tryCatch(async (req, res) => {
  const userSocialId = req.user.socialId;
  const { page = 1, limit = 10, search = "" } = req.query;

  const parsedPage = parseInt(page, 10);
  const parsedLimit = parseInt(limit, 10);

  if (
    isNaN(parsedPage) ||
    isNaN(parsedLimit) ||
    parsedPage <= 0 ||
    parsedLimit <= 0
  ) {
    return sendErrorResponse({
      res,
      statusCode: 400,
      message:
        "Invalid pagination parameters. 'page' and 'limit' must be positive numbers.",
    });
  }

  const result = await getMyPolicyService(userSocialId, {
    page: parsedPage,
    limit: parsedLimit,
    search: search.trim(),
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Fetched your policies",
    data: result.data,
    meta: result.meta,
  });
});


export const deletePolicy = tryCatch(async (req, res) => {
  const { id } = req.params;

  const result = await deletePolicyService(id);

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
    message: "Category deleted successfully",
    data: result.data,
  });
});
