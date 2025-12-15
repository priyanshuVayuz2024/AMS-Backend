import express from "express";
import {
  createGroup,
  getAllGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
  getAssignedGroups,
  getUserCreatedGroupsController,
} from "../controllers/groupController.js";

import { authenticate } from "../middlewares/AuthMiddleware.js";
import { authorize } from "../middlewares/PermissionCheckMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import  {groupValidationSchema, groupStatusValidationSchema } from "../validationSchema/groupValidationsSchema.js";
const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("group:create"),
  validateRequestData(groupValidationSchema),
  createGroup
);

router.get("/", authenticate, authorize("group:view"), getAllGroups);

router.get("/assign", authenticate, authorize("group:view"), getAssignedGroups);
router.get("/my", authenticate, authorize("group:view"), getUserCreatedGroupsController);

router.get("/:id", authenticate, authorize("group:view"), getGroupById);

router.put(
  "/:id",
  authenticate,
  authorize("group:update"),
  validateRequestData(groupValidationSchema),
  updateGroup
);


router.put(
  "/status/:id",
  authenticate,
  authorize("group:update"),
  validateRequestData(groupStatusValidationSchema),
  updateGroup
);


router.delete("/:id", authenticate, deleteGroup);

export default router;
