import React, { useState, useEffect, useRef } from 'react';
import { Calendar, Clock, MapPin, Map as MapIcon, X, Download, User } from 'lucide-react';
import QRCode from 'qrcode';
import MapComponent from './MapComponent';
import './EventCard.css';

const TicketModal = ({ event, user, onClose }) => {
  const canvasRef = useRef(null);
  const ticketId = `IIC-${event._id.slice(-6).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;

  useEffect(() => {
    if (canvasRef.current) {
      QRCode.toCanvas(canvasRef.current, ticketId, {
        width: 120,
        margin: 1,
        color: { dark: '#2C2C8C', light: '#FFFFFF' }
      });
    }
  }, [ticketId]);

  const handleDownload = () => {
    const ticket = document.getElementById('ticket-content');
    // Simple print-based download
    const printWindow = window.open('', '_blank');
    printWindow.document.write(`
      <html><head><title>IIC Event Ticket</title>
      <style>
        body { margin: 0; font-family: 'Inter', sans-serif; background: #f8fafc; display: flex; justify-content: center; padding: 2rem; }
        ${document.querySelector('style') ? '' : ''}
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
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = event.imageUrl || event.secure_url || event.url;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  const handleClaimClick = async () => {
    const result = await onClaim(event._id);
    if (result?.event) {
      setTicket(result.event);
    }
  };

  return (
    <>
      <div className="card event-card">
        <div className="event-img-wrapper">
          {imageUrl && !imageFailed ? (
            <img src={imageUrl} alt={event.title} className="event-img" onError={() => setImageFailed(true)} />
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
              {event.remainingSeats > 0 ? `${event.remainingSeats} seats left` : 'Sold Out'}
            </span>
          </div>
          <button
            className={`btn ${event.remainingSeats > 0 ? 'btn-primary' : 'btn-outline'}`}
            onClick={handleClaimClick}
            disabled={event.remainingSeats === 0}
          >
            {event.remainingSeats > 0 ? 'Register & Get Ticket' : 'Sold Out'}
          </button>
        </div>
      </div>

      {ticket && <TicketModal event={ticket} user={user} onClose={() => setTicket(null)} />}
    </>
  );
};

export default EventCard;
