import axios from "axios";
import jwt from "jsonwebtoken";
import { sendResponse, sendErrorResponse } from "../util/responseHandler.js";
import User from "../models/UserModel.js";
import {
  getPermissionsByRoleIdService,
  getUserRoleFromUserRolesService,
} from "../services/userServices.js";
import { getEntitiesFromEntityAdminMappingServiceBySocialIdAndEntityId } from "../services/entityAdminMappingService.js";
import mongoose from "mongoose";
import { findRoleById } from "../repositories/roleRepo.js";
import Role from "../models/RoleModel.js";
import UserRole from "../models/UserRoleModel.js";

const PROFILE_BACKEND_URL = "https://profilebackend.vayuz.com/users/api/signin";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRY = "24h";
const RECAPTCHA_SECRET_KEY = process.env.RECAPTCHA_SECRET_KEY;

// Verify reCAPTCHA token with Google
const verifyRecaptchaToken = async (token) => {
  console.log(
    {
      params: {
        secret: RECAPTCHA_SECRET_KEY,
        response: token,
      },
    },
    "payload....."
  );
  try {
    const response = await axios.post(
      "https://www.google.com/recaptcha/api/siteverify",
      null,
      {
        params: {
          secret: RECAPTCHA_SECRET_KEY,
          response: token,
        },
      }
    );
    console.log(response, "response.....");

    return response.data;
  } catch (err) {
    console.error("reCAPTCHA verification error:", err.message);
    return { success: false };
  }
};

export const login = async (req, res) => {
  try {
    const { socialId, authenticationCode, recaptchaToken } = req.body;

    if (!recaptchaToken) {
      return sendErrorResponse({
        res,
        statusCode: 400,
        message: "reCAPTCHA token is required",
      });
    }
    console.log(recaptchaToken, "recaptcha");

    if (!socialId || !authenticationCode) {
      return sendErrorResponse({
        res,
        statusCode: 400,
        message: "socialId and authenticationCode are required",
      });
    }

    const recaptchaData = await verifyRecaptchaToken(recaptchaToken);
    console.log(recaptchaData, "recaptchaData");

    const RECAPTCHA_SCORE_THRESHOLD = 0.5;

    if (
      !recaptchaData.success ||
      recaptchaData.score < RECAPTCHA_SCORE_THRESHOLD
    ) {
      return sendErrorResponse({
        res,
        statusCode: 403,
        message: "reCAPTCHA verification failed. Please try again.",
      });
    }

    const { data } = await axios.post(PROFILE_BACKEND_URL, {
      adminlogin: false,
      email: socialId,
      password: authenticationCode,
      requestfrom: "social",
    });

    console.log("Login", data);

    if (data?.code == 404 || data?.code == 400) {
      return sendErrorResponse({
        res,
        statusCode: 401,
        message: "Invalid Credentials",
      });
    }

    let user = await User.findOne({ socialId });

    if (!user) {
      user = await User.create({
        name: data.name || socialId,
        email: data.email || `${socialId}@example.com`,
        socialId,
        department: data.department || "",
        syncedAt: new Date(),
        isActive: true,
      });
    } else {
      user.name = data.name || user.name;
      user.email = data.email || user.email;
      user.department = data.department || user.department;
      user.profile_image = data.profile_image || user?.profile_image;
      user.syncedAt = new Date();
      await user.save();
    }

    let userRoles = await getUserRoleFromUserRolesService(user.socialId);
    console.log(userRoles, "userRoles");

    //  If no role assigned → assign default "User" role
    if (!userRoles || userRoles.length === 0) {
      const defaultUserRole = await Role.findOne({
        name: "User",
        isActive: true,
      });

      const defaultUserRole2 = await Role.findOne({
        name: "User",
        // isActive: true,
      });
      console.log(defaultUserRole, "defaultUserRole");

      if (defaultUserRole) {
        // prevent duplicates
        const exists = await UserRole.findOne({
          assignedToSocialId: user.socialId,
          roleId: defaultUserRole._id,
        });

        if (!exists) {
          await UserRole.create({
            assignedToSocialId: user.socialId,
            roleId: defaultUserRole._id,
          });
        }

        // re-fetch roles so rest of code works unchanged
        userRoles = await getUserRoleFromUserRolesService(user.socialId);
      }
    }

    // Filter only active user roles
    const activeUserRoles = userRoles.filter((ur) => ur.isActive === true);
    console.log(activeUserRoles, "activeUserRoles");

    if (activeUserRoles.length === 0) {
      return sendErrorResponse({
        res,
        statusCode: 403,
        message: "No active roles assigned to this user",
      });
    }

    // Group userRoles by roleId
    const roleMap = new Map();

    for (const ur of activeUserRoles) {
      // Extract roleId - handle both populated and non-populated cases
      const roleIdValue =
        typeof ur.roleId === "object" ? ur.roleId._id : ur.roleId;
      const roleId = roleIdValue.toString();

      if (!roleMap.has(roleId)) {
        roleMap.set(roleId, {
          roleId: roleId,
          permissions: [],
          entities: [],
        });
      }

      // Fetch entity if exists
      if (ur.entityId) {
        const entityMapping =
          await getEntitiesFromEntityAdminMappingServiceBySocialIdAndEntityId(
            ur.entityId,
            user.socialId
          );

        if (entityMapping & entityMapping?.entityType) {
          const Model = mongoose.model(entityMapping.entityType);
          const entityData = await Model.findById(entityMapping.entityId);

          if (entityData) {
            const roleObj = roleMap.get(roleId);

            // avoid duplicate entities
            if (!roleObj.entities.some((e) => e.id.equals(entityData?._id))) {
              roleObj.entities.push({
                id: entityData?._id,
                name: entityData.name,
              });
            }
          }
        }
      }
    }

    // Add permissions for each role
    for (const [roleId, roleObj] of roleMap.entries()) {
      const permissions = await getPermissionsByRoleIdService(roleId);
      roleObj.permissions = permissions.map((p) => p.permission.name);
    }

    const roles = roleMap.values().next().value || null;

    // Fetch full role object and filter modules to show only active ones
    const roleId = roles?.roleId;
    let role = await findRoleById(roleId);

    if (role && role.modules && Array.isArray(role.modules)) {
      // Filter modules to show only active ones
      role.modules = role.modules.filter((m) => m.module?.isActive === true);
    }
    console.log(role, "role");

    const isadmin = role.name.toLowerCase() === "admin" ? true : false;

    const token = jwt.sign(
      { id: user?._id, socialId: user.socialId },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRY }
    );

    return sendResponse({
      res,
      statusCode: 200,
      message: "Login successful",
      data: {
        token,
        user: {
          id: user?._id,
          name: user.name,
          email: user.email,
          socialId: user.socialId,
          department: user.department,
          profileImage: user.profile_image,
        },
        role,
        isadmin,
      },
    });
  } catch (err) {
    console.error("Login error:", err.message);
    return sendErrorResponse({
      res,
      statusCode: err.response?.status || 500,
      message: "Login failed",
      error: err.message,
    });
  }
};
