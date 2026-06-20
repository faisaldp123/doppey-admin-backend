import Banner from "../models/Banner.js";

// GET all banners (public)
export const getPublicBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET all banners (admin)
export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// POST create banner
export const createBanner = async (req, res) => {
  try {
    const { href, order, isActive } = req.body;

    if (!req.files?.desktopImage || !req.files?.mobileImage) {
      return res.status(400).json({ message: "Both desktop and mobile images are required" });
    }

    const banner = await Banner.create({
      desktopImage: req.files.desktopImage[0].path,
      mobileImage:  req.files.mobileImage[0].path,
      href:         href    || "/shop",
      order:        order   || 0,
      isActive:     isActive !== undefined ? isActive === "true" : true,
    });

    res.status(201).json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// PUT update banner
export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = { ...req.body };

    if (req.files?.desktopImage) {
      updates.desktopImage = req.files.desktopImage[0].path;
    }
    if (req.files?.mobileImage) {
      updates.mobileImage = req.files.mobileImage[0].path;
    }
    if (updates.isActive !== undefined) {
      updates.isActive = updates.isActive === "true";
    }

    const banner = await Banner.findByIdAndUpdate(id, updates, { new: true });
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE banner
export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json({ message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};