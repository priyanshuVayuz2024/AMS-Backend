import Role from "../models/RoleModel.js";
import {
  createModule,
  deleteModuleById,
  findModuleById,
  findModuleByName,
  getActiveModules,
  getAllModules,
  updateModuleById,
} from "../repositories/moduleRepo.js";
import { checkUserHasRole } from "../repositories/roleAssigneeRepo.js";
import Module from "../models/moduleModel.js";

/**
 * Create Module
 */
export const createModuleService = async (data) => {
  if (!data.name || data.name.trim() === "") {
    throw new Error("Module name is required.");
  }

  const trimmedName = data.name.trim();

  const existing = await findModuleByName(trimmedName);
  if (existing) {
    throw new Error("Module name already exists.");
  }

  const module = await createModule({
    name: trimmedName,
    description: data.description?.trim(),
  });

  return { module };
};

/**
 * Update Module
 */
export const updateModuleService = async (id, updates) => {
  const module = await findModuleById(id);
  if (!module) {
    throw new Error("Module not found.");
  }

  const newName = updates.name?.trim();
  if (newName && newName !== module.name) {
    const existing = await findModuleByName(newName);
    if (existing) {
      throw new Error("Module name already exists.");
    }
  }

  const updatePayload = {
    name: updates.name?.trim() || module.name,
    description: updates.description?.trim() || module.description,
  };

  if (typeof updates.isActive === "boolean") {
    updatePayload.isActive = updates.isActive;
  }

  const updatedModule = await updateModuleById(id, updatePayload);

  if (module.isActive === true && updates.isActive === false) {
    //  Find roles that include this module
    const roles = await Role.find({ "modules.module": id });

    for (const role of roles) {
      const moduleIds = role.modules.map((m) => m.module);

      //  Check if ANY module is still active
      const activeModuleExists = await Module.exists({
        _id: { $in: moduleIds },
        isActive: true,
      });

      //  If NO active modules → deactivate role
      if (!activeModuleExists) {
        await Role.updateOne(
          { _id: role._id },
          { $set: { isActive: false } }
        );
      }
    }
  }

  return { updatedModule };
};



export const listModulesService = async (
  { page, limit, search = "" },
  user
) => {
  const filters = { search };

  const isAdminAssignment = await checkUserHasRole(
    user.socialId,
    "admin"
  );

  if (!isAdminAssignment || !isAdminAssignment.roleId) {
    filters.isActive = true;
  }

  const { data, total } = await getAllModules(
    filters,
    { page, limit }
  );

  return {
    data,
    meta: {
      total,
      page: page || null,
      limit: limit || null,
      totalPages:
        page || limit ? Math.ceil(total / (limit || 10)) : 1,
    },
  };
};


export const listActiveModulesService = async ({ search = "" }, user) => {
  const filters = {
    search,
    isActive: true,
  };

  const { data, total } = await getActiveModules(filters); 

  return {
    data,
    meta: {
      total,
    },
  };
};


/**
 * Get Module by ID
 */
export const getModuleByIdService = async (moduleId) => {
  const module = await findModuleById(moduleId);
  if (!module) {
    throw new Error("Module not found.");
  }

  return module.toObject ? module.toObject() : module;
};

/**
 * Delete Module
 */
export const deleteModuleService = async (id) => {
  const deleted = await deleteModuleById(id);
console.log(deleted, "deleted");

  if (!deleted) {
    return {
      success: false,
      message: "Module not found",
    };
  }

  return {
    success: true,
    data: deleted,
  };
};
