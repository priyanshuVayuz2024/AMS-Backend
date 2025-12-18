import express from "express";
import {
  createAssetAssignment,
  getAllAssetAssignments,
  getAssetAssignmentById,
  updateAssetAssignment,
  deleteAssetAssignment,
} from "../controllers/assetAssignmentController.js";
import { checkModulePermission} from "../middlewares/ModulePermissionCheckMiddleware.js";
import { authenticate } from "../middlewares/AuthMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import {
  assetAssignmentStatusValidationSchema,
  assetAssignmentValidationSchema,
} from "../validationSchema/assetAssignmentSchema.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  checkModulePermission("Asset Assignment", "create"),
  validateRequestData(assetAssignmentValidationSchema),
  createAssetAssignment
);


router.get(
  "/",
  authenticate,
  checkModulePermission("Asset Assignment", "read"),
  getAllAssetAssignments
);

router.get(
  "/:id",
  authenticate,
  checkModulePermission("Asset Assignment", "read"),
  getAssetAssignmentById
);

router.put(
  "/:id",
  authenticate,
  checkModulePermission("Asset Assignment", "update"),
  validateRequestData(assetAssignmentValidationSchema),
  updateAssetAssignment
);

router.put(
  "/status/:id",
  authenticate,
  checkModulePermission("Asset Assignment", "update"),
  validateRequestData(assetAssignmentStatusValidationSchema),
  updateAssetAssignment
);

router.delete(
  "/:id",
  authenticate,
  checkModulePermission("Asset Assignment", "delete"),
  deleteAssetAssignment
);

export default router;
