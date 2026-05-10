import mongoose from 'mongoose';
import { teamCategories, teamRoles } from '../constants/taxonomy.js';

const teamMemberSchema = new mongoose.Schema({
  name: { type: String, required: true },
  role: { type: String, enum: teamRoles, required: true },
  category: { type: String, enum: teamCategories, required: true },
  imageUrl: { type: String, required: true }
}, { timestamps: true });

export default mongoose.model('TeamMember', teamMemberSchema);
