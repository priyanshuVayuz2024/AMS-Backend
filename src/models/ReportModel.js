import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {

    assetID: {
      type: String,
      required: true,
      trim: true
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
      trim: true
    },

    reportCount: {
      type: Number,
      required: true,
      default: 1,
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
