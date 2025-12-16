import express from "express";
import {
  createRoleAssignee,
  deleteRoleAssignee,
  getAllRoleAssignees,
  getRoleAssigneeById,
  updateRoleAssignee,
} from "../controllers/roleAssigneeController.js";
import { authenticate } from "../middlewares/AuthMiddleware.js";
import { requireAdmin } from "../middlewares/AdminCheckMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import {
  roleAssigneeStatusValidationSchema,
  roleAssigneeValidationSchema,
} from "../validationSchema/roleAssigneeValidationSchema.js";

const router = express.Router();

// All role routes → ADMIN ONLY
router.use(authenticate, requireAdmin);

router.post("/", validateRequestData(roleAssigneeValidationSchema), createRoleAssignee);

router.get("/", getAllRoleAssignees);

router.get("/:id", getRoleAssigneeById);    
router.put(
  "/:id",
  validateRequestData(roleAssigneeValidationSchema),
  updateRoleAssignee
);

router.put(
  "/status/:id",
  validateRequestData(roleAssigneeStatusValidationSchema),
  updateRoleAssignee
);

router.delete("/:id", deleteRoleAssignee);
export default router;
