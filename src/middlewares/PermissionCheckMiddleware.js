import { sendErrorResponse } from "../util/responseHandler.js";
import {
  findUserRolesByUserIdAndEntityId,
  getPermissionByAction,
  hasRolePermission,
} from "../repositories/rolePermissionRepo.js";

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

      const userId = req?.user?.id;

      const permission = await getPermissionByAction(action);
      console.log(permission, "12");
      
      if (!permission) {
        return sendErrorResponse({
          res,
          statusCode: 400,
          message: `Permission "${action}" not found`,
        });
      }

      const userRoles = await findUserRolesByUserIdAndEntityId(
        userId,
        entityId
      );

      if (!userRoles.length) {
        return sendErrorResponse({
          res,
          statusCode: 403,
          message: "No Data Found",
        });
      }

      const roleIds = userRoles.map((ur) => ur.role._id);

      const hasPermission = await hasRolePermission(roleIds, permission._id);

      if (!hasPermission) {
        return sendErrorResponse({
          res,
          statusCode: 403,
          message: "User does not have permission to perform this action",
        });
      }

      next();
    } catch (err) {
      console.error("Authorization error:", err);
      return sendErrorResponse({
        res,
        statusCode: 500,
        message: "Authorization failed",
        error: err.message,
      });
    }
  };
};
