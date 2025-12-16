import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import subCategoryRoutes from "./src/routes/subCategoryRoutes.js";
import itemRoutes from "./src/routes/itemRoutes.js";
import policyRoutes from "./src/routes/policyRoutes.js"
import userRoutes from "./src/routes/userRoutes.js"
import groupRoutes from "./src/routes/groupRoutes.js"
import slaRoutes from "./src/routes/slaRoutes.js"
import reportRoutes from "./src/routes/reportRoutes.js";
import handOverRoutes from "./src/routes/handOverRoutes.js";
import transferRoutes from "./src/routes/transferRoutes.js";
import approvalRoutes from "./src/routes/approvalRoutes.js";
import moduleRoutes from "./src/routes/moduleRoutes.js";
import roleRoutes from "./src/routes/roleRoutes.js";
import roleAssignRoutes from "./src/routes/roleAssignRoutes.js";

import { errorHandler } from "./src/util/responseHandler.js";
const PORT = process.env.PORT || 5000;
const app = express();

dotenv.config();
connectDB();

app.use(cors());
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);
app.use("/api/sub-category", subCategoryRoutes);
app.use("/api/item", itemRoutes);
app.use("/api/policy", policyRoutes)
app.use("/api/sla", slaRoutes);
app.use("/api/user", userRoutes);
app.use("/api/group", groupRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/handover", handOverRoutes);
app.use("/api/transfer", transferRoutes);
app.use("/api/approval", approvalRoutes);
app.use("/api/module", moduleRoutes);
app.use("/api/role", roleRoutes);
app.use("/api/role-assignee", roleAssignRoutes);


app.use(errorHandler);
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
