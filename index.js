import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
import authRoutes from "./src/routes/authRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
const PORT = process.env.PORT || 5000;
const app = express();

dotenv.config();
connectDB();
app.use(express.json());
app.use("/api/auth", authRoutes);
app.use("/api/category", categoryRoutes);

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
