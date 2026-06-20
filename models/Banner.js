import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    desktopImage: { type: String, required: true },
    mobileImage:  { type: String, required: true },
    href:         { type: String, default: "/shop" },
    isActive:     { type: Boolean, default: true },
    order:        { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);