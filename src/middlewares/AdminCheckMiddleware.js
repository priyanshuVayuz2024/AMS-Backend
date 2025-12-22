import UserRole from "../models/UserRoleModel.js";
import Role from "../models/RoleModel.js";

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const userSocialId = req.user.socialId;

    const userRoles = await UserRole.find({
      assignedToSocialId: userSocialId,
    }).populate("roleId");
    

    if (!userRoles.length) {
      return res.status(403).json({
        success: false,
        message: "Access denied. No role assigned.",
      });
    }

    
    const isAdmin = userRoles.some(
      (ur) => ur.roleId?.name?.toLowerCase() === "admin"
    );
    

    if (!isAdmin) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Admin role required.",
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Authorization failed",
    });
  }
};
