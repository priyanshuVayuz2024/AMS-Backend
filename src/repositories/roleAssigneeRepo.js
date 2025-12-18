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
  return await UserRole.find({ roleId, isActive: true }).populate("roleId");
};

/**
 * Find Roles assigned to a Social ID
 */
export const findRolesBySocialId = async (assignedToSocialId) => {
  return await UserRole.find({
    assignedToSocialId,
    isActive: true,
  }).populate("roleId");
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
  const pipeline = [];

  // Stage 1: Match basic filters
  const matchStage = {};
  if (roleId) matchStage.roleId = roleId;
  if (typeof isActive === "boolean") matchStage.isActive = isActive;

  pipeline.push({ $match: matchStage });

  // Stage 2: Lookup user data
  pipeline.push({
    $lookup: {
      from: "users",
      localField: "assignedToSocialId",
      foreignField: "socialId",
      as: "userData",
    },
  });

  pipeline.push({
  $lookup: {
    from: "roles",
    let: { roleIdd: "$roleId" },
    pipeline: [
      { $match: { $expr: { $eq: ["$_id", "$$roleIdd"] } } },

      { $unwind: { path: "$modules", preserveNullAndEmptyArrays: true } },
      {
        $lookup: {
          from: "modules",
          localField: "modules.module",
          foreignField: "_id",
          as: "moduleInfo",
        },
      },
      { $unwind: { path: "$moduleInfo", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 1,
          name: 1,
          description: 1,
          "modules.moduleId": "$modules.module",
          "modules.permissions": "$modules.permissions",
          "modules.moduleName": "$moduleInfo.name",
        },
      },
      {
        $group: {
          _id: "$_id",
          name: { $first: "$name" },
          description: { $first: "$description" },
          modules: {
            $push: "$modules",
          },
        },
      },
    ],
    as: "roles",
  },
});


  // Stage 4: Unwind arrays for search
  pipeline.push(
    { $unwind: { path: "$userData", preserveNullAndEmptyArrays: true } },
    { $unwind: { path: "$roleData", preserveNullAndEmptyArrays: true } }
  );

  // Stage 5: Apply search filter (search in socialId, username, or role name)
  if (search) {
    pipeline.push({
      $match: {
        $or: [
          { assignedToSocialId: { $regex: search, $options: "i" } },
          { "userData.name": { $regex: search, $options: "i" } },
          { "roleData.name": { $regex: search, $options: "i" } },
        ],
      },
    });
  }

  // Stage 6: Sort
  pipeline.push({ $sort: { createdAt: -1 } });

  // Get total count before pagination
  const countPipeline = [...pipeline];
  countPipeline.push({ $count: "total" });
  const countResult = await UserRole.aggregate(countPipeline);
  const total = countResult[0]?.total || 0;

  // Stage 7: Pagination
  if (page || limit) {
    const pageNumber = Number(page) > 0 ? Number(page) : 1;
    const pageSize = Number(limit) > 0 ? Number(limit) : 10;
    const skip = (pageNumber - 1) * pageSize;

    pipeline.push({ $skip: skip }, { $limit: pageSize });
  }

  // Stage 8: Project final structure
  pipeline.push({
    $project: {
      roles:1,
      _id: 1,
      roleId: 1,
      assignedToSocialId: 1,
      isActive: 1,
      createdAt: 1,
      updatedAt: 1,
      userName: "$userData.name",
      roleName: "$roleData.name",
      Modules: "$roleData.modules",
    },
  });


  const data = await UserRole.aggregate(pipeline);

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
  }).populate({
    path: "roleId",
    match: { name: roleName, isActive: true },
  });
};
