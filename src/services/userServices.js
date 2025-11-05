import { getPermissionsByRoleIdRepo } from "../repositories/rolePermissionRepo.js";
import {
  findUserByIdRepo,
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