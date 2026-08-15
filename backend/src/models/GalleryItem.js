import mongoose from 'mongoose';
import { galleryCategories } from '../constants/taxonomy.js';

const galleryItemSchema = new mongoose.Schema({
  title: { type: String },
  category: { type: String, enum: galleryCategories, required: true },
  imageUrl: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('GalleryItem', galleryItemSchema);
