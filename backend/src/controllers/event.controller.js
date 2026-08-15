import crypto from 'crypto';
import Event from '../models/Event.js';
import { getIO } from '../socket/index.js';

export const generateTicketId = (eventId, userId) => {
  const hash = crypto.createHash('sha256').update(`${eventId}:${userId}`).digest('hex').slice(0, 12).toUpperCase();
  return `IIC-${String(eventId).slice(-6).toUpperCase()}-${hash}`;
};

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ order: 1, date: 1 });
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.json(event);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const count = await Event.countDocuments();
    const event = new Event({ ...req.body, order: count });
    const savedEvent = await event.save();
    getIO().emit('event_created', savedEvent);
    res.status(201).json(savedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedEvent) return res.status(404).json({ message: 'Event not found' });
    getIO().emit('event_updated', updatedEvent);
    res.json(updatedEvent);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

export const reorderEvents = async (req, res) => {
  try {
    const { orderedIds } = req.body;
    await Promise.all(orderedIds.map((id, index) => Event.findByIdAndUpdate(id, { order: index })));
    getIO().emit('events_reordered');
    res.json({ message: 'Reordered' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    getIO().emit('event_deleted', req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const claimTicket = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const userId = req.user?._id;
    const ticketId = userId ? generateTicketId(event._id.toString(), userId.toString()) : null;

    if (userId && event.registeredUsers.some(id => id.toString() === userId.toString())) {
      return res.json({ message: 'Already registered', event, alreadyClaimed: true, ticketId });
    }

    if (event.remainingSeats <= 0) {
      return res.status(400).json({ message: 'No seats remaining' });
    }

    event.remainingSeats -= 1;
    if (userId) event.registeredUsers.push(userId);
    await event.save();

    getIO().emit('ticket_claimed', { eventId: event._id, remainingSeats: event.remainingSeats, registeredUsers: event.registeredUsers });
    res.json({ message: 'Ticket claimed successfully', event, remainingSeats: event.remainingSeats, ticketId });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
