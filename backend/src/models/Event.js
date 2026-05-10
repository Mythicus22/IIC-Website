import mongoose from 'mongoose';
import { eventCategories } from '../constants/taxonomy.js';

const eventSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  date: { type: Date, required: true },
  time: { type: String, required: true },
  location: { type: String, required: true },
  coordinates: { lat: Number, lng: Number },
  totalSeats: { type: Number, default: 0 },
  remainingSeats: { type: Number, default: 0 },
  registeredUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  category: { type: String, enum: eventCategories, required: true },
  status: { type: String, enum: ['upcoming', 'past'], default: 'upcoming' },
  imageUrl: { type: String, required: true },
  speakers: [{
    name: String,
    role: String,
    company: String,
    imageUrl: String
  }]
}, { timestamps: true });

export default mongoose.model('Event', eventSchema);
