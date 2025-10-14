import mongoose from "mongoose";

const roleSchema = new mongoose.Schema(
    {
        name: { type: String, required: true, unique: true },
        description: { type: String },
    },
    { timestamps: true } // auto adds createdAt & updatedAt
);

export default mongoose.model("Role", roleSchema);