import UserRole from "../models/UserRoleModel.js";
/**
 * Create Role Assignee
 */
export const createRoleAssignee = async (assigneeData) => {
  return await UserRole.create(assigneeData);
};

/**
 * Find Role Assignee by ID
 */
export const findRoleAssigneeById = async (id) => {

  return await UserRole.findById(id).populate("roleId");
};

/**
 * Find Assignees by Role ID
 */
export const findAssigneesByRoleId = async (roleId) => {
  return await UserRole.find({ roleId, isActive: true })
    .populate("roleId");
};

/**
 * Find Roles assigned to a Social ID
 */
export const findRolesBySocialId = async (assignedToSocialId) => {
  return await UserRole.find({
    assignedToSocialId,
    isActive: true,
  })
    .populate("roleId");
};

/**
 * Update Role Assignee by ID
 */
export const updateRoleAssigneeById = async (id, updateData) => {
  return await UserRole.findByIdAndUpdate(id, updateData, {
    new: true,
    runValidators: true,
  }).populate("roleId");
};

/**
 * Get All Role Assignees (with pagination & search)
 */
export const getAllRoleAssignees = async (
  { search, roleId, isActive } = {},
  { page, limit } = {}
) => {
  const queryObj = {};

  if (roleId) queryObj.roleId = roleId;
  if (typeof isActive === "boolean") queryObj.isActive = isActive;

  if (search) {
    queryObj.assignedToSocialId = { $regex: search, $options: "i" };
  }


  let query = UserRole.find(queryObj)
    .sort({ createdAt: -1 })
    .populate("roleId");

  if (page || limit) {
    const pageNumber = Number(page) > 0 ? Number(page) : 1;
    const pageSize = Number(limit) > 0 ? Number(limit) : 10;

    const skip = (pageNumber - 1) * pageSize;
    query = query.skip(skip).limit(pageSize);
  }

  const [data, total] = await Promise.all([
    query.exec(),
    UserRole.countDocuments(queryObj),
  ]);

  return { data, total };
};

/**
 *  Delete Role Assignee
 */
export const deleteRoleAssigneeById = async (id) => {
  return await UserRole.findByIdAndDelete(id);
};


export const checkUserHasRole = async (assignedToSocialId, roleName) => {
  return await UserRole.findOne({
    assignedToSocialId,
    isActive: true,
  })
    .populate({
      path: "roleId",
      match: { name: roleName, isActive: true },
    });
};
