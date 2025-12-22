import express from "express";
import multer from "multer";
import {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  uploadItemsBulk,
  getUnallocatedAssets,
} from "../controllers/itemController.js";
import { checkModulePermission } from "../middlewares/ModulePermissionCheckMiddleware.js";
import { authenticate } from "../middlewares/AuthMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import { itemValidationSchema, itemStatusValidationSchema } from "../validationSchema/itemValidationSchema.js";
import { uploadFiles } from "../middlewares/uploadFiles.js"; 

const router = express.Router();

router.post(
  "/",
  authenticate,
  checkModulePermission("Asset", "create"),
  uploadFiles, 
  validateRequestData(itemValidationSchema),
  createItem
);

router.post(
  "/bulk-upload",
  authenticate,
  checkModulePermission("Asset", "create"),
  multer({ dest: "uploads/" }).single("file"),
  uploadItemsBulk
);

router.get("/", authenticate, checkModulePermission("Asset", "read"), getAllItems);

router.get("/un-allocated", authenticate, getUnallocatedAssets);

router.get("/:id", authenticate, checkModulePermission("Asset", "read"), getItemById);

router.put(
  "/:id",
  authenticate,
  checkModulePermission("Asset", "update"),
  uploadFiles, 
  validateRequestData(itemValidationSchema),
  updateItem
);

router.put(
  "/status/:id",
  authenticate,
  checkModulePermission("Asset", "update"),
  validateRequestData(itemStatusValidationSchema),
  updateItem
);

router.delete("/:id", authenticate, checkModulePermission("Asset", "delete"), deleteItem);

export default router;
