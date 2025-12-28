import Role from "../models/RoleModel.js";
import UserRole from "../models/UserRoleModel.js";
import { findRoleById } from "../repositories/roleRepo.js";

export const checkModulePermission = (moduleName, action) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      const roleRecord = await UserRole.findOne({
        assignedToSocialId: user.socialId,
      }).populate("roleId");

      if (!roleRecord?.roleId) {
        return res.status(403).json({ message: "Role not assigned" });
      }

      const fullRole = await findRoleById(roleRecord.roleId._id);

      if (fullRole?.name === "admin") {
        req.isModuleAdmin = true;
        return next();
      }

      const modulePerm = fullRole.modules.find(
        (m) => m.module?.name === moduleName
      );

      if (!modulePerm) {
        return res.status(403).json({
          message: `No access to ${moduleName} module`,
        });
      }

      if (!modulePerm.permissions.includes(action)) {
        return res.status(403).json({
          message: `You do not have permission to ${action} ${moduleName}`,
        });
      }

      const ALL_PERMISSIONS = ["read", "create", "update", "delete"];

      const hasAllPermissions = ALL_PERMISSIONS.every((perm) =>
        modulePerm.permissions.includes(perm)
      );

      req.isModuleAdmin = hasAllPermissions;

      next();
    } catch (error) {
      next(error);
    }
  };
};


