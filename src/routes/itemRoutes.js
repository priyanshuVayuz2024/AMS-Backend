import express from "express";
import multer from "multer";
import {
  createItem,
  getAllItems,
  getItemById,
  updateItem,
  deleteItem,
  uploadItemsBulk,
} from "../controllers/itemController.js";
import { checkModulePermission} from "../middlewares/ModulePermissionCheckMiddleware.js";
import { authenticate } from "../middlewares/AuthMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import {
  itemValidationSchema,
  itemStatusValidationSchema,
} from "../validationSchema/itemValidationSchema.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" }); 

router.post(
  "/",
  authenticate,
  checkModulePermission("Asset", "create"),
  validateRequestData(itemValidationSchema),
  createItem
);

router.post(
  "/bulk-upload",
  authenticate,
  checkModulePermission("Asset", "create"),
  upload.single("file"),
  uploadItemsBulk
);

router.get(
  "/",
  authenticate,
  checkModulePermission("Asset", "read"),
  getAllItems
);

router.get(
  "/:id",
  authenticate,
  checkModulePermission("Asset", "read"),
  getItemById
);

router.put(
  "/:id",
  authenticate,
  checkModulePermission("Asset", "update"),
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

router.delete(
  "/:id",
  authenticate,
  checkModulePermission("Asset", "delete"),
  deleteItem
);

export default router;
