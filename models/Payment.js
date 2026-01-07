import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema({
  orderId: String,
  amount: Number,
  method: { type: String, enum: ["COD", "UPI", "Card", "NetBanking"] },
  status: { type: String, enum: ["Pending", "Completed", "Failed"], default: "Pending" },
  transactionId: String,
  paidAt: Date
});

export default mongoose.model("Payment", paymentSchema);
