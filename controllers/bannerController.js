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

    const desktopImages = (req.files?.desktopImages || []).map((f) => f.path);
    const mobileImages  = (req.files?.mobileImages  || []).map((f) => f.path);
    const video         = req.files?.video?.[0]?.path || "";

    if (desktopImages.length === 0 || mobileImages.length === 0) {
      return res.status(400).json({ message: "At least 1 desktop and 1 mobile image required" });
    }

    const banner = await Banner.create({
      desktopImages,
      mobileImages,
      video,
      href:     href  || "/shop",
      order:    order || 0,
      isActive: isActive !== undefined ? isActive === "true" : true,
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

    if (req.files?.desktopImages?.length > 0) {
      updates.desktopImages = req.files.desktopImages.map((f) => f.path);
    }
    if (req.files?.mobileImages?.length > 0) {
      updates.mobileImages = req.files.mobileImages.map((f) => f.path);
    }
    if (req.files?.video?.[0]) {
      updates.video = req.files.video[0].path;
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