import express from "express";
import {
  createTransfer,
  updateTransfer,
  listTransfers,
  findTransferById,
  getMyTransfers,
  deleteTransfer,
} from "../controllers/transferController.js";

import { authenticate } from "../middlewares/AuthMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import { createTransferRequestSchema, updateTransferRequestSchema, updateTransferStatusSchema } from "../validationSchema/transferValidationSchema.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  validateRequestData(createTransferRequestSchema),
  createTransfer
);

router.get("/", authenticate, listTransfers);
router.get("/my/:userSocialId", authenticate, getMyTransfers);
router.get("/:id", authenticate, findTransferById);

router.put(
  "/:id",
  authenticate,
  validateRequestData(updateTransferRequestSchema),
  updateTransfer
);

router.delete("/:id", authenticate, deleteTransfer);

export default router;
