import mongoose from "mongoose";

const permissionSchema = new mongoose.Schema(
    {
        action: { type: String, required: true, unique: true }, // e.g., "item:view"
        description: { type: String },
    },
    { timestamps: true }
);

export default mongoose.model("Permission", permissionSchema);
