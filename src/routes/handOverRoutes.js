import express from "express";
import {
  getMyHandoversController,
  updateHandoverController,
  deleteHandoverController,
  createHandoverController,
  getAllHandoversController,
  getHandoverByIdController,
  acknowledgeHandoverController
} from "../controllers/handOverController.js";

import { authenticate } from "../middlewares/AuthMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import {
  handoverStatusValidationSchema,
  handoverValidationSchema,
  handoverUpdateValidationSchema,
  handoverAcknowledgeSchema
} from "../validationSchema/handOverValidationSchema.js";
const router = express.Router();

router.post(
  "/",
  authenticate,
  validateRequestData(handoverValidationSchema),
  createHandoverController
);

router.get("/", authenticate, getAllHandoversController);
router.get("/my", authenticate, getMyHandoversController);

router.get("/:id", authenticate, getHandoverByIdController);
router.put(
  "/:id",
  authenticate,
  validateRequestData(handoverUpdateValidationSchema),
  updateHandoverController
);

router.put(
  "/status/:id",
  authenticate,
  validateRequestData(handoverStatusValidationSchema),
  updateHandoverController
);



router.delete("/:id", authenticate, deleteHandoverController);

router.put(
  "/:id/acknowledge",
  authenticate,
  validateRequestData(handoverAcknowledgeSchema),
  acknowledgeHandoverController
);

export default router;
