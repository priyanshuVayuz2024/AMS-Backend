import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
    {
        action: { type: String, required: true, unique: true }, // e.g., "item:view"
        description: { type: String },
    },
    { timestamps: true }
);

const Permission = mongoose.model("Permission", permissionSchema);
export default Permission


