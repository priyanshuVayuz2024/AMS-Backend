import { getAllUsersService } from "../services/userServices.js";
import mongoose from "mongoose";

import {
  sendResponse,
  sendErrorResponse,
  tryCatch,
} from "../util/responseHandler.js";


export const getAllUsers = tryCatch(async (req, res) => {
  const { page = 1, limit = 10, search = "" } = req.query;

  // 🔹 Validate pagination params
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

  const result = await getAllUsersService({
    page: parsedPage,
    limit: parsedLimit,
    search: search.trim(),
  });


  return sendResponse({
    res,
    statusCode: 200,
    message: "Items fetched successfully",
    data: result.data,
    meta: result.meta,
  });
});
