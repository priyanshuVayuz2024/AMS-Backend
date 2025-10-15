import Permission from "../models/PermissionModel";
import Role from "../models/RoleModel";
import RolePermission from "../models/RolePermissionModel";
import UserRole from "../models/UserRoleModel";

export const getPermissionById = async (id) => {
  return await Permission.findById(id);
};

export const getPermissionByAction = async (action) => {
  return await Permission.findOne(action);
};

export const getRoleById = async (id) => {
  return await Role.findById(id);
};

export const findUserRolesByUserIdAndEntityId = async (
  userId,
  entityId = null
) => {
  try {
    const filter = { user: userId };
    if (entityId) {
      filter.entityId = entityId;
    }

    const userRoles = await UserRole.find(filter).populate("role");
    return userRoles;
  } catch (error) {
    console.error("Error fetching user roles:", error);
    throw new Error("Failed to fetch user roles");
  }
};

export const hasRolePermission = async (roleIds, permissionId) => {
  try {
    const exists = await RolePermission.exists({
      role: { $in: roleIds },
      permission: permissionId,
    });

    return !!exists; // convert result to boolean
  } catch (error) {
    console.error("Error checking role permission:", error);
    throw new Error("Failed to check role permission");
  }
};
