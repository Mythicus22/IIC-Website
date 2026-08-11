import express from 'express';
import { registerUser, loginUser, makeUserAdmin, removeUserAdmin, getAdminEmails } from '../controllers/auth.controller.js';
import { protect, admin } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/admins', protect, admin, getAdminEmails);
router.post('/admins', protect, admin, makeUserAdmin);
router.delete('/admins', protect, admin, removeUserAdmin);

export default router;
