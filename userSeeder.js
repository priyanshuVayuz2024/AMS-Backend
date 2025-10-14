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
    const { data } = await axios.get(API_URL, {
      headers: {
        Authorization: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcl9pZDE3MzM0MDE3Mzg5MTgiLCJyb2xlIjoidXNlciIsImlhdCI6MTczMzQwMjU0MX0.82mbwwPdu-1uNKhj1Rz4xY_6dS9rd4iCIOrpRsl2Wa4`, // example header
        "Content-Type": "application/json",
      },
    });

    // Check if response contains users
    if (!data?.data || !Array.isArray(data.data)) {
      console.error("❌ Unexpected API response format:", data);
      process.exit(1);
    }

    const users = data.data.map((user) => ({
      socialId: user._id,
      name: user.fullName || user.name || "Unknown",
      email: user.email || "N/A",
      syncedAt: Date.now(),
      isActive: true,
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
