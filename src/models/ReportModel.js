import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    assetId: {
      type: String,
      required: true,
      trim: true,
    },

    reportTitle: {
      type: String,
      required: true,
      trim: true,
    },

    reportDescription: {
      type: String,
      trim: true,
      default: "",
    },

    reportedBy: {
      type: String,
      required: true,
      trim: true,
    },

    images: {
      type: [String], 
      default: [],    
    },

    videos: {
      type: [String], 
      default: [],    
    },


    status: {
      type: String,
      enum: ["open", "in-progress", "resolved", "closed"],
      default: "open",
    },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);
