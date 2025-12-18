import {
  createRole,
  deleteRoleById,
  findRoleById,
  findRoleByName,
  getAllRoles,
  updateRoleById,
} from "../repositories/roleRepo.js";

import Module from "../models/moduleModel.js";
import Permission from "../models/PermissionModel.js";

/**
 * Create Role
 */
export const createRoleService = async (data) => {
  if (!data.name || data.name.trim() === "") {
    throw new Error("Role name is required.");
  }

  const trimmedName = data.name.trim();

  const existing = await findRoleByName(trimmedName);
  if (existing) {
    throw new Error("Role name already exists.");
  }

  const role = await createRole({
    name: trimmedName,
    description: data.description?.trim(),
    modules: data.modules,
  });

  return { role };
};

/**
 * Update Role
 */
export const updateRoleService = async (id, updates) => {
  const role = await findRoleById(id);
  if (!role) {
    throw new Error("Role not found.");
  }

  const newName = updates.name?.trim();
  if (newName && newName !== role.name) {
    const existing = await findRoleByName(newName);
    if (existing) {
      throw new Error("Role name already exists.");
    }
  }

  const updatePayload = {
    name: updates.name?.trim() || role.name,
    description: updates.description?.trim() || role.description,
  };

  if (Array.isArray(updates.modules)) {
    updatePayload.modules = updates.modules;
  }

  if (typeof updates.isActive === "boolean") {
    updatePayload.isActive = updates.isActive;
  }

  const updatedRole = await updateRoleById(id, updatePayload);

  return { updatedRole };
};


/**
 * List Roles (with dynamic admin modules and permissions)
 */
export const listRolesService = async ({ page, limit, search = "" }) => {
  const { data, total } = await getAllRoles({ search }, { page, limit });

  const adminRole = data.find(
    (role) => role.name.toLowerCase() === "admin"
  );

  if (adminRole) {
    const allModules = await Module.find({});
    const allPermissions = await Permission.find({});
    const actions = allPermissions.map((p) => p.action);

    adminRole.modules = allModules.map((mod) => ({
      module: mod,
      permissions: actions,
    }));
  }

  const filteredData = data.filter(
    (role) => role.name.toLowerCase() !== "admin"
  );

  const filteredTotal = filteredData.length;

  return {
    data: filteredData,
    meta: {
      total: filteredTotal,
      page: page || null,
      limit: limit || null,
      totalPages:
        page || limit
          ? Math.ceil(filteredTotal / (limit || 10))
          : 1,
    },
  };
};


/**
 * Get Role by ID
 */
export const getRoleByIdService = async (roleId) => {
  const role = await findRoleById(roleId);
  
  if (!role) {
    throw new Error("Role not found.");
  }

  return role.toObject ? role.toObject() : role;
};

/**
 * Delete Role
 */
export const deleteRoleService = async (id) => {
  const deleted = await deleteRoleById(id);

  if (!deleted) {
    return {
      success: false,
      message: "Role not found",
    };
  }

  return {
    success: true,
    data: deleted,
  };
};
