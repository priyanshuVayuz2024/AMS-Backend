import express from "express";
import {
  initializeApprovalFlow,
  approveOrReject,
  getApprovalTrail,
  getApprovals,
} from "../controllers/approvalController.js";

import { authenticate } from "../middlewares/AuthMiddleware.js";
import { authorize } from "../middlewares/PermissionCheckMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import { approvalActionSchema } from "../validationSchema/transferValidationSchema.js";

const router = express.Router();

router.post(
  "/initialize/:transferId",
  authenticate,
  authorize("admin"), 
  initializeApprovalFlow
);

router.put(
  "/action/:requestId",
  authenticate,
  authorize("admin"),
  validateRequestData(approvalActionSchema),
  approveOrReject
);

router.get("/:requestId/trail", authenticate, authorize("admin"), getApprovalTrail);
router.get("/:requestId/all", authenticate, authorize("admin"), getApprovals);

export default router;
