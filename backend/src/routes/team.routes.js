import express from 'express';
import { getTeamMembers, createTeamMember, updateTeamMember, deleteTeamMember } from '../controllers/team.controller.js';
import { upload, attachUploadedImageUrl } from '../config/cloudinary.js';
import { protect, admin } from '../middlewares/auth.middleware.js';
import { validateTeamMember, validateRequest } from '../validators/admin.validator.js';

const router = express.Router();

router.get('/', getTeamMembers);
router.post('/', protect, admin, upload.single('image'), attachUploadedImageUrl, validateTeamMember, validateRequest, createTeamMember);
router.put('/:id', protect, admin, upload.single('image'), attachUploadedImageUrl, validateTeamMember, validateRequest, updateTeamMember);
router.delete('/:id', protect, admin, deleteTeamMember);

export default router;
