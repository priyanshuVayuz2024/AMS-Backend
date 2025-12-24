import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/config/db.js";

import authRoutes from "./src/routes/authRoutes.js";
import itemRoutes from "./src/routes/itemRoutes.js";
import userRoutes from "./src/routes/userRoutes.js";
import reportRoutes from "./src/routes/reportRoutes.js";
import moduleRoutes from "./src/routes/moduleRoutes.js";
import roleRoutes from "./src/routes/roleRoutes.js";
import roleAssignRoutes from "./src/routes/roleAssignRoutes.js";
import assetAssignmentRoutes from "./src/routes/assetAssignmentRoutes.js";

import { authLimiter, apiLimiter } from "./src/middlewares/rateLimiterMiddleware.js";
import { errorHandler } from "./src/util/responseHandler.js";

dotenv.config();

const PORT = process.env.PORT || 5000;
const app = express();

connectDB();

app.use(cors());
app.use(express.json());


app.use("/api", apiLimiter);


app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/item", itemRoutes);
app.use("/api/user", userRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/module", moduleRoutes);
app.use("/api/role", roleRoutes);
app.use("/api/role-assignee", roleAssignRoutes);
app.use("/api/asset-assignment", assetAssignmentRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
