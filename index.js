import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import subCategoryRoutes from "./src/routes/subCategoryRoutes.js";
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

app.use(errorHandler);
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
