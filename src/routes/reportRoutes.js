import express from "express";
import {
  getMyReportsController,
  updateReportController,
  deleteReportController,
  createReportController,
  getAllReportsController,
  getReportByIdController
} from "../controllers/reportController.js";

import { authenticate } from "../middlewares/AuthMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import {
  updateReportStatusValidation,
  createReportValidation,
  updateReportValidation,
} from "../validationSchema/ReportValidationSchema.js";
const router = express.Router();

router.post(
  "/",
  authenticate,
  validateRequestData(createReportValidation),
  createReportController 
);

router.get("/", authenticate, getAllReportsController);
router.get("/my", authenticate, getMyReportsController);

router.get("/:id", authenticate, getReportByIdController);
router.put(
  "/:id",
  authenticate,
  validateRequestData(updateReportValidation),
  updateReportController
);

router.put(
  "/status/:id",
  authenticate,
  validateRequestData(updateReportStatusValidation),
  updateReportController
);

router.delete("/:id", authenticate, deleteReportController);

export default router;
