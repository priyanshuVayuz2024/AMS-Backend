import express from "express";
import {
  createModule,
  deleteModule,
  getAllModules,
  getModuleById,
  updateModule,
} from "../controllers/moduleController.js";
import { authenticate } from "../middlewares/AuthMiddleware.js";
import { requireAdmin } from "../middlewares/AdminCheckMiddleware.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
import {
  moduleValidationSchema,
  moduleStatusValidationSchema,
} from "../validationSchema/moduleValidationSchema.js";

const router = express.Router();

// All module routes → ADMIN ONLY
router.use(authenticate, requireAdmin);

router.post("/", validateRequestData(moduleValidationSchema), createModule);

router.get("/", getAllModules);

router.get("/:id", getModuleById);

router.put(
  "/:id",
  validateRequestData(moduleValidationSchema),
  updateModule
);

router.put(
  "/status/:id",
  validateRequestData(moduleStatusValidationSchema),
  updateModule
);

router.delete("/:id", deleteModule);

export default router;
