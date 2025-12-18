import Role from "../models/RoleModel.js";
import User from "../models/UserModel.js";
import {
  createRoleAssignee,
  findRoleAssigneeById,
  findRolesBySocialId,
  findAssigneesByRoleId,
  updateRoleAssigneeById,
  getAllRoleAssignees,
  deleteRoleAssigneeById,
} from "../repositories/roleAssigneeRepo.js";

import { findRoleById } from "../repositories/roleRepo.js";
import { findUserByIdRepo } from "../repositories/userRepo.js";

/**
 * Create Role Assignee
 */
export const createRoleAssigneeService = async (data) => {
  if (!data.roleId) {
    throw new Error("Role ID is required.");
  }

  if (!data.assignedToSocialId || data.assignedToSocialId.trim() === "") {
    throw new Error("Assigned Social ID is required.");
  }

  // Validate role exists
  const role = await findRoleById(data.roleId);
  if (!role) {
    throw new Error("Role not found.");
  }

  const assignee = await createRoleAssignee({
    roleId: data.roleId,
    assignedToSocialId: data.assignedToSocialId.trim(),
    description: data.description?.trim() || "",
    isActive: typeof data.isActive === "boolean" ? data.isActive : true,
  });

  return { assignee };
};

export const updateRoleAssigneeService = async (id, updates) => {
  const assignee = await findRoleAssigneeById(id);
  if (!assignee) {
    throw new Error("Role assignee not found.");
  }

  const updatePayload = {};

  if (updates.roleId && updates.roleId !== assignee.roleId.toString()) {
    const role = await findRoleById(updates.roleId);
    if (!role) {
      throw new Error("Role not found.");
    }
    updatePayload.roleId = updates.roleId;
  }

  if (
    updates.assignedToSocialId &&
    updates.assignedToSocialId.trim() !== assignee.assignedToSocialId
  ) {
    updatePayload.assignedToSocialId = updates.assignedToSocialId.trim();
  }

  if (updates.description !== undefined) {
    updatePayload.description = updates.description.trim();
  }

  if (typeof updates.isActive === "boolean") {
    updatePayload.isActive = updates.isActive;
  }

  if (Object.keys(updatePayload).length === 0) {
    return { updatedAssignee: assignee };
  }

  const updatedAssignee = await updateRoleAssigneeById(id, updatePayload);

  return { updatedAssignee };
};

/**
 * Get Role Assignee by ID
 */
export const getRoleAssigneeByIdService = async (id) => {
  const assignee = await findRoleAssigneeById(id);
  if (!assignee) {
    throw new Error("Role assignee not found.");
  }

  return assignee.toObject ? assignee.toObject() : assignee;
};

/**
 * Get Roles by Social ID
 */
export const getRolesBySocialIdService = async (assignedToSocialId) => {
  if (!assignedToSocialId) {
    throw new Error("Assigned Social ID is required.");
  }

  return await findRolesBySocialId(assignedToSocialId);
};

/**
 * Get Assignees by Role ID
 */
export const getAssigneesByRoleIdService = async (roleId) => {
  if (!roleId) {
    throw new Error("Role ID is required.");
  }

  // Validate role exists
  const role = await findRoleById(roleId);
  if (!role) {
    throw new Error("Role not found.");
  }

  return await findAssigneesByRoleId(roleId);
};

/**
 * List Role Assignees (with pagination)
 */
export const listRoleAssigneesService = async ({
  page,
  limit,
  search,
  roleId,
  isActive,
}) => {
  const { data, total } = await getAllRoleAssignees(
    { search, roleId, isActive },
    { page, limit }
  );

  const filteredData = data.filter((item) => {
    if (!item.roles || !Array.isArray(item.roles)) return true;

    return !item.roles.some(
      (role) => role.name?.toLowerCase() === "admin"
    );
  });

  const filteredTotal = filteredData.length;

  return {
    data: filteredData.map((item) => ({
      ...item,
      roleName: item.roleName || null,
      userName: item.userName || null,
    })),
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
 * Delete Role Assignee
 */
export const deleteRoleAssigneeService = async (id) => {
  const deleted = await deleteRoleAssigneeById(id);

  if (!deleted) {
    return {
      success: false,
      message: "Role assignee not found",
    };
  }

  return {
    success: true,
    data: deleted,
  };
};
