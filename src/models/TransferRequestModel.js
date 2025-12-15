import mongoose from "mongoose";

const ApprovalSchema = new mongoose.Schema({
  level: {
    type: Number,
    required: true, 
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User", 
    default: null,
  },
  approvedAt: {
    type: Date,
    default: null,
  },
  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending",
  },
  comment: {
    type: String,
    default: "",
  }
});

const TransferRequestSchema = new mongoose.Schema(
  {
    assetId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
      required: true,
    },

    from: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    to: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    title: {
      type: String,
      required: true,
    },

    issue: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "in-review", "approved", "rejected", "completed"],
      default: "pending",
    },

    approvals: {
      type: [ApprovalSchema],
      default: [],
    },

    isApproved: {
      type: Boolean,
      default: false,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

  },
  { timestamps: true }
);

const TransferRequest = mongoose.model("TransferRequest", TransferRequestSchema);
export default TransferRequest;