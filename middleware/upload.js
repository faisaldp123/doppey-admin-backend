import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async () => ({
    folder: "doppey-products",
    resource_type: "auto",
    allowed_formats: ["jpg", "jpeg", "png", "webp", "mp4", "mov", "webm"],
  }),
});

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});

export default upload;