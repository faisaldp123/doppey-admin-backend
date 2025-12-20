import Product from "../models/Product.js";
import SubCategory from "../models/SubCategory.js";
import slugify from "slugify";

/* ================= ADMIN ================= */

export const createProduct = async (req, res) => {
  try {
    const {
      name,
      description,
      price,
      stock,
      category,
      subCategory,
    } = req.body;

    if (!name || !description || !price || !category || !subCategory) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (!req.files || req.files.length < 5) {
      return res
        .status(400)
        .json({ message: "Minimum 5 images required" });
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
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/* ================= PUBLIC ================= */

export const getProductsBySubCategory = async (req, res) => {
  const subCategory = await SubCategory.findOne({ slug: req.params.slug });

  if (!subCategory) {
    return res.status(404).json({ message: "Subcategory not found" });
  }

  const products = await Product.find({
    subCategory: subCategory._id,
    isActive: true,
  })
    .populate("category", "name")
    .populate("subCategory", "name");

  res.json(products);
};

export const getProductBySlug = async (req, res) => {
  const product = await Product.findOne({
    slug: req.params.slug,
    isActive: true,
  })
    .populate("category", "name")
    .populate("subCategory", "name");

  if (!product) {
    return res.status(404).json({ message: "Product not found" });
  }

  res.json(product);
};
