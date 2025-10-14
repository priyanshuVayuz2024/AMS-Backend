import express from "express";
import dotenv from "dotenv";
import { connectDB } from "./src/config/db.js";
const PORT = process.env.PORT || 5000;
const app = express();

dotenv.config();
connectDB();
app.use(express.json());

app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
