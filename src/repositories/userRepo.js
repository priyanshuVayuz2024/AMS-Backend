import Role from "../models/RoleModel.js";
import User from "../models/UserModel.js";
import UserRole from "../models/UserRoleModel.js";
import mongoose from "mongoose";

export const findUserByIdRepo = async (id) => {
  const userId = new mongoose.Types.ObjectId(id);

  const result = await User.aggregate([
    { $match: { _id: userId } },

    {
      $lookup: {
        from: "userroles",
        localField: "socialId",
        foreignField: "assignedToSocialId",
        as: "userRoles",
      },
    },

    {
      $lookup: {
        from: "roles",
        localField: "userRoles.roleId",
        foreignField: "_id",
        as: "roles",
      },
    },

    {
      $lookup: {
        from: "modules",
        localField: "roles.modules.module",
        foreignField: "_id",
        as: "allModules",
      },
    },

    {
      $addFields: {
        roles: {
          $map: {
            input: "$roles",
            as: "role",
            in: {
              _id: "$$role._id",
              name: "$$role.name",
              description: "$$role.description",
              isActive: "$$role.isActive",
              createdAt: "$$role.createdAt",
              updatedAt: "$$role.updatedAt",
              modules: {
                $map: {
                  input: "$$role.modules",
                  as: "mod",
                  in: {
                    module: {
                      id: "$$mod.module",
                      name: {
                        $let: {
                          vars: {
                            matchedModule: {
                              $arrayElemAt: [
                                {
                                  $filter: {
                                    input: "$allModules",
                                    as: "m",
                                    cond: {
                                      $eq: ["$$m._id", "$$mod.module"],
                                    },
                                  },
                                },
                                0,
                              ],
                            },
                          },
                          in: "$$matchedModule.name",
                        },
                      },
                    },
                    permissions: "$$mod.permissions",
                  },
                },
              },
            },
          },
        },
      },
    },

    {
      $lookup: {
        from: "reports",
        localField: "socialId",
        foreignField: "reportedBy",
        as: "reports",
      },
    },

    {
      $lookup: {
        from: "entityadminmappings",
        localField: "socialId",
        foreignField: "userSocialId",
        as: "assetMappings",
      },
    },

    {
      $addFields: {
        assetObjectIds: {
          $map: {
            input: "$assetMappings",
            as: "am",
            in: { $toObjectId: "$$am.entityId" },
          },
        },
      },
    },
    

    {
      $lookup: {
        from: "items",
        localField: "assetObjectIds",
        foreignField: "_id",
        as: "assets",
      },
    },

    {
      $project: {
        name: 1,
        email: 1,
        image: 1,
        socialId: 1,
        isActive: 1,
        roles: 1,
        reports: 1,
        assets: 1,
        createdAt: 1,
      },
    },
  ]);

  return result[0] || null;
};

export const assignRoleToUsers = async (
  userSocialIds,
  roleName,
  entityId = null
) => {
  if (!Array.isArray(userSocialIds) || userSocialIds.length === 0) {
    throw new Error("At least one user socialId is required.");
  }

  let message = null;

  const role = await Role.findOne({ name: roleName });
  if (!role) {
    throw new Error(`Role "${roleName}" not found`);
  }
  const users = await User.find({ socialId: { $in: userSocialIds } });

  const foundSocialIds = users.map((u) => u.socialId);
  const missingIds = userSocialIds.filter((id) => !foundSocialIds.includes(id));
  if (missingIds.length) {
    console.warn(`⚠️ Users not found for socialIds: ${missingIds.join(", ")}`);
    message = `Users not found for socialIds: ${missingIds.join(", ")}`;
  }

  const ops = users.map((user) =>
    UserRole.findOneAndUpdate(
      { user: user._id, role: role._id, entityId },
      { user: user._id, role: role._id, entityId },
      { upsert: true, new: true }
    )
  );
  await Promise.all(ops);
  return message;
};

export const getUserRoleById = async (id) => {
  const user = await UserRole.findOne({ user: id }).select("role");
  return user ? user.role : null;
};

export const removeRoleFromUsers = async (
  userSocialIds,
  roleName,
  entityId = null
) => {
  if (!Array.isArray(userSocialIds) || userSocialIds.length === 0) return;

  const role = await Role.findOne({ name: roleName });
  if (!role) throw new Error(`Role "${roleName}" not found`);

  const users = await User.find({ socialId: { $in: userSocialIds } });
  if (users.length === 0) return;

  const ops = users.map((user) =>
    UserRole.deleteOne({ user: user._id, role: role._id, entityId })
  );

  await Promise.all(ops);
  return true;
};

export const getUserRoleFromUserRolesRepo = async (id) => {
  return await UserRole.find({ userId: id })
    .populate("roleId")
    .populate("userId");
};

export const getAllUsers = async (filter = {}, options = {}) => {
  let query = User.find(filter).sort({ createdAt: -1 });
  if (options.page !== undefined && options.limit !== undefined) {
    const skip = (options.page - 1) * options.limit;
    query = query.skip(skip).limit(options.limit);
  }

  const [data, total] = await Promise.all([
    query.exec(),
    User.countDocuments(filter),
  ]);

  return { data, total };
};

export const updateUserById = async (id, updateData) => {
  return await User.findByIdAndUpdate(id, updateData, { new: true });
};
