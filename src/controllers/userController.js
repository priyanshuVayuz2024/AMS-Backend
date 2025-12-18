import { findUserById, getAllUsersService, getUsersWithoutRoles, updateUserService } from "../services/userServices.js";

import {
  sendResponse,
  sendErrorResponse,
  tryCatch,
} from "../util/responseHandler.js";


export const getUserById = tryCatch(async (req, res) => {
  const { id } = req.params;
  const user = await findUserById(id);

  return sendResponse({
    res,
    statusCode: 200,
    message: "User fetched successfully",
    data: user,
  });
});

export const getAllUsers = tryCatch(async (req, res) => {
  const { page, limit, search = "" } = req.query;
  
  
  const options = { search: search.trim() };
  
  if (page !== undefined && limit !== undefined) {
    const parsedPage = parseInt(page, 10);
    const parsedLimit = parseInt(limit, 10);
    
    if (
      isNaN(parsedPage) ||
      isNaN(parsedLimit) ||
      parsedPage <= 0 ||
      parsedLimit <= 0
    ) {
      return sendErrorResponse({
        res,
        statusCode: 400,
        message:
          "Invalid pagination parameters. 'page' and 'limit' must be positive numbers.",
      });
    }

    options.page = parsedPage;
    options.limit = parsedLimit;
  }

  const result = await getAllUsersService(options);

  return sendResponse({
    res,
    statusCode: 200,
    message: "Items fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});



export const updateUser = tryCatch(async (req, res) => {
  const { id } = req.params;
  const { userId, isActive } = req.body;

  const {
    updatedUser: user,
    message,
  } = await updateUserService(
    id,
    { userId, isActive },
  );

  return sendResponse({
    res,
    statusCode: 200,
    message: message || "User updated successfully",
    data: {
      user: {
        ...(user.toObject?.() || user),
      },
    },
  });
});


export const fetchUsersWithoutRoles = async (req, res) => {
  try {
    const users = await getUsersWithoutRoles();
    
    return sendResponse({
    res,
    statusCode: 200,
    message: "Items fetched successfully",
    data: users.data,
  });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};


