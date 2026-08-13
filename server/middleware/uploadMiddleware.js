// middleware/uploadMiddleware.js
// Multer reads incoming multipart/form-data files into memory (as a Buffer)
// instead of writing to disk directly — that buffer is then either streamed
// to Cloudinary or written locally, depending on config/cloudinary.js.

const multer = require("multer");
const path = require("path");

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  const filetypes = /jpeg|jpg|png|gif|webp/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  }
  cb(new Error("Only images are allowed (jpeg, jpg, png, gif, webp)"));
};

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB per file
  fileFilter,
});

module.exports = upload;
