import express from "express";
import {
  createItem,
  getAllItems,
  getItemById,
  getMyItems,
  updateItem,
  deleteItem,
} from "../controllers/itemController.js";

import { authenticate } from "../middlewares/AuthMiddleware.js";
import { authorize } from "../middlewares/PermissionCheckMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import {
  itemValidationSchema,
  itemStatusalidationSchema,
} from "../validationSchema/itemValidationSchema.js";
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

router.put(
  "/:id",
  authenticate,
  validateRequestData(itemValidationSchema),
  authorize("item:update"),
  updateItem
);

router.put(
  "/status/:id",
  authenticate,
  validateRequestData(itemStatusalidationSchema),
  authorize("item:update"),
  updateItem
);

router.delete("/:id", authenticate, deleteItem);

export default router;
