const cloudinary = require('cloudinary').v2;
require('dotenv').config();
const fs = require('fs');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const uploadToCloudinary = async (filePath) => {
  try {
    // Check if Cloudinary is configured
    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      const fileName = path.basename(filePath);
      return `/uploads/${fileName}`;
    }
    const result = await cloudinary.uploader.upload(filePath, {
      folder: 'ecommerce_portfolio'
    });
    // Remove local file after Cloudinary upload to save disk space
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
    return result.secure_url;
  } catch (err) {
    console.error("Cloudinary upload failed, using local fallback:", err.message);
    const fileName = path.basename(filePath);
    return `/uploads/${fileName}`;
  }
};

module.exports = { uploadToCloudinary };
