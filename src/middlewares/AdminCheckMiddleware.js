import UserRole from "../models/UserRoleModel.js";
import Role from "../models/RoleModel.js";

export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }

    const userRole = await UserRole.findOne({ userId: req.user.id });

    if (!userRole) {
      return res
        .status(403)
        .json({ success: false, message: "Access denied. No role assigned." });
    }

    const id = userRole.get("roleId");
    const role = await Role.findById(id);

    if (!role || role.name !== "admin") {
      return res
        .status(403)
        .json({
          success: false,
          message: "Access denied. Admin role required.",
        });
    }

    next();
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, message: "Authorization failed" });
  }
};
