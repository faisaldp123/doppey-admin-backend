import mongoose from "mongoose";

const warehouseSchema = new mongoose.Schema({
  name: String,
  address: String,
  city: String,
  state: String,
  pincode: String,
  managerName: String,
  contact: String
});

export default mongoose.model("Warehouse", warehouseSchema);
