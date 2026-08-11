import { body, validationResult } from 'express-validator';
import { eventCategories, galleryCategories, teamCategories, teamRoles } from '../constants/taxonomy.js';

export const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    console.error('[Validation Error]', errors.array());
    return res.status(400).json({ 
      message: 'Validation Error', 
      errors: errors.array() 
    });
  }
  next();
};

export const validateEvent = [
  body('title').notEmpty().withMessage('Title is required'),
  body('description').notEmpty().withMessage('Description is required'),
  body('date').isISO8601().withMessage('Valid date is required'),
  body('time').notEmpty().withMessage('Time is required'),
  body('location').notEmpty().withMessage('Location is required'),
  body('totalSeats').isInt({ min: 1 }).withMessage('Total seats must be at least 1'),
  body('category').isIn(eventCategories).withMessage('Invalid event category')
];

export const validateEventImage = [
  body('imageUrl').notEmpty().withMessage('Event image is required')
];

export const validateTeamMember = [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').optional({ checkFalsy: true }).isEmail().withMessage('Valid email is required'),
  body('role').isIn(teamRoles).withMessage('Invalid team role'),
  body('category').isIn(teamCategories).withMessage('Invalid team category'),
  body('imageUrl').notEmpty().withMessage('Image URL is required')
];

export const validateGalleryItem = [
  body('category').isIn(galleryCategories).withMessage('Invalid gallery category'),
  body('imageUrl').notEmpty().withMessage('Image URL is required')
];
