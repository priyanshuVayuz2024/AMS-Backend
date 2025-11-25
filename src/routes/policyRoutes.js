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
  validateRequestData(policyValidationSchema),
  createPolicy
);

router.get(
  "/",
  authenticate,
  getAllPolicies
);

router.get(
  "/my",
  authenticate,
  getMyPolicies
);

router.get(
  "/:id",
  authenticate,
  getPolicyById
);

router.put(
  "/:id",
  authenticate,
  validateRequestData(policyValidationSchema),
  updatePolicy
);

export default router;
