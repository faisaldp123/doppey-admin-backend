import mongoose from "mongoose";

const returnSchema = new mongoose.Schema({
  orderId: String,
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
  reason: String,
  status: {
    type: String,
    enum: ["In Transit", "Out For Delivery", "Delivered", "Lost", "Disposed"],
    default: "In Transit"
  },
  expectedDeliveryDate: Date,
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model("Return", returnSchema);
