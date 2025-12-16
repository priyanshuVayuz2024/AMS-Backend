import Role from "../models/RoleModel.js";
import UserRole from "../models/UserRoleModel.js";
import { findRoleById } from "../repositories/roleRepo.js";

export const checkModulePermission = (moduleName, action) => {
  return async (req, res, next) => {
    const user = req.user; // assume user info already populated via auth middleware
    console.log(user, "User in module permission middleware");

    // if (!user || !user.roleId) {
    //   return res.status(403).json({ message: "No role assigned" });
    // }

    const role = await UserRole.findOne({
      assignedToSocialId: user.socialId,
    }).populate("roleId");
    console.log(role, "rolessss");

    const roleId = role.roleId._id;
    const fullRole = await findRoleById(roleId);
    console.log(fullRole, "fullRole");

    const modulePerm = fullRole.modules.find(
      (m) => m.module?.name === moduleName
    );

    if(fullRole?.name === "admin"){
      return next();
    }
    if (!modulePerm || !modulePerm.permissions.includes(action)) {
      return res.status(403).json({
        message: `You do not have permission to ${action} ${moduleName}`,
      });
    }
    next();
  };
};
