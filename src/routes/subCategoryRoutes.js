import express from "express";
import { authorize } from "../middlewares/PermissionCheckMiddleware";
import { authenticate } from "../middlewares/AuthMiddleware";
import { validateRequestData } from "../middlewares/validateRequestData";

const router = express.Router();

router.post(
  "/",
  authenticate,
  authorize("subCategory:create"),
  validateRequestData(),
  createCategory
);
