import Banner from "../models/Banner.js";

export const getPublicBanners = async (req, res) => {
  try {
    const banners = await Banner.find({ isActive: true }).sort({ order: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAllBanners = async (req, res) => {
  try {
    const banners = await Banner.find().sort({ order: 1 });
    res.json(banners);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const createBanner = async (req, res) => {
  try {
    const { videoHref, isActive, order } = req.body;

    // Parse per-image hrefs sent as JSON strings
    const desktopHrefs = req.body.desktopHrefs ? JSON.parse(req.body.desktopHrefs) : [];
    const mobileHrefs  = req.body.mobileHrefs  ? JSON.parse(req.body.mobileHrefs)  : [];

    const desktopFiles = req.files?.desktopImages || [];
    const mobileFiles  = req.files?.mobileImages  || [];
    const videoFile    = req.files?.video?.[0]    || null;

    if (desktopFiles.length === 0 || mobileFiles.length === 0) {
      return res.status(400).json({ message: "At least 1 desktop and 1 mobile image required" });
    }

    const desktopImages = desktopFiles.map((f, i) => ({
      url:  f.path,
      href: desktopHrefs[i] || "/shop",
    }));

    const mobileImages = mobileFiles.map((f, i) => ({
      url:  f.path,
      href: mobileHrefs[i] || "/shop",
    }));

    const banner = await Banner.create({
      desktopImages,
      mobileImages,
      video:     videoFile ? videoFile.path : "",
      videoHref: videoHref || "/shop",
      order:     order     || 0,
      isActive:  isActive !== undefined ? isActive === "true" : true,
    });

    res.status(201).json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateBanner = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = {};

    if (req.body.order     !== undefined) updates.order     = req.body.order;
    if (req.body.videoHref !== undefined) updates.videoHref = req.body.videoHref;
    if (req.body.isActive  !== undefined) updates.isActive  = req.body.isActive === "true";

    const desktopHrefs = req.body.desktopHrefs ? JSON.parse(req.body.desktopHrefs) : [];
    const mobileHrefs  = req.body.mobileHrefs  ? JSON.parse(req.body.mobileHrefs)  : [];

    if (req.files?.desktopImages?.length > 0) {
      updates.desktopImages = req.files.desktopImages.map((f, i) => ({
        url:  f.path,
        href: desktopHrefs[i] || "/shop",
      }));
    }

    if (req.files?.mobileImages?.length > 0) {
      updates.mobileImages = req.files.mobileImages.map((f, i) => ({
        url:  f.path,
        href: mobileHrefs[i] || "/shop",
      }));
    }

    if (req.files?.video?.[0]) {
      updates.video = req.files.video[0].path;
    }

    const banner = await Banner.findByIdAndUpdate(id, updates, { new: true });
    if (!banner) return res.status(404).json({ message: "Banner not found" });

    res.json(banner);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteBanner = async (req, res) => {
  try {
    const banner = await Banner.findByIdAndDelete(req.params.id);
    if (!banner) return res.status(404).json({ message: "Banner not found" });
    res.json({ message: "Banner deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};