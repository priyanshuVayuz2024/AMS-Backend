import cloudinary from "../cloudinary/useCloudinary.js";
import streamifier from "streamifier";

/**
 * Upload file buffer to Cloudinary
 * @param {Buffer} fileBuffer 
 * @param {string} folder 
 * @param {string} resource_type - "image" or "video"
 * @returns {string} secure URL
 */
export const uploadToCloudinary = async (fileBuffer, folder, resource_type = "image") => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder, resource_type },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    streamifier.createReadStream(fileBuffer).pipe(uploadStream);
  });
};
