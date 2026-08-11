import { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { Search } from 'lucide-react';
import ScrollReveal from '../components/ScrollReveal';
import EventCard from '../components/EventCard';
import { useSocket } from '../context/useSocket';
import { useAuth } from '../context/useAuth';
import { eventCategories } from '../constants/taxonomy';
import { API_URL } from '../config/api';
import './Events.css';

const Events = () => {
  const [events, setEvents] = useState([]);
  const [filter, setFilter] = useState('All Categories');
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [visibleCount, setVisibleCount] = useState(6);
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    axios.get(`${API_URL}/events`)
      .then(res => setEvents(res.data))
      .catch(() => toast.error('Failed to load events'));
  }, []);

  useEffect(() => {
    if (!socket) return;
    socket.on('ticket_claimed', ({ eventId, remainingSeats }) => {
      setEvents(prev => prev.map(e => e._id === eventId ? { ...e, remainingSeats } : e));
    });
    socket.on('event_created', (newEvent) => {
      setEvents(prev => [...prev, newEvent].sort((a, b) => new Date(a.date) - new Date(b.date)));
      toast.success(`New event added: ${newEvent.title}`);
    });
    return () => { socket.off('ticket_claimed'); socket.off('event_created'); };
  }, [socket]);

  const handleClaim = async (id) => {
    if (!user) {
      toast.error('Please log in to register for events');
      return null;
    }
    const toastId = toast.loading('Registering...');
    try {
      const { data } = await axios.post(
        `${API_URL}/events/${id}/claim`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      if (data.alreadyClaimed) {
        toast('You are already registered for this event!', { id: toastId, icon: 'ℹ️' });
      } else {
        toast.success('Registered! Your ticket is ready 🎟️', { id: toastId });
      }
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register', { id: toastId });
      return null;
    }
  };

  // Reset visible count when filters change
  const filteredEvents = events.filter(e => {
    const matchesSearch = e.title.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = filter === 'All Categories' || e.category === filter;
    const matchesStatus = statusFilter === 'all' || e.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  const visibleEvents = filteredEvents.slice(0, visibleCount);
  const hasMore = visibleCount < filteredEvents.length;

  return (
    <div className="events-page section container">
      <ScrollReveal>
        <div className="page-header text-center">
          <span className="badge">Hub Activities</span>
          <h1 className="hero-title" style={{ textAlign: 'center', marginBottom: '1rem' }}>Discover Our Events</h1><br /><br />
          <p className="section-subtitle">
            From high-stakes pitch competitions to deep-dive technical workshops, browse through our scheduled and past initiatives designed to fuel your innovation journey.
          </p>
        </div>

        <div className="filters-bar">
          <div className="search-box">
            <Search size={20} className="search-icon" />
            <input
              type="text"
              placeholder="Search events by title or keyword..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setVisibleCount(6); }}
            />
          </div>

          <select className="category-select" value={filter} onChange={(e) => { setFilter(e.target.value); setVisibleCount(6); }}>
            <option value="All Categories">All Categories</option>
            {eventCategories.map(category => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>

          <div className="status-toggle">
            <button className={statusFilter === 'all' ? 'active' : ''} onClick={() => { setStatusFilter('all'); setVisibleCount(6); }}>All</button>
            <button className={statusFilter === 'upcoming' ? 'active' : ''} onClick={() => { setStatusFilter('upcoming'); setVisibleCount(6); }}>Upcoming</button>
            <button className={statusFilter === 'past' ? 'active' : ''} onClick={() => { setStatusFilter('past'); setVisibleCount(6); }}>Past</button>
          </div>
        </div>

        <div className="events-grid">
          {visibleEvents.length > 0 ? visibleEvents.map(event => (
            <ScrollReveal key={event._id}>
              <EventCard event={event} onClaim={handleClaim} user={user} />
            </ScrollReveal>
          )) : (
            <p className="text-center" style={{ gridColumn: '1 / -1', padding: '4rem 0' }}>No events found matching your criteria.</p>
          )}
        </div>

        {filteredEvents.length > 0 && (
          <div className="load-more">
            <p className="showing-text">Showing {visibleEvents.length} of {filteredEvents.length} activities</p>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${(visibleEvents.length / filteredEvents.length) * 100}%` }} /></div>
            {hasMore && (
              <button className="btn btn-outline" style={{ marginTop: '2rem' }} onClick={() => setVisibleCount(c => c + 6)}>Load More Events</button>
            )}
          </div>
        )}
      </ScrollReveal>
    </div>
  );
};

export default Events;
