import mongoose from "mongoose";

const lifestyleSectionSchema = new mongoose.Schema(
  {
    label: {
      type: String,
      default: "",
    },

    heading: {
      type: String,
      default: "",
    },

    description: {
      type: String,
      default: "",
    },

    buttonText: {
      type: String,
      default: "Shop Now",
    },

    buttonLink: {
      type: String,
      default: "/",
    },

    leftImage: {
      type: String,
      required: true,
    },

    rightTopImage: {
      type: String,
      required: true,
    },

    rightTopTitle: {
      type: String,
      default: "",
    },

    rightBottomImage: {
      type: String,
      required: true,
    },

    rightBottomTitle: {
      type: String,
      default: "",
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

export default mongoose.model(
  "LifestyleSection",
  lifestyleSectionSchema
);