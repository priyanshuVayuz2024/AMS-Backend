import express from "express";
import {
  createItem,
  getAllItems,
  getItemById,
  getMyItems,
  updateItem,
} from "../controllers/itemController.js";

import { authenticate } from "../middlewares/AuthMiddleware.js";
import { authorize } from "../middlewares/PermissionCheckMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import itemValidationSchema from "../validationSchema/itemValidationSchema.js";
const router = express.Router();

//  Create Item
router.post(
  "/",
  authenticate,
  authorize("item:create"),
  validateRequestData(itemValidationSchema),
  createItem
);

// / Get all Items
router.get("/", authenticate, authorize("item:view"), getAllItems);

router.get("/my", authenticate, authorize("item:view"), getMyItems);


router.get("/:id", authenticate, authorize("item:view"), getItemById);

router.put("/:id", authenticate, authorize("item:update"), updateItem);



export default router;
