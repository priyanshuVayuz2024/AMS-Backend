import {
  createSubCategoryService,
  getSubCategoryByIdService,
} from "../services/subCategoryService.js";
import { sendResponse, tryCatch } from "../util/responseHandler.js";

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
