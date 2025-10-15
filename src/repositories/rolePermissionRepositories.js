import Permission from "../models/PermissionModel";
import Role from "../models/RoleModel";

export const getPermissionById = async (id) => {
  return await Permission.findById(id);
};

export const getRoleById = async (id) => {
  return await Role.findById(id);
};
