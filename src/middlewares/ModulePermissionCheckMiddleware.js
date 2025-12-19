import Role from "../models/RoleModel.js";
import UserRole from "../models/UserRoleModel.js";
import { findRoleById } from "../repositories/roleRepo.js";

export const checkModulePermission = (moduleName, action) => {
  return async (req, res, next) => {
    const user = req.user;

    const roleRecord = await UserRole.findOne({ assignedToSocialId: user.socialId }).populate("roleId");
    const fullRole = await findRoleById(roleRecord.roleId._id);

    if (fullRole?.name === "admin") {
      req.isStrictReadOnly = false;
      return next();
    }

    const modulePerm = fullRole.modules.find(m => m.module?.name === moduleName);

    if (!modulePerm || !modulePerm.permissions.includes(action)) {
      return res.status(403).json({ message: `You do not have permission to ${action} ${moduleName}` });
    }

    req.isStrictReadOnly = modulePerm.permissions.length === 1 && modulePerm.permissions.includes("read");

    next();
  };
};

