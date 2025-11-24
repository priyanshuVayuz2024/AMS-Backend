import express from "express";
import { authenticate } from "../middlewares/AuthMiddleware.js";
import { authorize } from "../middlewares/PermissionCheckMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";

import { createPolicy, getAllPolicies, getMyPolicies, getPolicyById, updatePolicy } from "../controllers/policyController.js";
import policyValidationSchema from "../validationSchema/policyValidationsSchema.js";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("policy:create"),
  validateRequestData(policyValidationSchema),
  createPolicy
);

router.get(
  "/",
  authenticate,
  authorize("policy:view"),
  getAllPolicies
);

router.get(
  "/my",
  authenticate,
  authorize("policy:view"),
  getMyPolicies
);

router.get(
  "/:id",
  authenticate,
  authorize("policy:view"),
  getPolicyById
);

router.put(
  "/:id",
  authenticate,
  authorize("policy:update"),
  validateRequestData(policyValidationSchema),
  updatePolicy
);

export default router;
