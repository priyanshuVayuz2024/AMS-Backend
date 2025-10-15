import express from "express";
import {
  createCategory,
  getAllCategories,
  getCategoryById,
  getMyCategories,
  updateCategory,
  // getAllCategories,
  // getCategoryById,
  // updateCategory,
  // deleteCategory,
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


// // 🔹 Get all Categories
router.get("/", authenticate, authorize("category:view"), getAllCategories);

router.get("/my", authenticate, authorize("category:view"), getMyCategories);
// // 🔹 Get Category by ID
router.get("/:id", authenticate, authorize("category:view"), getCategoryById);

// // 🔹 Update Category
router.put("/:id", authenticate, authorize("category:update"), updateCategory);





// // 🔹 Delete Category
// router.delete(
//   "/:id",
//   authenticate,
//   authorize("category:delete"),
//   deleteCategory
// );

export default router;
