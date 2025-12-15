import mongoose from "mongoose";

const HandoverSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    transferRequestId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "TransferRequest",
      required: true,
    },

    fromSocialId: {
      type: String,
      required: true,
    },

    toSocialId: {
      type: String,
      required: true,
    },

    receiverAcknowledged: {
      type: Boolean,
      default: false,
    },

    notes: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "handover-in-progress", "completed", "cancelled"],
      default: "pending",
    },

  },
  {
    timestamps: true, 
  }
);

export default mongoose.model("Handover", HandoverSchema);
