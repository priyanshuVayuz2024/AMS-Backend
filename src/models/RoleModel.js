import mongoose from "mongoose";

const roleModuleSchema = new mongoose.Schema(
  {
    module: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Module",
      required: true,
    },
    permissions: {
      type: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      }],
      validate: [
        {
          validator: function (v) {
            return v.length >= 1 && v.length <= 4;
          },
          message: "Permissions must be between 1 and 4 per module",
        },
      ],
      required: true,
    },
  },
  { _id: false }
);

const roleSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true },
    description: { type: String },
    modules: [roleModuleSchema],
    isActive: { type: Boolean, required: true, default: true },
  },
  { timestamps: true }
);

const Role = mongoose.model("Role", roleSchema);
export default Role;
