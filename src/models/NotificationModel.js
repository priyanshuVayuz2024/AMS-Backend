import mongoose from "mongoose";
const notificationTemplateSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    key: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },

    type: {
      type: String,
      enum: [ "recieved","transferred"], 
      required: true,
    },

    subject: {
      type: String,
      trim: true,
      default: "",
    },

    body: {
      type: String,
      required: true,
      trim: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    tags: [
      {
        type: String,
        trim: true,
      },
    ],
  },
  { timestamps: true }
);
export default mongoose.model(
  "NotificationTemplate",
  notificationTemplateSchema
);
