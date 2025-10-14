import axios from "axios";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import { sendResponse, sendErrorResponse } from "../util/responseHandler.js";

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

        // 🔹 Step 1: Validate credentials with Profile Backend
        const { data } = await axios.post(PROFILE_BACKEND_URL, {
            adminlogin: false,
            email: socialId,
            password: authenticationCode,
            requestfrom: "social",
        });

        if (!data || !data.success) {
            return sendErrorResponse({
                res,
                statusCode: 401,
                message: "Invalid socialId or authenticationCode",
            });
        }

        // 🔹 Step 2: Upsert user in local DB
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

        // 🔹 Step 3: Generate JWT
        const token = jwt.sign(
            { id: user._id, socialId: user.socialId },
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
                    id: user._id,
                    name: user.name,
                    email: user.email,
                    socialId: user.socialId,
                    department: user.department,
                },
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
