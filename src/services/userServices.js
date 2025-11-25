import { getPermissionsByRoleIdRepo } from "../repositories/rolePermissionRepo.js";
import {
  findUserByIdRepo,
  getAllUsers,
  getUserRoleFromUserRolesRepo,
} from "../repositories/userRepo.js";

export const findUserById = async (id) => {
  return await findUserByIdRepo(id);
};

export const getUserRoleFromUserRolesService = async (id) => {
  return await getUserRoleFromUserRolesRepo(id);
};



export const getPermissionsByRoleIdService = async (id) => {
  return await getPermissionsByRoleIdRepo(id);
};


export const getAllUsersService = async ({ page = 1, limit = 10, search = "" }) => {
    const filter = {};

    // case-insensitive partial match
    if (search) {
        filter.name = { $regex: search, $options: "i" }; 
    }

    const { data, total } = await getAllUsers(filter, { page, limit });

    return {
        data,
        meta: {
            total,
            page,
            limit,
            totalPages: Math.ceil(total / limit),
        },
    };
};