import mongoose from "mongoose";

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    slug: {
      type: String,
      required: true,
      unique: true,
    },

    description: {
      type: String,
      required: true,
    },

    price: {
      type: Number,
      required: true,
    },

    images: {
      type: [String],
      validate: {
        validator: function (v) {
          return v.length >= 5;
        },
        message: "Minimum 5 images are required",
      },
    },

    video: {
  type: String,
  default: "",
},

    stock: {
      type: Number,
      default: 0,
    },

    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },

    subCategory: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SubCategory",
      required: true,
    },

    // ── Fields added to match frontend data ──

    brand: {
      type: String,
      trim: true,
      default: "",
    },

    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },

    sku: {
      type: String,
      trim: true,
      default: "",
    },

    discount: {
      type: Number,
      default: 0,
    },

    isBestSeller: {
      type: Boolean,
      default: false,
    },

    isNewArrival: {
      type: Boolean,
      default: false,
    },

    sizes: {
      type: [String],
      default: [],
    },

    colors: {
      type: [String],
      default: [],
    },

    material: {
      type: String,
      default: "",
    },

    fit: {
      type: String,
      default: "",
    },

    shipping: {
      type: String,
      default: "Free shipping across India. Orders are delivered within 3-7 business days.",
    },

    care: {
      type: String,
      default: "Machine wash cold. Do not bleach. Tumble dry low. Iron on low heat.",
    },

    // ── End added fields ──

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Product", productSchema);