import Role from "../models/RoleModel.js";

/**
 * Create Role
 */
export const createRole = async (roleData) => {
  return await Role.create(roleData);
};

/**
 * Find Role by ID
 */
export const findRoleById = async (id) => {
  const role = await Role.findById(id)
    .populate("modules.module")
    .populate("modules.permissions");

  console.log(
    "findRoleById result:",
    JSON.stringify(role, null, 2)
  );

  return role;
};

/**
 * Find Role by Name (case-insensitive)
 */
export const findRoleByName = async (name) => {
  return await Role.findOne({
    name: new RegExp(`^${name}$`, "i"),
  });
};

/**
 * Update Role by ID
 */
export const updateRoleById = async (id, updateData) => {
  return await Role.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  })
    .populate("modules.module")
    .populate("modules.permissions");
};

/**
 * Get All Roles (with pagination)
 */
export const getAllRoles = async (
  { search } = {},
  { page, limit } = {}
) => {
  const queryObj = {};

  if (search) {
    queryObj.name = { $regex: search, $options: "i" };
  }

  let query = Role.find(queryObj)
    .sort({ createdAt: -1 })
    .populate("modules.module")
    .populate("modules.module.name")
    .populate("modules.permissions");

    
  if (page || limit) {
    const pageNumber = Number(page) > 0 ? Number(page) : 1;
    const pageSize = Number(limit) > 0 ? Number(limit) : 10;

    const skip = (pageNumber - 1) * pageSize;
    query = query.skip(skip).limit(pageSize);
  }

  const [data, total] = await Promise.all([
    query.exec(),
    Role.countDocuments(queryObj),
  ]);

  return { data, total };
};

/**
 * Delete Role by ID
 */
export const deleteRoleById = async (id) => {
  return await Role.findByIdAndDelete(id);
};
