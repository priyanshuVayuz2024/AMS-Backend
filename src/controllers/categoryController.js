import {
  createCategoryService,
  deleteCategoryService,
  getAssignedCategoriesService,
  getCategoryByIdService,
  getUserCreatedCategoriesService,
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
  const createdBy = req.user.socialId;

  const {
    category,
    adminSocialIds: admins,
    message,
  } = await createCategoryService(
    { name, description, createdBy },
    adminSocialIds
  );

  return sendResponse({
    res,
    statusCode: 201,
    message: message || "Category created successfully",
    data: {
      category: {
        ...(category.toObject?.() || category),
        adminSocialIds: admins,
      },
    },
  });
});


export const updateCategory = tryCatch(async (req, res) => {
  const { id } = req.params;
  const { name, description, adminSocialIds, isActive } = req.body;

  const {
    updatedCategory: category,
    adminSocialIds: admins,
    message,
  } = await updateCategoryService(
    id,
    { name, description, isActive },
    adminSocialIds
  );

  return sendResponse({
    res,
    statusCode: 201,
    message: message || "Category updated successfully",
    data: {
      category: {
        ...(category.toObject?.() || category),
        adminSocialIds: admins,
      },
    },
  });
});

export const getAllCategories = tryCatch(async (req, res) => {
  const { page, limit, search = "" } = req.query;
  const options = { search: search.trim() };

  if (page !== undefined && limit !== undefined) {
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

    options.page = parsedPage;
    options.limit = parsedLimit;
  }

  const result = await listCategoriesService(options);
  
  return sendResponse({
    res,
    statusCode: 200,
    message: "Categories fetched successfully",
    data: result?.data,
    meta: result?.meta,
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

export const getAssignedCategories = tryCatch(async (req, res) => {
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

  const result = await getAssignedCategoriesService(userSocialId, {
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


export const getUserCreatedCategoriesController = tryCatch(
  async (req, res) => {
    const userSocialId = req.user.socialId;
    let { page, limit, search = "" } = req.query;

    const parsedPage = page ? parseInt(page, 10) : null;
    const parsedLimit = limit ? parseInt(limit, 10) : null;

    if ((parsedPage && isNaN(parsedPage)) || (parsedLimit && isNaN(parsedLimit))) {
      return sendErrorResponse({
        res,
        statusCode: 400,
        message: "'page' and 'limit' must be valid numbers when provided.",
      });
    }

    const result = await getUserCreatedCategoriesService(userSocialId, {
      page: parsedPage,
      limit: parsedLimit,
      search: search.trim(),
    });

    return sendResponse({
      res,
      statusCode: 200,
      message: "Fetched categories created by you",
      data: result.data,
      meta: result.meta,
    });
  }
);



export const deleteCategory = tryCatch(async (req, res) => {
  const { id } = req.params;

  const result = await deleteCategoryService(id);

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
