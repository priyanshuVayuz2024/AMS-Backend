import {
  createSubCategoryService,
  getMySubCategoriesService,
  getSubCategoryByIdService,
  listSubCategoriesService,
  updateSubCategoryService,
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


export const updateSubCategory = tryCatch(async (req, res) => {
  const { id } = req.params;
  const { name, description, adminSocialIds } = req.body;

  const { updatedSubCategory: subCategory, message } = await updateSubCategoryService(
    id,
    { name, description },
    adminSocialIds
  );

  return sendResponse({
    res,
    statusCode: 200,
    message: message || "Sub-Category updated successfully",
    data: subCategory,
  });
});

export const getAllSubCategories = tryCatch(async (req, res) => {
  const { page = 1, limit = 10, search = "", subCategoryId = "" } = req.query;

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
    subCategoryId: subCategoryId,
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Sub Categories fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});



export const getMySubCategories = tryCatch(async (req, res) => {
  console.log("testing of it>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
  const userSocialId = req?.user?.socialId;
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

  console.log(userSocialId,"56");
  
  const result = await getMySubCategoriesService(userSocialId, {
    page: parsedPage,
    limit: parsedLimit,
    search: search.trim(),
  });

  return sendResponse({
    res,
    statusCode: 200,
    message: "Fetched your sub-categories",
    data: result.data,
    meta: result.meta,
  });
});
