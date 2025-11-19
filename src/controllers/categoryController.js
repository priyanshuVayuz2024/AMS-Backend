import {
  createCategoryService,
  getCategoryByIdService,
  getMyCategoriesService,
  listCategoriesService,
  updateCategoryService,
} from "../services/categoryService.js";
import {
  sendResponse,
  sendErrorResponse,
  tryCatch,
} from "../util/responseHandler.js";

export const createCategory = tryCatch(async (req, res) => {
  const { name, description, adminSocialIds } = req.body;

  const { category, message } = await createCategoryService(
    { name, description },
    adminSocialIds
  );

  return sendResponse({
    res,
    statusCode: 201,
    message: message || "Category created successfully",
    data: category,
  });
});

export const updateCategory = tryCatch(async (req, res) => {
  const { id } = req.params;
  const { name, description, adminSocialIds, isActive } = req.body;
 

  const { updatedCategory: category, message } = await updateCategoryService(
    id,
    { name, description, isActive },
    adminSocialIds
  );

  return sendResponse({
    res,
    statusCode: 200,
    message: message || "Category updated successfully",
    data: category,
  });
});



export const getAllCategories = tryCatch(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  // 🔹 Validate pagination params
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
      message: "Invalid pagination parameters. 'page' and 'limit' must be positive numbers.",
    });
  }

  const result = await listCategoriesService({
    page: parsedPage,
    limit: parsedLimit,
    search: search.trim(),
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Categories fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const getCategoryById = tryCatch(async (req, res) => {
  const { id } = req.params;
  const category = await getCategoryByIdService(id);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Category fetched successfully",
    data: category,
  });
});

export const getMyCategories = tryCatch(async (req, res) => {
  const userSocialId = req.user.socialId;
  const { page = 1, limit = 10, search = "" } = req.query;

  // 🔹 Validate pagination params
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
      message: "Invalid pagination parameters. 'page' and 'limit' must be positive numbers.",
    });
  }

  const result = await getMyCategoriesService(userSocialId, {
    page: parsedPage,
    limit: parsedLimit,
    search: search.trim(),
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Fetched your categories",
    data: result.data,
    meta: result.meta,
  });
});