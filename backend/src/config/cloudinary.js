import dotenv from 'dotenv';
import * as cloudinary from 'cloudinary';
import CloudinaryStorage from 'multer-storage-cloudinary';
import multer from 'multer';

dotenv.config({ path: new URL('../../.env', import.meta.url) });

cloudinary.v2.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'iic-website',
    allowed_formats: ['jpeg', 'png', 'jpg', 'gif', 'webp']
  }
});

export const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024
  }
});

export const getCloudinaryImageUrl = (file) => file?.secure_url || file?.url || file?.path || '';

export const attachUploadedImageUrl = (req, res, next) => {
  const imageUrl = getCloudinaryImageUrl(req.file);

  if (imageUrl) {
    req.body.imageUrl = imageUrl;
  }

  next();
};

export { cloudinary };
