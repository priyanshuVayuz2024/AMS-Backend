import express from "express";
import { authorize } from "../middlewares/PermissionCheckMiddleware.js";
import { authenticate } from "../middlewares/AuthMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import { createSubCategorySchema } from "../validationSchema/subCategoryValidationSchema.js";
import {
  createSubCategory,
  deleteSubCategory,
  getAllSubCategories,
  getMySubCategories,
  getSubCategoryById,
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
  "/my",
  authenticate,
  authorize("subCategory:view"),
  getMySubCategories
);


router.get(
  "/:id",
  authenticate,
  authorize("subCategory:view"),
  getSubCategoryById
);


router.put("/:id", authenticate, authorize("subCategory:update"), updateSubCategory);

router.delete("/:id", authenticate, authorize("subCategory:delete") , deleteSubCategory);

export default router;
