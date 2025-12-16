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

    // 1️⃣ Find active roles & populate roleId
    const userRoles = await UserRole.find({
      assignedToSocialId: userSocialId,
    }).populate("roleId");
    console.log(userRoles,"userROles");
    

    // 2️⃣ No roles assigned
    if (!userRoles.length) {
      return res.status(403).json({
        success: false,
        message: "Access denied. No role assigned.",
      });
    }

    
    // 3️⃣ Check admin role
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
    console.error("Admin middleware error:", error);
    return res.status(500).json({
      success: false,
      message: "Authorization failed",
    });
  }
};
