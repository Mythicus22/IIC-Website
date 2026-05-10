import express from 'express';
import eventRoutes from './event.routes.js';
import teamRoutes from './team.routes.js';
import galleryRoutes from './gallery.routes.js';
import authRoutes from './auth.routes.js';
import uploadRoutes from './upload.routes.js';

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/upload', uploadRoutes);
router.use('/events', eventRoutes);
router.use('/team', teamRoutes);
router.use('/gallery', galleryRoutes);

export default router;
