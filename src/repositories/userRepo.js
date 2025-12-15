import Role from "../models/RoleModel.js";
import User from "../models/UserModel.js";
import UserRole from "../models/UserRoleModel.js";

export const findUserByIdRepo = async (id) => {
  return await User.findById(id);
};

export const assignRoleToUsers = async (
  userSocialIds,
  roleName,
  entityId = null
) => {
  if (!Array.isArray(userSocialIds) || userSocialIds.length === 0) {
    throw new Error("At least one user socialId is required.");
  }

  let message = null

  const role = await Role.findOne({ name: roleName });
  if (!role) {
    throw new Error(`Role "${roleName}" not found`);
  }
  const users = await User.find({ socialId: { $in: userSocialIds } });

  const foundSocialIds = users.map((u) => u.socialId);
  const missingIds = userSocialIds.filter((id) => !foundSocialIds.includes(id));
  if (missingIds.length) {
    console.warn(`⚠️ Users not found for socialIds: ${missingIds.join(", ")}`);
    message = `Users not found for socialIds: ${missingIds.join(", ")}`
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

