import Product from "../models/Product.js";
import SubCategory from "../models/SubCategory.js";
import slugify from "slugify";

/* ================= ADMIN ================= */

// Create Product (Admin) - Requires minimum 5 images
export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      category,
      subCategory,
      brand,
      rating,
      sku,
      discount,
      isBestSeller,
      isNewArrival,
      sizes,
      colors,
      material,
      fit,
      shipping,
      care,
    } = req.body;

    if (!name || !description || !price || !category || !subCategory) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.files || req.files.length < 5) {
      return res.status(400).json({ message: "Minimum 5 images required" });
    }

    const images = req.files.map((file) => file.path);

    const product = await Product.create({
      name,
      slug: slugify(name, { lower: true }),
      description,
      price,
      stock,
      category,
      subCategory,
      images,
      brand:        brand        || "",
      rating:       rating       || 0,
      sku:          sku          || "",
      discount:     discount     || 0,
      isBestSeller: isBestSeller === "true" || isBestSeller === true,
      isNewArrival: isNewArrival === "true" || isNewArrival === true,
      sizes:        sizes  ? (Array.isArray(sizes)  ? sizes  : JSON.parse(sizes))  : [],
      colors:       colors ? (Array.isArray(colors) ? colors : JSON.parse(colors)) : [],
      material:     material || "",
      fit:          fit      || "",
      shipping:     shipping || "",
      care:         care     || "",
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update Product (Admin)
export const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (req.files && req.files.length > 0) {
      updates.images = req.files.map((file) => file.path);
    }

    // Parse boolean strings from FormData
    if (updates.isBestSeller !== undefined) {
      updates.isBestSeller = updates.isBestSeller === "true" || updates.isBestSeller === true;
    }
    if (updates.isNewArrival !== undefined) {
      updates.isNewArrival = updates.isNewArrival === "true" || updates.isNewArrival === true;
    }

    // Parse array strings from FormData
    if (updates.sizes && !Array.isArray(updates.sizes)) {
      updates.sizes = JSON.parse(updates.sizes);
    }
    if (updates.colors && !Array.isArray(updates.colors)) {
      updates.colors = JSON.parse(updates.colors);
    }

    const updatedProduct = await Product.findByIdAndUpdate(id, updates, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: "Product not found" });

    res.json(updatedProduct);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete Product (Admin)
export const deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findByIdAndDelete(id);

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json({ message: "Product deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get all products (Admin)
export const getAllProducts = async (req, res) => {
  try {
    const products = await Product.find()
      .populate("category", "name")
      .populate("subCategory", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= PUBLIC ================= */

// Get products by subcategory
export const getProductsBySubCategory = async (req, res) => {
  try {
    const subCategory = await SubCategory.findOne({ slug: req.params.slug });
    if (!subCategory) return res.status(404).json({ message: "Subcategory not found" });

    const products = await Product.find({ subCategory: subCategory._id, isActive: true })
      .populate("category", "name")
      .populate("subCategory", "name");

    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get single product by slug
export const getProductBySlug = async (req, res) => {
  try {
    const product = await Product.findOne({ slug: req.params.slug, isActive: true })
      .populate("category", "name")
      .populate("subCategory", "name");

    if (!product) return res.status(404).json({ message: "Product not found" });

    res.json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get best sellers (Public)
export const getBestSellers = async (req, res) => {
  try {
    const products = await Product.find({ isBestSeller: true, isActive: true })
      .populate("category", "name")
      .populate("subCategory", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get new arrivals (Public)
export const getNewArrivals = async (req, res) => {
  try {
    const products = await Product.find({ isNewArrival: true, isActive: true })
      .populate("category", "name")
      .populate("subCategory", "name");
    res.json(products);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};