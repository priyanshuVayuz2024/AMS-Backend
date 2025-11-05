import express from "express";
import { authorize } from "../middlewares/PermissionCheckMiddleware.js";
import { authenticate } from "../middlewares/AuthMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import { createSubCategorySchema } from "../validationSchema/subCategoryValidationSchema.js";
import {
  createSubCategory,
  getAllSubCategories,
<<<<<<< HEAD
  getMySubCategories,
  getSubCategoryById,
  updateSubCategory,
=======
  getSubCategoryById,
>>>>>>> 615604e9a16e590e1477d1190a5a1a7ba4013a49
} from "../controllers/subCategoryController.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("subCategory:create"),
  validateRequestData(createSubCategorySchema),
  createSubCategory
);

<<<<<<< HEAD

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


=======
>>>>>>> 615604e9a16e590e1477d1190a5a1a7ba4013a49
router.get(
  "/:id",
  authenticate,
  authorize("subCategory:view"),
  getSubCategoryById
);

<<<<<<< HEAD

router.put("/:id", authenticate, authorize("subCategory:update"), updateSubCategory);

=======
router.get(
  "/",
  authenticate,
  authorize("subCategory:view"),
  getAllSubCategories
);
>>>>>>> 615604e9a16e590e1477d1190a5a1a7ba4013a49
export default router;
