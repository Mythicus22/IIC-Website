import { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, MapPin, Map as MapIcon, X, Download, User } from 'lucide-react';
import QRCode from 'qrcode';
import MapComponent from './MapComponent';
import './EventCard.css';

const createTicketId = (eventId, userId) => {
  if (!eventId || !userId) return null;
  const seed = `${eventId}:${userId}`;
  let hash = 0;
  for (let i = 0; i < seed.length; i += 1) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return `IIC-${String(eventId).slice(-6).toUpperCase()}-${hash.toString(36).slice(-8).toUpperCase()}`;
};

const TicketModal = ({ event, ticketId, user, onClose }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (canvasRef.current && ticketId) {
      QRCode.toCanvas(canvasRef.current, ticketId, {
        width: 120,
        margin: 1,
        color: { dark: '#2C2C8C', light: '#FFFFFF' }
      });
    }
  }, [ticketId]);

  const handleDownload = () => {
    const ticket = document.getElementById('ticket-content');
    const printWindow = window.open('', '_blank');
    if (!ticket || !printWindow) return;
    printWindow.document.write(`
      <html><head><title>IIC Event Ticket</title>
      <style>
        body { margin: 0; font-family: 'Inter', sans-serif; background: #f8fafc; display: flex; justify-content: center; padding: 2rem; }
      </style></head>
      <body>${ticket.outerHTML}</body></html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div className="ticket-overlay" onClick={onClose}>
      <div className="ticket-wrapper" onClick={e => e.stopPropagation()}>
        <button className="ticket-close" onClick={onClose}><X size={20} /></button>

        <div id="ticket-content" className="ticket">
          <div className="ticket-header">
            <div className="ticket-org">
              <div className="ticket-logo-dot" />
              <span>IIC — Innovation & Incubation Cell</span>
            </div>
            <span className="ticket-badge">{event.category}</span>
          </div>

          <div className="ticket-body">
            <div className="ticket-info">
              <h2 className="ticket-title">{event.title}</h2>
              <div className="ticket-meta-grid">
                <div className="ticket-meta-item">
                  <Calendar size={15} />
                  <span>{new Date(event.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
                <div className="ticket-meta-item">
                  <Clock size={15} />
                  <span>{event.time}</span>
                </div>
                <div className="ticket-meta-item">
                  <MapPin size={15} />
                  <span>{event.location}</span>
                </div>
              </div>

              <div className="ticket-attendee">
                <div className="ticket-avatar">
                  <User size={22} />
                </div>
                <div>
                  <p className="ticket-attendee-label">Registered Attendee</p>
                  <p className="ticket-attendee-name">{user?.name || 'Guest'}</p>
                  <p className="ticket-attendee-email">{user?.email || ''}</p>
                </div>
              </div>
            </div>

            <div className="ticket-divider">
              <div className="ticket-notch top" />
              <div className="ticket-dashes" />
              <div className="ticket-notch bottom" />
            </div>

            <div className="ticket-qr">
              <canvas ref={canvasRef} />
              <p className="ticket-id">{ticketId}</p>
              <p className="ticket-scan-label">Scan at entry</p>
            </div>
          </div>

          <div className="ticket-footer">
            <span>This ticket is non-transferable</span>
            <span>iic.college.edu</span>
          </div>
        </div>

        <button className="btn btn-outline" style={{ marginTop: '1rem', width: '100%' }} onClick={handleDownload}>
          <Download size={16} style={{ marginRight: '0.5rem' }} /> Download / Print Ticket
        </button>
      </div>
    </div>
  );
};

const EventCard = ({ event, onClaim, user }) => {
  const [showMap, setShowMap] = useState(false);
  const [ticket, setTicket] = useState(null);
  const [failedImage, setFailedImage] = useState(null);
  const imageUrl = event.imageUrl || event.secure_url || event.url;
  const imageFailed = failedImage === imageUrl;

  const isRegistered = Boolean(
    user && event.registeredUsers?.some((id) => String(id) === String(user._id))
  );

  const ticketId = isRegistered ? (event.ticketId || createTicketId(event._id, user._id)) : null;

  const handleClaimClick = async () => {
    const result = await onClaim(event._id);
    if (result?.event) {
      const nextTicketId = result.ticketId || createTicketId(result.event._id, user?._id);
      setTicket({ event: result.event, ticketId: nextTicketId });
    }
  };

  const handleViewTicket = () => {
    if (!ticketId) return;
    setTicket({ event, ticketId });
  };

  return (
    <>
      <div className="card event-card">
        <div className="event-img-wrapper">
          {imageUrl && !imageFailed ? (
            <img src={imageUrl} alt={event.title} className="event-img" onError={() => setFailedImage(imageUrl)} />
          ) : (
            <div className="event-img-placeholder" />
          )}
          <span className="event-category-badge">{event.category}</span>
        </div>
        <div className="event-content">
          <h3 className="event-title">{event.title}</h3>
          <div className="event-meta">
            <div className="meta-item"><Calendar size={16} /> {new Date(event.date).toLocaleDateString()}</div>
            <div className="meta-item"><Clock size={16} /> {event.time}</div>
            <div className="meta-item" style={{ justifyContent: 'space-between' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><MapPin size={16} /> {event.location}</span>
              <button className="btn-link" onClick={() => setShowMap(!showMap)} style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.8rem' }}>
                <MapIcon size={14} /> {showMap ? 'Hide Map' : 'View Map'}
              </button>
            </div>
            {showMap && (
              <div style={{ marginTop: '1rem', marginBottom: '1rem' }}>
                <MapComponent address={event.location} coordinates={event.coordinates} />
              </div>
            )}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.85rem', color: event.remainingSeats > 0 ? 'var(--text-muted)' : '#EF4444' }}>
              {event.remainingSeats > 0 ? `${event.registeredUsers?.length ?? 0} registered · ${event.remainingSeats} seats left` : 'Sold Out'}
            </span>
          </div>
          <button
            className={`btn ${isRegistered ? 'btn-secondary' : event.remainingSeats > 0 ? 'btn-primary' : 'btn-outline'}`}
            onClick={isRegistered ? handleViewTicket : handleClaimClick}
            disabled={!isRegistered && event.remainingSeats === 0}
          >
            {isRegistered ? 'View Ticket' : event.remainingSeats > 0 ? 'Register & Get Ticket' : 'Sold Out'}
          </button>
        </div>
      </div>

      {ticket && <TicketModal event={ticket.event} ticketId={ticket.ticketId} user={user} onClose={() => setTicket(null)} />}
    </>
  );
};

export default EventCard;
