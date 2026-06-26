import Banner from "../models/Banner.js";

const parseJsonArray = (value, fallback = []) => {
  if (!value) return fallback;
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : fallback;
  } catch {
    return fallback;
  }
};

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
    const desktopHrefs = parseJsonArray(req.body.desktopHrefs);
    const mobileHrefs  = parseJsonArray(req.body.mobileHrefs);

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
    const existing = await Banner.findById(id);

    if (!existing) return res.status(404).json({ message: "Banner not found" });

    if (req.body.order     !== undefined) updates.order     = req.body.order;
    if (req.body.videoHref !== undefined) updates.videoHref = req.body.videoHref;
    if (req.body.isActive  !== undefined) updates.isActive  = req.body.isActive === "true";

    const desktopHrefs = parseJsonArray(req.body.desktopHrefs);
    const mobileHrefs  = parseJsonArray(req.body.mobileHrefs);
    const existingDesktopUrls = parseJsonArray(req.body.existingDesktopUrls);
    const existingMobileUrls  = parseJsonArray(req.body.existingMobileUrls);

    if (req.files?.desktopImages?.length > 0) {
      updates.desktopImages = req.files.desktopImages.map((f, i) => ({
        url:  f.path,
        href: desktopHrefs[i] || "/shop",
      }));
    } else if (desktopHrefs.length || existingDesktopUrls.length) {
      const source = existingDesktopUrls.length
        ? existingDesktopUrls
        : existing.desktopImages.map((img) => img.url);
      updates.desktopImages = source.slice(0, 4).map((url, i) => ({
        url,
        href: desktopHrefs[i] || existing.desktopImages[i]?.href || "/shop",
      }));
    }

    if (req.files?.mobileImages?.length > 0) {
      updates.mobileImages = req.files.mobileImages.map((f, i) => ({
        url:  f.path,
        href: mobileHrefs[i] || "/shop",
      }));
    } else if (mobileHrefs.length || existingMobileUrls.length) {
      const source = existingMobileUrls.length
        ? existingMobileUrls
        : existing.mobileImages.map((img) => img.url);
      updates.mobileImages = source.slice(0, 4).map((url, i) => ({
        url,
        href: mobileHrefs[i] || existing.mobileImages[i]?.href || "/shop",
      }));
    }

    if (req.files?.video?.[0]) {
      updates.video = req.files.video[0].path;
    }

    const banner = await Banner.findByIdAndUpdate(id, updates, { new: true });

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
