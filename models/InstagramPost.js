import mongoose from "mongoose";

const instagramPostSchema = new mongoose.Schema(
  {
    image: {
      type: String,
      required: true,
    },

    link: {
      type: String,
      default: "https://instagram.com",
    },

    order: {
      type: Number,
      default: 0,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

export default mongoose.model("InstagramPost", instagramPostSchema);