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

const PROFILE_BACKEND_URL = "https://profilebackend.vayuz.com/users/api/signin";
const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";
const JWT_EXPIRY = "24h";

// Login controller
export const login = async (req, res) => {
  try {
    const { socialId, authenticationCode } = req.body;

    if (!socialId || !authenticationCode) {
      return sendErrorResponse({
        res,
        statusCode: 400,
        message: "socialId and authenticationCode are required",
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
        message: "Invalid socialId or authenticationCode",
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
      user.syncedAt = new Date();
      await user.save();
    }

    
    const userRoles = await getUserRoleFromUserRolesService(user.socialId);
    console.log(userRoles, "userRoles");

    // Group userRoles by roleId
    const roleMap = new Map();

    for (const ur of userRoles) {
      const roleId = ur.roleId?._id.toString();
      if (!roleMap.has(roleId)) {
        roleMap.set(roleId, {
          role: ur.roleId?.name,
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

    const roles = Array.from(roleMap.values());

    console.log(roles, "roles");

    const isadmin = roles.some(
      (r) => r.role && r.role.toLowerCase() === "admin"
    );

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
        },
        roles,
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
