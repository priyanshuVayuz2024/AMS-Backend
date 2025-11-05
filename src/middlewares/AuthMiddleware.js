import jwt from "jsonwebtoken";
import { sendErrorResponse } from "../util/responseHandler.js";
import { findUserByIdRepo } from "../repositories/userRepo.js";

const JWT_SECRET = process.env.JWT_SECRET || "supersecretkey";

export const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return sendErrorResponse({
        res,
        statusCode: 401,
        message: "Authorization token missing",
      });
    }

    const token = authHeader.split(" ")[1];

    // Verify JWT
    const decoded = jwt.verify(token, JWT_SECRET);

<<<<<<< HEAD
    console.log("Decoded JWT:", decoded);
=======
>>>>>>> 615604e9a16e590e1477d1190a5a1a7ba4013a49
    // Optional: Fetch user from DB
    const user = await findUserByIdRepo(decoded.id);
    if (!user || !user.isActive) {
      return sendErrorResponse({
        res,
        statusCode: 401,
        message: "User not found or inactive",
      });
    }

    // Attach user info to request object
    req.user = {
<<<<<<< HEAD
      id: user?._id,
      socialId: user?.socialId,
      name: user?.name,
      email: user?.email,
      department: user?.department,
=======
      id: user._id,
      socialId: user.socialId,
      name: user.name,
      email: user.email,
      department: user.department,
>>>>>>> 615604e9a16e590e1477d1190a5a1a7ba4013a49
    };

    next(); // proceed to next middleware or route handler
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
