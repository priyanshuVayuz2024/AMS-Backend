import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      default: null,
    },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    socialId: { type: String, required: true },
    department: { type: String },
    syncedAt: { type: Date, required: true, default: Date.now },
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

const User = mongoose.model("User", userSchema);
export default User;
