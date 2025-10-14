import axios from "axios";
import dotenv from "dotenv";

import User from "../models/user.model.js";
import { connectDB } from "./src/config/db.js";

dotenv.config();

const API_URL = "https://social.vayuz.com/v1/admin/users/getOtherUsers";

const seedUsers = async () => {
  try {
    // Connect DB
    await connectDB();

    console.log("🌱 Fetching users from API...");
    const { data } = await axios.get(API_URL);

    // Check if response contains users
    if (!data?.data || !Array.isArray(data.data)) {
      console.error("❌ Unexpected API response format:", data);
      process.exit(1);
    }

    const users = data.data.map((user) => ({
      userId: user._id,
      name: user.fullName || user.name || "Unknown",
      email: user.email || "N/A",
      profilePic: user.profilePic || "",
      username: user.username || "",
    }));

    console.log(`✅ ${users.length} users fetched, inserting into DB...`);

    // Optional: clear old users first
    await User.deleteMany({});

    await User.insertMany(users);

    console.log("🎉 User seeding completed successfully!");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding users:", error.message);
    process.exit(1);
  }
};

seedUsers();
