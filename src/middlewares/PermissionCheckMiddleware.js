import UserRole from "../models/UserRole.js";
import RolePermission from "../models/RolePermission.js";
import Permission from "../models/Permission.js";
import { sendErrorResponse } from "../util/responseHandler.js";
import {
  findUserRolesByUserIdAndEntityId,
  getPermissionByAction,
  hasRolePermission,
} from "../repositories/rolePermissionRepositories.js";

export const authorize = (action, entityId = null) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return sendErrorResponse({
          res,
          statusCode: 401,
          message: "User not authenticated",
        });
      }

      const userId = req.user.id;

      // 1️⃣ Find the permission document
      const permission = await getPermissionByAction(action);
      if (!permission) {
        return sendErrorResponse({
          res,
          statusCode: 400,
          message: `Permission "${action}" not found`,
        });
      }

      // 2️⃣ Find all roles of the user (with optional entityId context)
      const userRoles = await findUserRolesByUserIdAndEntityId(
        userId,
        entityId
      );

      if (!userRoles.length) {
        return sendErrorResponse({
          res,
          statusCode: 403,
          message: "No roles assigned to user",
        });
      }

      // 3️⃣ Check if any role has the required permission
      const roleIds = userRoles.map((ur) => ur.role._id);

      const hasPermission = await hasRolePermission(roleIds, permission._id);

      if (!hasPermission) {
        return sendErrorResponse({
          res,
          statusCode: 403,
          message: "User does not have permission to perform this action",
        });
      }

      // ✅ User authorized
      next();
    } catch (err) {
      console.error("Authorization error:", err.message);
      return sendErrorResponse({
        res,
        statusCode: 500,
        message: "Authorization failed",
        error: err.message,
      });
    }
  };
};
