import ShopCategory from "../models/ShopCategory.js";

export const getPublicCategories = async (req, res) => {
  try {
    const categories = await ShopCategory.find({
      isActive: true,
    }).sort({ order: 1 });

    res.json(categories);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const getAllCategories = async (req, res) => {
  try {
    const categories = await ShopCategory.find().sort({
      order: 1,
    });

    res.json(categories);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const createCategory = async (req, res) => {
  try {
    const {
      title,
      link,
      order,
      isActive,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Image is required",
      });
    }

    const category = await ShopCategory.create({
      title,
      link,
      order,
      isActive:
        isActive !== undefined
          ? isActive === "true"
          : true,
      image: req.file.path,
    });

    res.status(201).json(category);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const updateCategory = async (req, res) => {
  try {
    const category =
      await ShopCategory.findById(req.params.id);

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    category.title =
      req.body.title || category.title;

    category.link =
      req.body.link || category.link;

    if (req.body.order !== undefined)
      category.order = req.body.order;

    if (req.body.isActive !== undefined)
      category.isActive =
        req.body.isActive === "true";

    if (req.file) {
      category.image = req.file.path;
    }

    await category.save();

    res.json(category);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const deleteCategory = async (req, res) => {
  try {
    const category =
      await ShopCategory.findByIdAndDelete(
        req.params.id
      );

    if (!category) {
      return res.status(404).json({
        message: "Category not found",
      });
    }

    res.json({
      message: "Category deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};