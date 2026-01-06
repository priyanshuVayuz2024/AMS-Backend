import jwt from "jsonwebtoken";
import { sendErrorResponse } from "../util/responseHandler.js";
import { findUserByIdRepo } from "../repositories/userRepo.js";
import UserRole from "../models/UserRoleModel.js";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const roleId = req.headers.roleauth;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendErrorResponse({
        res,
        statusCode: 401,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, JWT_SECRET);

    const user = await findUserByIdRepo(decoded.id);
    if (!user || !user.isActive) {
      return sendErrorResponse({
        res,
        statusCode: 401,
        message: "User not found or inactive",
      });
    }
    // const userRole = await UserRole.findOne({
    //   assignedToSocialId: user.socialId,
    // });
    let userRole = await UserRole.aggregate([
      {
        $match: { assignedToSocialId: user.socialId },
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
      {
        $limit: 1,
      },
    ]);
    userRole = userRole[0] || null;
    console.log("userRole........", userRole);
    if (!userRole) {
      return sendErrorResponse({
        res,
        statusCode: 401,
        message: "User role not found",
      });
    }

    // ⚠ Force logout if role updated by Admin
    console.log(
      "userRole.roleId,roleId.............",
      !userRole.roleId._id.equals(roleId),
      userRole.roleId,
      roleId
    );
    if (!userRole.roleId._id.equals(roleId)) {
      return sendErrorResponse({
        res,
        statusCode: 401,
        message: "Your role was updated by Admin, please login again",
      });
    }
    req.user = {
      id: user?._id,
      socialId: user?.socialId,
      name: user?.name,
      email: user?.email,
      department: user?.department,
    };

    next();
  } catch (err) {
    console.error("Authentication error:", err.message);
    return sendErrorResponse({
      res,
      statusCode: 401,
      message: "Invalid or expired token",
      error: err.message,
    });
  }
};
