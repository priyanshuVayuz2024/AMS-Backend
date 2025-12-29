import express from "express";
import {
  createRole,
  deleteRole,
  getAllRoles,
  getRoleById,
  updateRole,
} from "../controllers/roleController.js";
import { authenticate } from "../middlewares/AuthMiddleware.js";
import { requireAdmin } from "../middlewares/AdminCheckMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import {
  roleStatusValidationSchema,
  roleValidationSchema,
} from "../validationSchema/rolesValidationSchema.js";
import { getActiveRoles } from "../controllers/roleAssigneeController.js";

const router = express.Router();

// All role routes → ADMIN ONLY
router.use(authenticate, requireAdmin);

router.post("/", validateRequestData(roleValidationSchema), createRole);

router.get("/", getAllRoles);
router.get("/active", getActiveRoles);

router.get("/:id", getRoleById);

router.put(
  "/:id",
  validateRequestData(roleValidationSchema),
  updateRole
);

router.put(
  "/status/:id",
  validateRequestData(roleStatusValidationSchema),
  updateRole
);

router.delete("/:id", deleteRole);

export default router;
