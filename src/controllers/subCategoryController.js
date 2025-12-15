import { getAssignedCategoriesService } from "../services/categoryService.js";
import {
  createSubCategoryService,
  deleteSubCategoryService,
  getAssignedSubCategoriesService,
  getSubCategoryByIdService,
  getUserCreatedSubCategoriesService,
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
  const createdBy = req.user.socialId;

  const {
    subCategory,
    adminSocialIds: admins,
    message,
  } = await createSubCategoryService({
    categoryId,
    name,
    description,
    adminSocialIds,
    createdBy,
  });

  return sendResponse({
    res,
    statusCode: 201,
    message: message,
    data: {
      subCategory,
      adminSocialIds: admins,
    },
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
  const { categoryId, name, description, adminSocialIds, isActive } = req.body;

  console.log("Updating sub-category with adminSocialIds:", adminSocialIds);

  const {
    updatedSubCategory: subCategory,
    adminSocialIds: admins,
    message,
  } = await updateSubCategoryService(
    id,
    { categoryId, name, description, isActive, },
    adminSocialIds
  );
  

  return sendResponse({
    res,
    statusCode: 200,
    message: message || "Sub-Category updated successfully",
    data: {
      subCategory,
      adminSocialIds: admins,
    },
  });
});

export const getAllSubCategories = tryCatch(async (req, res) => {
  const { page, limit, search = "", categoryId = "" } = req.query;
  const options = { search: search.trim() };

  if (categoryId) {
    options.categoryId = categoryId.trim();
  }

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

  const result = await listSubCategoriesService(options);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Sub Categories fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});

export const getAssignedSubCategories = tryCatch(async (req, res) => {
  const userSocialId = req?.user?.socialId;
  const { page, limit, search = "", categoryId = "" } = req.query;

  const options = { search: search.trim() };

  if (categoryId) {
    options.categoryId = categoryId.trim();
  }

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

  const result = await getAssignedSubCategoriesService(userSocialId, options);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Fetched your sub-categories",
    data: result.data,
    meta: result.meta,
  });
});


export const getUserCreatedSubCategoriesController = tryCatch(
  async (req, res) => {
    const userSocialId = req.user.socialId;
    const { page, limit, search = "", categoryId = "" } = req.query;

    const options = { search: search.trim() };

    if (categoryId) {
      options.categoryId = categoryId.trim();
    }

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

    const result = await getUserCreatedSubCategoriesService(
      userSocialId,
      options
    );

    return sendResponse({
      res,
      statusCode: 200,
      message: "Fetched Sub categories created by you",
      data: result.data,
      meta: result.meta,
    });
  }
);



export const deleteSubCategory = tryCatch(async (req, res) => {
  const { id } = req.params;

  const result = await deleteSubCategoryService(id);

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
    message: "SubCategory deleted successfully",
    data: result.data,
  });
});
