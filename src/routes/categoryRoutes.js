import express from "express";
import {
    createCategory,
    getAllCategories,
    getCategoryById,
    updateCategory,
    deleteCategory,
} from "../controllers/categoryController.js";
import { authenticate } from "../middlewares/AuthMiddleware.js";
import { authorize } from "../middlewares/PermissionCheckMiddleware.js";

const router = express.Router();

// 🔹 Create Category
router.post(
    "/",
    authenticate,
    authorize("category:create"),
    createCategory
);

// 🔹 Get all Categories
router.get(
    "/",
    authenticate,
    authorize("category:view"),
    getAllCategories
);

// 🔹 Get Category by ID
router.get(
    "/:id",
    authenticate,
    authorize("category:view"),
    getCategoryById
);

// 🔹 Update Category
router.put(
    "/:id",
    authenticate,
    authorize("category:update"),
    updateCategory
);

// 🔹 Delete Category
router.delete(
    "/:id",
    authenticate,
    authorize("category:delete"),
    deleteCategory
);

export default router;
