import mongoose from 'mongoose';
import { teamCategories } from '../constants/taxonomy.js';

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, lowercase: true, trim: true },
  category: { type: String, enum: teamCategories, required: true },
  imageUrl: { type: String, required: true },
  order: { type: Number, default: 0 }
}, { timestamps: true });

export default mongoose.model('TeamMember', teamMemberSchema);
