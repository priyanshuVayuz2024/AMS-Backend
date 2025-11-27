import express from "express";
import {
  createGroup,
  getAllGroups,
  getGroupById,
  getMyGroups,
  updateGroup,
  deleteGroup,
} from "../controllers/groupController.js";

import { authenticate } from "../middlewares/AuthMiddleware.js";
import { authorize } from "../middlewares/PermissionCheckMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import  {groupValidationSchema, groupStatusValidationSchema } from "../validationSchema/groupValidationsSchema.js";
const router = express.Router();

//  Create Group
router.post(
  "/",
  authenticate,
  authorize("group:create"),
  validateRequestData(groupValidationSchema),
  createGroup
);

// / Get all Groups
router.get("/", authenticate, authorize("group:view"), getAllGroups);

router.get("/my", authenticate, authorize("group:view"), getMyGroups);

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
