import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import ScrollReveal from '../components/ScrollReveal';
import EventCard from '../components/EventCard';
import TeamCard from '../components/TeamCard';
import { useSocket } from '../context/useSocket';
import { useAuth } from '../context/useAuth';
import { API_URL } from '../config/api';
import './Home.css';

const Home = () => {
  const [events, setEvents] = useState([]);
  const [team, setTeam] = useState([]);
  const socket = useSocket();
  const { user } = useAuth();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eventsRes, teamRes] = await Promise.all([
          axios.get(`${API_URL}/events`),
          axios.get(`${API_URL}/team`)
        ]);
        setEvents(eventsRes.data.filter(e => e.status === 'upcoming').slice(0, 3));
        setTeam(teamRes.data.slice(0, 4));
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (!socket) return;

    const handleTicketClaim = ({ eventId, remainingSeats, registeredUsers }) => {
      setEvents(prev => prev.map(e => e._id === eventId ? { ...e, remainingSeats, registeredUsers } : e));
    };

    socket.on('ticket_claimed', handleTicketClaim);
    return () => socket.off('ticket_claimed', handleTicketClaim);
  }, [socket]);

  const handleClaim = async (id) => {
    if (!user) {
      toast.error('Please log in to register for events');
      return null;
    }

    try {
      const { data } = await axios.post(
        `${API_URL}/events/${id}/claim`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );

      setEvents(prev => prev.map(event => event._id === id ? { ...event, ...data.event, registeredUsers: data.event.registeredUsers || event.registeredUsers } : event));
      if (data.alreadyClaimed) {
        toast('You are already registered for this event!', { icon: 'ℹ️' });
      } else {
        toast.success('Registered! Your ticket is ready 🎟️');
      }
      return data;
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to register');
      return null;
    }
  };

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="container hero-content">
          <ScrollReveal>
            <div className="hero-text">
              <span className="badge">Nurturing the Next Generation of Innovators</span>
              <h1 className="hero-title">From Idea to Impact: Your Startup Journey Begins Here.</h1>
              <p className="hero-desc">
                The Innovation & Incubation Cell (IIC) provides the mentorship, funding, and resources needed to transform student projects into scalable ventures.
              </p>
              <div className="hero-actions">
                <Link to="/team" className="btn btn-secondary">Join Us Now</Link>
                <Link to="/events" className="btn btn-primary">Explore Events</Link>
              </div>
            </div>
          </ScrollReveal>
          <ScrollReveal delay={0.2}>
            <div className="hero-image-wrapper">
               <img src="/src/assets/college.jpeg" alt="College campus" className="hero-image" />
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="stats-section container">
        <ScrollReveal>
          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon">💡</div>
              <h2 className="stat-number">10+</h2>
              <p className="stat-label">STARTUPS MENTORED</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🚀</div>
              <h2 className="stat-number">5</h2>
              <p className="stat-label">SUCCESSFUL INCUBATIONS</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <h2 className="stat-number">500+</h2>
              <p className="stat-label">STUDENTS REACHED</p>
            </div>
            <div className="stat-card">
              <div className="stat-icon">🏆</div>
              <h2 className="stat-number">₹1L+</h2>
              <p className="stat-label">GRANTS DISBURSED</p>
            </div>
          </div>
        </ScrollReveal>
      </section>

      <section className="mission-section section bg-light">
        <div className="container">
          <ScrollReveal>
            <h5 className="mission-kicker">OUR MISSION</h5>
            <h2 className="mission-title">
              We believe in empowering the brightest minds to solve real-world problems through collaborative entrepreneurship.
            </h2>
            <div className="mission-content">
              <div className="mission-item">
                <h3>Vision</h3>
                <p>To establish a world-class ecosystem for innovation that bridges the gap between academic research and commercial industrial applications.</p>
              </div>
              <div className="mission-item">
                <h3>Approach</h3>
                <p>Through rigorous mentoring, seed funding, and access to a vast network of industry experts, we turn prototypes into market-ready products.</p>
              </div>
            </div>
            <div className="mission-action">
              <Link to="/about" className="btn btn-primary">Learn more about our history</Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="events-section section">
        <div className="container">
          <ScrollReveal>
            <div className="events-header">
              <div>
                <h2 className="section-title" style={{ textAlign: 'left', marginBottom: '0.5rem' }}>Upcoming Opportunities</h2>
                <p className="section-subtitle" style={{ textAlign: 'left', margin: '0', maxWidth: '600px' }}>
                  Join our upcoming workshops, hackathons, and networking sessions to scale your ideas.
                </p>
              </div>
              <Link to="/events" className="btn btn-secondary">View All Events</Link>
            </div>

            <div className="events-grid">
              {events.length > 0 ? events.map(event => (
                <ScrollReveal key={event._id} delay={0.1}>
                  <EventCard event={event} onClaim={handleClaim} user={user} />
                </ScrollReveal>
              )) : (
                <p>No upcoming events at the moment.</p>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="team-section section bg-light">
        <div className="container">
          <ScrollReveal>
            <h2 className="section-title">Meet the Leadership</h2>
            <p className="section-subtitle">The dedicated team driving innovation at our campus.</p>

            <div className="team-grid">
              {team.length > 0 ? team.map((member, index) => (
                <ScrollReveal key={member._id} delay={index * 0.1}>
                  <TeamCard member={member} />
                </ScrollReveal>
              )) : (
                <p>Leadership team will be updated soon.</p>
              )}
            </div>

            <div className="team-action">
              <Link to="/team" className="btn btn-primary">Meet the Full Team</Link>
            </div>
          </ScrollReveal>
        </div>
      </section>

      <section className="cta-section-wrapper section">
        <div className="container">
          <ScrollReveal>
            <div className="cta-box">
              <div className="cta-box-content">
                <h2 className="cta-title">Ready to launch your startup?</h2>
                <p className="cta-desc">Applications for the Summer Cohort are now open. Join the community that turns visionaries into founders.</p>
              </div>
              <div className="cta-box-actions">
                <a href="https://forms.gle/SeoQnn8KnrYLyoUD7" target="_blank" rel="noopener noreferrer" className="btn btn-light" style={{ backgroundColor: 'white', color: 'var(--secondary)' }}>Submit Applications</a>
              </div>
            </div>
          </ScrollReveal>
        </div>
      </section>
    </div>
  );
};

export default Home;
