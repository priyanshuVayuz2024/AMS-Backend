import express from "express";
import { authorize } from "../middlewares/PermissionCheckMiddleware.js";
import { authenticate } from "../middlewares/AuthMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import { createSubCategorySchema } from "../validationSchema/subCategoryValidationSchema.js";
import {
  createSubCategory,
  getSubCategoryById,
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
  "/:id",
  authenticate,
  authorize("subCategory:view"),
  getSubCategoryById
);
export default router;
