import mongoose from "mongoose";

const brandStorySchema = new mongoose.Schema(
  {
    subtitle: {
      type: String,
      default: "",
    },

    heading: {
      type: String,
      default: "",
    },

    paragraphOne: {
      type: String,
      default: "",
    },

    paragraphTwo: {
      type: String,
      default: "",
    },

    paragraphThree: {
      type: String,
      default: "",
    },

    buttonText: {
      type: String,
      default: "Explore",
    },

    buttonLink: {
      type: String,
      default: "/",
    },

    image: {
      type: String,
      required: true,
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
  "BrandStory",
  brandStorySchema
);