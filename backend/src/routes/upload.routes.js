import express from 'express';
import { upload, getCloudinaryImageUrl } from '../config/cloudinary.js';
import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/', protect, admin, upload.single('image'), (req, res) => {
  const imageUrl = getCloudinaryImageUrl(req.file);

  if (imageUrl) {
    res.json({ imageUrl });
  } else {
    res.status(400).json({ message: 'No image uploaded' });
  }
});

export default router;
