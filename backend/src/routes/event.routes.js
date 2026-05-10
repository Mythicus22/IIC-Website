import express from 'express';
import { getEvents, getEventById, createEvent, updateEvent, deleteEvent, claimTicket } from '../controllers/event.controller.js';
import { upload, attachUploadedImageUrl } from '../config/cloudinary.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { validateEvent, validateEventImage, validateRequest } from '../validators/admin.validator.js';

const router = express.Router();

router.get('/', getEvents);
router.get('/:id', getEventById);
router.post('/', protect, admin, upload.single('image'), attachUploadedImageUrl, validateEvent, validateEventImage, validateRequest, createEvent);
router.put('/:id', protect, admin, upload.single('image'), attachUploadedImageUrl, validateEvent, validateRequest, updateEvent);
router.delete('/:id', protect, admin, deleteEvent);
router.post('/:id/claim', protect, claimTicket);

export default router;
