import express from "express";

import { getAllUsers, getUserById, updateUser, fetchUsersWithoutRoles } from "../controllers/userController.js";

import { authenticate } from "../middlewares/AuthMiddleware.js";
import { updateUserStatusSchema } from "../validationSchema/userValidationSchema.js";
import { validateRequestData } from "../middlewares/validateRequestData.js";
const router = express.Router();

router.get("/", authenticate, getAllUsers);
router.get("/nr", authenticate, fetchUsersWithoutRoles);

router.get(
  "/:id",
  authenticate,
  getUserById
);

router.put(
  "/status/:id",
  authenticate,
  validateRequestData(updateUserStatusSchema),
  updateUser
)
export default router;
