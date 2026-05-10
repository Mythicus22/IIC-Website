import Event from '../models/Event.js';
import { getIO } from '../socket/index.js';

export const getEvents = async (req, res) => {
  try {
    const events = await Event.find().sort({ date: 1 });
    console.log(`[Events] Fetched ${events.length} events`);
    res.json(events);
  } catch (error) {
    console.error('[Events] Fetch error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      console.warn(`[Events] Event not found: ${req.params.id}`);
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json(event);
  } catch (error) {
    console.error('[Events] GetById error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const createEvent = async (req, res) => {
  try {
    const event = new Event(req.body);
    const savedEvent = await event.save();
    console.log(`[Events] ✅ Created event: "${savedEvent.title}" (ID: ${savedEvent._id})`);
    getIO().emit('event_created', savedEvent);
    res.status(201).json(savedEvent);
  } catch (error) {
    console.error('[Events] ❌ Create error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

export const updateEvent = async (req, res) => {
  try {
    const updatedEvent = await Event.findByIdAndUpdate(req.params.id, req.body, { new: true });
    console.log(`[Events] ✅ Updated event: "${updatedEvent.title}" (ID: ${updatedEvent._id})`);
    getIO().emit('event_updated', updatedEvent);
    res.json(updatedEvent);
  } catch (error) {
    console.error('[Events] ❌ Update error:', error.message);
    res.status(400).json({ message: error.message });
  }
};

export const deleteEvent = async (req, res) => {
  try {
    await Event.findByIdAndDelete(req.params.id);
    console.log(`[Events] 🗑️ Deleted event ID: ${req.params.id}`);
    getIO().emit('event_deleted', req.params.id);
    res.json({ message: 'Event deleted' });
  } catch (error) {
    console.error('[Events] ❌ Delete error:', error.message);
    res.status(500).json({ message: error.message });
  }
};

export const claimTicket = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const userId = req.user?._id;

    // Check if user already registered
    if (userId && event.registeredUsers.some(id => id.toString() === userId.toString())) {
      console.log(`[Tickets] User ${userId} already registered for "${event.title}"`);
      return res.json({ message: 'Already registered', event, alreadyClaimed: true });
    }

    if (event.remainingSeats <= 0) {
      console.warn(`[Tickets] ⚠️ No seats left for "${event.title}"`);
      return res.status(400).json({ message: 'No seats remaining' });
    }

    event.remainingSeats -= 1;
    if (userId) event.registeredUsers.push(userId);
    await event.save();

    console.log(`[Tickets] 🎟️ Ticket claimed for "${event.title}" by user ${userId || 'guest'} — ${event.remainingSeats} seats left`);
    getIO().emit('ticket_claimed', { eventId: event._id, remainingSeats: event.remainingSeats });

    res.json({ message: 'Ticket claimed successfully', event, remainingSeats: event.remainingSeats });
  } catch (error) {
    console.error('[Tickets] ❌ Claim error:', error.message);
    res.status(500).json({ message: error.message });
  }
};
