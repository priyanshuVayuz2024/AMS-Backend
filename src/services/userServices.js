import UserRole from "../models/UserRoleModel.js";
import { getPermissionsByRoleIdRepo } from "../repositories/rolePermissionRepo.js";
import {
  findUserByIdRepo,
  getAllUsers,
  getUserRoleFromUserRolesRepo,
  updateUserById,
} from "../repositories/userRepo.js";

export const findUserById = async (id) => {
  return await findUserByIdRepo(id);
};

export const getUserRoleFromUserRolesService = async (socialId) => {
  return await UserRole.find({
    assignedToSocialId: socialId,
  })
  .populate({
    path: "roleId",
    select: "name"   
  });
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