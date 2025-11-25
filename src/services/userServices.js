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

