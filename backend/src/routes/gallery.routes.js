import express from 'express';
import { getGallery, createGalleryItem, deleteGalleryItem } from '../controllers/gallery.controller.js';
import { upload, attachUploadedImageUrl } from '../config/cloudinary.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { validateGalleryItem, validateRequest } from '../validators/admin.validator.js';

const router = express.Router();

router.get('/', getGallery);
router.post('/', protect, admin, upload.single('image'), attachUploadedImageUrl, validateGalleryItem, validateRequest, createGalleryItem);
router.delete('/:id', protect, admin, deleteGalleryItem);

export default router;
