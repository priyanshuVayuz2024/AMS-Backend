import {
  createSubCategoryService,
  getSubCategoryByIdService,
  listSubCategoriesService,
} from "../services/subCategoryService.js";
import {
  sendErrorResponse,
  sendResponse,
  tryCatch,
} from "../util/responseHandler.js";

export const createSubCategory = tryCatch(async (req, res) => {
  const { categoryId, name, description, adminSocialIds } = req.body;

  const { subCategory, message } = await createSubCategoryService({
    categoryId,
    name,
    description,
    adminSocialIds,
  });

  // 3️⃣ Return success response
  return sendResponse({
    res,
    statusCode: 201,
    message: message,
    data: subCategory,
  });
});

export const getSubCategoryById = tryCatch(async (req, res) => {
  const { id } = req.params;
  const subCategory = await getSubCategoryByIdService(id);
  return sendResponse({
    res,
    statusCode: 200,
    message: "Sub Category Fetched Successfully!!",
    data: subCategory,
  });
});

export const getAllSubCategories = tryCatch(async (req, res) => {
  const { page = 1, limit = 10, search = "", categoryId = "" } = req.query;

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
      message:
        "Invalid pagination parameters. 'page' and 'limit' must be positive numbers.",
    });
  }

  const result = await listSubCategoriesService({
    page: parsedPage,
    limit: parsedLimit,
    search: search.trim(),
    categoryId: categoryId,
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Sub Categories fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});
