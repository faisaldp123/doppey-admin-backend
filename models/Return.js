import mongoose from "mongoose";

const returnSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
    required: true,
  },
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  reason:  { type: String, required: true },
  comment: { type: String, default: "" },
  images:  { type: [String], default: [] },
  status: {
  type: String,
  enum: [
    "Pending",
    "Approved",
    "Pickup Scheduled",
    "Picked Up",
    "Quality Check",
    "Refund Approved",
    "Refund Completed",
    "Rejected",
  ],
  default: "Pending",
},

expectedDeliveryDate: Date,

refundAmount: {
  type: Number,
  default: 0,
},

refundMethod: {
  type: String,
  default: "",
},

refundTransactionId: {
  type: String,
  default: "",
},

refundDate: {
  type: Date,
},

adminRemark: {
  type: String,
  default: "",
},
}, { timestamps: true });

export default mongoose.model("Return", returnSchema);