// config/cloudinary.js
// Sets up Cloudinary (image hosting + CDN) if credentials are present in .env.
// If they are NOT present, isCloudinaryConfigured = false and the app falls
// back to saving uploaded files locally in /server/uploads (see uploadMiddleware
// usage in postController.js / userController.js). This lets you develop and
// test the whole app WITHOUT creating a Cloudinary account first.

const cloudinary = require("cloudinary").v2;

const isCloudinaryConfigured =
  !!process.env.CLOUDINARY_CLOUD_NAME &&
  !!process.env.CLOUDINARY_API_KEY &&
  !!process.env.CLOUDINARY_API_SECRET;

if (isCloudinaryConfigured) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
  console.log("Cloudinary configured — uploads will go to Cloudinary CDN.");
} else {
  console.warn(
    "Cloudinary credentials missing in .env — falling back to local disk storage for uploads (/server/uploads)."
  );
}

module.exports = {
  cloudinary,
  isCloudinaryConfigured,
};
