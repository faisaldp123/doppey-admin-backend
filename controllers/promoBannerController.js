import PromoBanner from "../models/PromoBanner.js";

export const getPublicPromoBanners = async (req, res) => {
  try {
    const banners = await PromoBanner.find({
      isActive: true,
    }).sort({ createdAt: -1 }); // newest first, automatically

    res.json(banners);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const getAllPromoBanners = async (req, res) => {
  try {
    const banners = await PromoBanner.find().sort({
      createdAt: -1, // newest first, automatically
    });

    res.json(banners);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const createPromoBanner = async (req, res) => {
  try {
    const {
      title,
      subtitle,
      buttonText,
      buttonLink,
      isActive,
    } = req.body;

    if (!req.file) {
      return res.status(400).json({
        message: "Background image is required",
      });
    }

    const banner = await PromoBanner.create({
      title,
      subtitle,
      buttonText,
      buttonLink,
      isActive:
        isActive !== undefined
          ? isActive === "true"
          : true,
      backgroundImage: req.file.path,
    });

    res.status(201).json(banner);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const updatePromoBanner = async (req, res) => {
  try {
    const banner =
      await PromoBanner.findById(req.params.id);

    if (!banner) {
      return res.status(404).json({
        message: "Banner not found",
      });
    }

    banner.title =
      req.body.title ?? banner.title;

    banner.subtitle =
      req.body.subtitle ?? banner.subtitle;

    banner.buttonText =
      req.body.buttonText ?? banner.buttonText;

    banner.buttonLink =
      req.body.buttonLink ?? banner.buttonLink;

    if (req.body.isActive !== undefined)
      banner.isActive =
        req.body.isActive === "true";

    if (req.file)
      banner.backgroundImage =
        req.file.path;

    await banner.save();

    res.json(banner);
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};

export const deletePromoBanner = async (req, res) => {
  try {
    await PromoBanner.findByIdAndDelete(
      req.params.id
    );

    res.json({
      message: "Promo Banner deleted",
    });
  } catch (err) {
    res.status(500).json({
      message: err.message,
    });
  }
};