import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getAssignedCategories,
  getCategoryById,
  getUserCreatedCategoriesController,
  updateCategory,
} from "../controllers/categoryController.js";
import { authenticate } from "../middlewares/AuthMiddleware.js";
import { authorize } from "../middlewares/PermissionCheckMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import {categoryValidationSchema, categoryStatusValidationSchema } from "../validationSchema/categoryValidationSchema.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("category:create"),
  validateRequestData(categoryValidationSchema),
  createCategory
);

router.get("/", authenticate, authorize("category:view"), getAllCategories);

router.get("/assign", authenticate, authorize("category:view"), getAssignedCategories);
router.get("/my", authenticate, authorize("category:view"), getUserCreatedCategoriesController);

router.get("/:id", authenticate, authorize("category:view"), getCategoryById);

router.put(
  "/:id",
  authenticate,
  authorize("category:update"),
  validateRequestData(categoryValidationSchema),
  updateCategory
);

router.put(
  "/status/:id",
  authenticate,
  authorize("category:update"),
  validateRequestData(categoryStatusValidationSchema),
  updateCategory
);

router.delete(
  "/:id",
  authenticate,
  authorize("category:delete"),
  deleteCategory
);

export default router;
