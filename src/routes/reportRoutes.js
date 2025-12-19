import express from "express";
import {
  updateReportController,
  deleteReportController,
  createReportController,
  getAllReportsController,
  getReportByIdController,
} from "../controllers/reportController.js";

import { uploadFiles } from "../middlewares/uploadFiles.js";
import { authenticate } from "../middlewares/AuthMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import {
  reportValidationSchema,
  reportStatusValidationSchema,
} from "../validationSchema/ReportValidationSchema.js";
import { checkModulePermission } from "../middlewares/ModulePermissionCheckMiddleware.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  uploadFiles,
  checkModulePermission("Report", "create"),
  validateRequestData(reportValidationSchema),
  createReportController
);

router.get(
  "/",
  authenticate,
  checkModulePermission("Report", "read"),
  getAllReportsController
);

router.get(
  "/:id",
  authenticate,
  checkModulePermission("Report", "read"),
  getReportByIdController
);
router.put(
  "/:id",
  authenticate,
  uploadFiles,
  checkModulePermission("Report", "update"),
  validateRequestData(reportValidationSchema),
  updateReportController
);

router.put(
  "/status/:id",
  authenticate,
  checkModulePermission("Report", "update"),
  validateRequestData(reportStatusValidationSchema),
  updateReportController
);

router.delete(
  "/:id",
  authenticate,
  checkModulePermission("Report", "delete"),
  deleteReportController
);

export default router;
