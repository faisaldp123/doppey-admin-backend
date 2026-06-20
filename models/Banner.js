import mongoose from "mongoose";

const bannerSchema = new mongoose.Schema(
  {
    desktopImages: { type: [String], validate: { validator: (v) => v.length >= 1 && v.length <= 4, message: "1 to 4 desktop images required" } },
    mobileImages:  { type: [String], validate: { validator: (v) => v.length >= 1 && v.length <= 4, message: "1 to 4 mobile images required" } },
    video:         { type: String, default: "" },
    href:          { type: String, default: "/shop" },
    isActive:      { type: Boolean, default: true },
    order:         { type: Number, default: 0 },
  },
  { timestamps: true }
);

export default mongoose.model("Banner", bannerSchema);