import express from "express";
import multer from "multer";
import {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  uploadItemsBulk,
  getAssignedItems,
  getUserCreatedItemsController,
} from "../controllers/itemController.js";

import { authenticate } from "../middlewares/AuthMiddleware.js";
import { authorize } from "../middlewares/PermissionCheckMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import {
  itemValidationSchema,
  itemStatusalidationSchema,
} from "../validationSchema/itemValidationSchema.js";
const router = express.Router();

const upload = multer({ dest: "uploads/" }); 

router.post(
  "/",
  authenticate,
  authorize("item:create"),
  validateRequestData(itemValidationSchema),
  createItem
);

router.post(
  "/bulk-upload",
  authenticate,
  authorize("item:create"),
  upload.single("file"),
  uploadItemsBulk
);

router.get("/", authenticate, authorize("item:view"), getAllItems);
router.get("/assign", authenticate, authorize("item:view"), getAssignedItems);
router.get("/my", authenticate, authorize("item:view"), getUserCreatedItemsController);
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
