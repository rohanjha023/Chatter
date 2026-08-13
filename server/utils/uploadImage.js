// utils/uploadImage.js
// Shared helper: given a file buffer from multer, upload it either to
// Cloudinary (production) or to the local /server/uploads folder + return
// a URL pointing at our own static file server (development, no Cloudinary
// account needed). Used by both avatar uploads and post image uploads.

const fs = require("fs");
const path = require("path");
const { cloudinary, isCloudinaryConfigured } = require("../config/cloudinary");

const uploadToCloudinary = (fileBuffer, folder, transformation) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, transformation },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

const saveLocally = (fileBuffer, originalName, subfolder, req) => {
  const uploadDir = path.join(__dirname, "../uploads", subfolder);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  const ext = path.extname(originalName) || ".jpg";
  const filename = `${subfolder}-${Date.now()}-${Math.round(Math.random() * 1e6)}${ext}`;
  const filePath = path.join(uploadDir, filename);

  fs.writeFileSync(filePath, fileBuffer);

  // Build an absolute URL so the frontend can use it directly, e.g.
  // http://localhost:5000/uploads/posts/posts-172...-123.jpg
  return `${req.protocol}://${req.get("host")}/uploads/${subfolder}/${filename}`;
};

/**
 * Uploads one file (avatar or post image) and returns a public URL.
 * @param {Buffer} fileBuffer   raw file bytes (from multer memoryStorage)
 * @param {string} originalName original filename (used for local extension)
 * @param {"avatars"|"posts"} subfolder logical folder / Cloudinary folder
 * @param {import("express").Request} req needed to build a local URL as fallback
 */
const uploadImage = async (fileBuffer, originalName, subfolder, req) => {
  if (isCloudinaryConfigured) {
    const transformation =
      subfolder === "avatars"
        ? [{ width: 150, height: 150, crop: "fill", gravity: "face" }]
        : [{ width: 1200, crop: "limit" }]; // don't upscale post images
    return uploadToCloudinary(fileBuffer, `social-feed/${subfolder}`, transformation);
  }
  return saveLocally(fileBuffer, originalName, subfolder, req);
};

module.exports = { uploadImage };
