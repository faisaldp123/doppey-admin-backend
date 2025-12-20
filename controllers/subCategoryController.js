import SubCategory from "../models/SubCategory.js";
import slugify from "slugify";

// Create SubCategory
export const createSubCategory = async (req, res) => {
  try {
    const { name, parentCategory } = req.body;

    if (!name || !parentCategory) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const slug = slugify(name, { lower: true, strict: true });

    const exists = await SubCategory.findOne({ slug });
    if (exists) {
      return res.status(400).json({ message: "Subcategory already exists" });
    }

    const sub = await SubCategory.create({
      name,
      slug,
      parentCategory,
    });

    res.status(201).json(sub);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

// Get all subcategories
export const getSubCategories = async (req, res) => {
  try {
    const subs = await SubCategory.find().populate("parentCategory", "name");
    res.json(subs);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
