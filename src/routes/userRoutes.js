import express from "express";

import { getAllUsers } from "../controllers/userController.js";

import { authenticate } from "../middlewares/AuthMiddleware.js";
import { authorize } from "../middlewares/PermissionCheckMiddleware.js";
const router = express.Router();

router.get("/", authenticate, getAllUsers);




export default router;
