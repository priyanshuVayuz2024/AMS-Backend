import User from "../models/UserModel.js";
import UserRole from "../models/UserRoleModel.js";
import { getPermissionsByRoleIdRepo } from "../repositories/rolePermissionRepo.js";
import {
  findUserByIdRepo,
  getAllUsers,
  updateUserById,
} from "../repositories/userRepo.js";

export const findUserById = async (id) => {
  return await findUserByIdRepo(id);
};

export const getUserRoleFromUserRolesService = async (socialId) => {
  // return await UserRole.find({
  //   assignedToSocialId: socialId,
  // }).populate({
  //   path: "roleId",
  //   select: "name",
  // });
  let roleRecord = await UserRole.aggregate([
    {
      $match: { assignedToSocialId: socialId },
    },
    {
      $lookup: {
        from: "roles",
        localField: "roleId",
        foreignField: "_id",
        as: "assignedRole",
      },
    },
    {
      $lookup: {
        from: "roles",
        pipeline: [{ $match: { name: "User" } }],
        as: "userRole",
      },
    },
    { $unwind: "$assignedRole" },
    { $unwind: "$userRole" },
    {
      $addFields: {
        roleId: {
          $cond: {
            if: { $eq: ["$isActive", true] },
            then: "$assignedRole",
            else: "$userRole",
          },
        },
      },
    },
    {
      $project: {
        assignedRole: 0,
        userRole: 0,
      },
    },
  ]);
  // roleRecord = roleRecord[0] || null;
  return roleRecord;
};

export const getPermissionsByRoleIdService = async (id) => {
  return await getPermissionsByRoleIdRepo(id);
};

export const getAllUsersService = async ({ page, limit, search = "" }) => {
  const filter = {};

  if (search) {
    filter.name = { $regex: search, $options: "i" };
  }

  const options = {};
  if (page !== undefined && limit !== undefined) {
    options.page = page;
    options.limit = limit;
  }

  const { data, total } = await getAllUsers(filter, options);

  const meta = { total };
  if (page !== undefined && limit !== undefined) {
    meta.page = page;
    meta.limit = limit;
    meta.totalPages = Math.ceil(total / limit);
  }

  return {
    data,
    meta,
  };
};

export const updateUserService = async (id, updates) => {
  const user = await findUserById(id);
  if (!user) throw new Error("User not found.");

  const updatePayload = {};

  if (updates.userId) updatePayload.userId = updates.userId.trim();
  if (typeof updates.isActive === "boolean") {
    updatePayload.isActive = updates.isActive;
  }

  const updatedUser = await updateUserById(id, updatePayload);

  return {
    updatedUser,
    message: "User updated successfully.",
  };
};

export const getUsersWithoutRoles = async () => {
  try {
    const usersWithRoles = await UserRole.find({}, "assignedToSocialId");
    const assignedSocialIds = usersWithRoles.map((u) => u.assignedToSocialId);

    const usersWithoutRoles = await User.find({
      socialId: { $nin: assignedSocialIds },
    });

    return {
      data: usersWithoutRoles,
    };
  } catch (error) {
    console.error("Error fetching users without roles:", error);
    throw error;
  }
};
