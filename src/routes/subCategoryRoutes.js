import express from "express";
import { authorize } from "../middlewares/PermissionCheckMiddleware.js";
import { authenticate } from "../middlewares/AuthMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import {
  createStatusSubCategorySchema,
  createSubCategorySchema,
} from "../validationSchema/subCategoryValidationSchema.js";
import {
  createSubCategory,
  deleteSubCategory,
  getAllSubCategories,
  getAssignedSubCategories,
  getSubCategoryById,
  getUserCreatedSubCategoriesController,
  updateSubCategory,
} from "../controllers/subCategoryController.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("subCategory:create"),
  validateRequestData(createSubCategorySchema),
  createSubCategory
);

router.get(
  "/",
  authenticate,
  authorize("subCategory:view"),
  getAllSubCategories
);

router.get(
  "/assign",
  authenticate,
  authorize("subCategory:view"),
  getAssignedSubCategories
);

router.get(
  "/my",
  authenticate,
  authorize("category:view"),
  getUserCreatedSubCategoriesController
);

router.get(
  "/:id",
  authenticate,
  authorize("subCategory:view"),
  getSubCategoryById
);

router.put(
  "/:id",
  authenticate,
  authorize("subCategory:update"),
  validateRequestData(createSubCategorySchema),
  updateSubCategory
);

router.put(
  "/status/:id",
  authenticate,
  authorize("subCategory:update"),
  validateRequestData(createStatusSubCategorySchema),
  updateSubCategory
);

router.delete(
  "/:id",
  authenticate,
  authorize("subCategory:delete"),
  deleteSubCategory
);

export default router;
