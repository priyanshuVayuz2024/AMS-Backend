import multer from "multer";

const storage = multer.memoryStorage();

export const uploadFiles = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // max 50MB for any file
  fileFilter: (req, file, cb) => {
    if (file.fieldname === "image") {
      if (!file.mimetype.match(/^image\/(jpeg|jpg|png)$/)) {
        return cb(new Error("Only jpeg/jpg/png images are allowed"), false);
      }
    }
    if (file.fieldname === "video") {
      if (!file.mimetype.match(/^video\/(mp4|mov|avi|mkv|webm)$/)) {
        return cb(new Error("Only mp4/mov/avi/mkv/webm videos are allowed"), false);
      }
    }
    cb(null, true);
  },
}).fields([
  { name: "image", maxCount: 5 }, 
  { name: "video", maxCount: 5 }, 
]);
