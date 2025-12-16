import Product from "../models/Product.js";
import SubCategory from "../models/SubCategory.js";

export const createProduct = async (req, res) => {
  try {
    const { name, price, category, subCategory } = req.body;

    if (!name || !price || !category || !subCategory) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const imagePath = req.file ? req.file.path : null;

    const product = await Product.create({
      name,
      price,
      category,
      subCategory,
      image: imagePath,
    });

    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getProductsBySubCategory = async (req, res) => {
  const subCategory = await SubCategory.findOne({ slug: req.params.slug });
  if (!subCategory)
    return res.status(404).json({ message: "Subcategory not found" });

  const products = await Product.find({ subCategory: subCategory._id })
    .populate("category")
    .populate("subCategory");

  res.json(products);
};

export const getProductById = async (req, res) => {
  const product = await Product.findById(req.params.id)
    .populate("category")
    .populate("subCategory");

  if (!product)
    return res.status(404).json({ message: "Product not found" });

  res.json(product);
};
