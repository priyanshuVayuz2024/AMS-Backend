import Permission from "../models/PermissionModel.js";
import Role from "../models/RoleModel.js";
import RolePermission from "../models/RolePermissionModel.js";
import UserRole from "../models/UserRoleModel.js";
import { sendErrorResponse } from "../util/responseHandler.js";



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
            const permission = await Permission.findOne({ action });
            if (!permission) {
                return sendErrorResponse({
                    res,
                    statusCode: 400,
                    message: `Permission "${action}" not found`,
                });
            }

            // 2️⃣ Find all roles of the user (with optional entityId context)
            const userRoles = await UserRole.find({
                user: userId,
                ...(entityId && { entityId }),
            }).populate("role");



            console.log(userRoles, 'useee');


            if (!userRoles.length) {
                return sendErrorResponse({
                    res,
                    statusCode: 403,
                    message: "No roles assigned to user",
                });
            }

            // 3️⃣ Check if any role has the required permission
            const roleIds = userRoles.map((ur) => ur.role._id);


            const permm = await RolePermission.find({
                role: { $in: roleIds },
            }).populate("permission");

            console.log(permm, 'meee');



            const hasPermission = await RolePermission.exists({
                role: { $in: roleIds },
                permission: permission._id,
            });

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
