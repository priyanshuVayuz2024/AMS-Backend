import express from "express";
import { authenticate } from "../middlewares/AuthMiddleware.js";
import { authorize } from "../middlewares/PermissionCheckMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";

import {
  createSla,
  deleteSla,
  getAllSla,
  getMySla,
  getSlaById,
  updateSla,
} from "../controllers/slaController.js";
import {
  slaValidationSchema,
  slaStatusValidationSchema,
} from "../validationSchema/slaValidationsSchema.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  validateRequestData(slaValidationSchema),
  createSla
);

router.get("/", authenticate, getAllSla);
router.get("/my", authenticate, getMySla);
router.get("/:id", authenticate, getSlaById);

router.put(
  "/:id",
  authenticate,
  validateRequestData(slaValidationSchema),
  updateSla
);

router.put(
  "/status/:id",
  authenticate,
  validateRequestData(slaStatusValidationSchema),
  updateSla
);

router.delete("/:id", authenticate, deleteSla);

export default router;
