import express from "express";
import {
  createCategory,
  deleteCategory,
  getAllCategories,
  getCategoryById,
  getMyCategories,
  updateCategory,
} from "../controllers/categoryController.js";
import { authenticate } from "../middlewares/AuthMiddleware.js";
import { authorize } from "../middlewares/PermissionCheckMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import categoryValidationSchema from "../validationSchema/categoryValidationSchema.js";

const router = express.Router();

// 🔹 Create Category
router.post(
  "/",
  authenticate,
  authorize("category:create"),
  validateRequestData(categoryValidationSchema),
  createCategory
);

router.get("/", authenticate, authorize("category:view"), getAllCategories);

router.get("/my", authenticate, authorize("category:view"), getMyCategories);
router.get("/:id", authenticate, authorize("category:view"), getCategoryById);

router.put("/:id", authenticate, authorize("category:update"), updateCategory);

router.delete(
  "/:id",
  authenticate,
  authorize("category:delete"),
  deleteCategory
);

export default router;
