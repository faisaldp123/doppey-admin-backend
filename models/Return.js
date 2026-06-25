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
    enum: ["Pending", "Approved", "Rejected", "In Transit", "Completed"],
    default: "Pending",
  },
  expectedDeliveryDate: Date,
}, { timestamps: true });

export default mongoose.model("Return", returnSchema);