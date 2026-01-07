import mongoose from "mongoose";

const inventorySchema = new mongoose.Schema({
  product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
  sku: { type: String, required: true },
  quantity: { type: Number, default: 0 },
  reserved: { type: Number, default: 0 },
  warehouse: { type: mongoose.Schema.Types.ObjectId, ref: "Warehouse" },
  lastUpdated: { type: Date, default: Date.now }
});

export default mongoose.model("Inventory", inventorySchema);
