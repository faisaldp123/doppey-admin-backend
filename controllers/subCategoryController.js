import SubCategory from "../models/SubCategory.js";

export const createSubCategory = async (req, res) => {
  try {
    const sub = await SubCategory.create(req.body);
    res.status(201).json(sub);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const getSubCategories = async (req, res) => {
  const subs = await SubCategory.find().populate("parentCategory");
  res.json(subs);
};
