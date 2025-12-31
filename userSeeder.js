import axios from "axios";
import dotenv from "dotenv";

import { connectDB } from "./src/config/db.js";
import User from "./src/models/UserModel.js";

dotenv.config();

const API_URL = "https://social.vayuz.com/v1/admin/users/getOtherUsers";

const seedUsers = async () => {
  try {
    await connectDB();

    const { data } = await axios.get(API_URL, {
      headers: {
        Authorization: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VyX2lkIjoidXNlcl9pZDE3MzM0MDE3Mzg5MTgiLCJyb2xlIjoidXNlciIsImlhdCI6MTczMzQwMjU0MX0.82mbwwPdu-1uNKhj1Rz4xY_6dS9rd4iCIOrpRsl2Wa4`, // example header
        "Content-Type": "application/json",
      },
    });

    // Check if response contains users
    if (!data?.data || !Array.isArray(data.data)) {
      console.error("Unexpected API response format:", data);
      process.exit(1);
    }

    console.log(data, "dtataaaaa");

    const users = data.data.map((user) => ({
      image: user.profile_image,
      socialId: user.employee_id,
      designation: user.designation || "N/A",
      department: user.department || "N/A",
      location: user.location || "N/A",
      phone: user.phone || "N/A",
      name: user.fullname || user.name || "Unknown",
      email: user.email || "N/A",
      syncedAt: Date.now(),
      isActive: true,
    }));

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
