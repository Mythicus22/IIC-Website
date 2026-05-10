import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ScrollReveal from '../components/ScrollReveal';
import { useAuth } from '../context/AuthContext';
import { eventCategories, galleryCategories, teamCategories, teamRoles } from '../constants/taxonomy';
import './AdminDashboard.css';

const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const LocationInput = ({ value, onChange }) => {
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const debounceRef = useRef(null);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) setShowSuggestions(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (e) => {
    const val = e.target.value;
    onChange({ name: val, coordinates: null });
    clearTimeout(debounceRef.current);
    if (val.length < 3) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await axios.get('https://nominatim.openstreetmap.org/search', {
          params: { q: val, format: 'json', limit: 5, addressdetails: 1 },
          headers: { 'Accept-Language': 'en' }
        });
        setSuggestions(res.data);
        setShowSuggestions(true);
      } catch { setSuggestions([]); }
    }, 400);
  };

  const handleSelect = (place) => {
    onChange({
      name: place.display_name,
      coordinates: { lat: parseFloat(place.lat), lng: parseFloat(place.lon) }
    });
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <input
        type="text"
        className="input-field"
        required
        value={value}
        onChange={handleChange}
        onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
        placeholder="Type to search location..."
        autoComplete="off"
      />
      {showSuggestions && suggestions.length > 0 && (
        <ul className="location-suggestions">
          {suggestions.map((s) => (
            <li key={s.place_id} onClick={() => handleSelect(s)}>
              {s.display_name}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('events');
  const { user } = useAuth();
  const [uploading, setUploading] = useState(false);

  const [eventData, setEventData] = useState({
    title: '', description: '', date: '', time: '', location: '', coordinates: null, totalSeats: '', category: 'Workshop'
  });
  const [eventImage, setEventImage] = useState(null);

  const [teamData, setTeamData] = useState({ name: '', role: 'Student Member', category: 'Members' });
  const [teamImage, setTeamImage] = useState(null);

  const [galleryData, setGalleryData] = useState({ title: '', category: 'Events' });
  const [galleryImage, setGalleryImage] = useState(null);

  const authConfig = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await axios.post(`${apiUrl}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` }
    });
    const imageUrl = data.imageUrl || data.secure_url || data.url;

    if (!imageUrl) {
      throw new Error('Image uploaded, but no image URL was returned');
    }

    return imageUrl;
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    if (!eventImage) return toast.error('Event image is required');
    setUploading(true);
    const toastId = toast.loading('Creating event...');
    try {
      const imageUrl = await uploadImage(eventImage);
      const payload = {
        ...eventData,
        imageUrl,
        remainingSeats: Number(eventData.totalSeats),
        totalSeats: Number(eventData.totalSeats)
      };
      await axios.post(`${apiUrl}/events`, payload, authConfig());
      toast.success('Event created successfully!', { id: toastId });
      setEventData({ title: '', description: '', date: '', time: '', location: '', coordinates: null, totalSeats: '', category: 'Workshop' });
      setEventImage(null);
    } catch (error) {
      const msg = error.response?.data?.errors?.map(e => e.msg).join(', ') || error.response?.data?.message || 'Error creating event';
      toast.error(msg, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    if (!teamImage) return toast.error('Profile image is required');
    setUploading(true);
    const toastId = toast.loading('Adding team member...');
    try {
      const imageUrl = await uploadImage(teamImage);
      await axios.post(`${apiUrl}/team`, { ...teamData, imageUrl }, authConfig());
      toast.success('Team member added!', { id: toastId });
      setTeamData({ name: '', role: 'Student Member', category: 'Members' });
      setTeamImage(null);
    } catch (error) {
      const msg = error.response?.data?.errors?.map(e => e.msg).join(', ') || error.response?.data?.message || 'Error adding team member';
      toast.error(msg, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    if (!galleryImage) return toast.error('Image is required for gallery');
    setUploading(true);
    const toastId = toast.loading('Uploading image...');
    try {
      const imageUrl = await uploadImage(galleryImage);
      await axios.post(`${apiUrl}/gallery`, { ...galleryData, imageUrl }, authConfig());
      toast.success('Gallery image added!', { id: toastId });
      setGalleryData({ title: '', category: 'Events' });
      setGalleryImage(null);
    } catch (error) {
      const msg = error.response?.data?.errors?.map(e => e.msg).join(', ') || error.response?.data?.message || 'Error adding gallery image';
      toast.error(msg, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="admin-page section container">
      <ScrollReveal>
        <div className="page-header text-center" style={{ marginBottom: '3rem' }}>
          <span className="badge">Control Panel</span>
          <h1 className="hero-title">Admin Dashboard</h1>
        </div>

        <div className="admin-layout">
          <div className="admin-sidebar">
            <button className={`admin-tab ${activeTab === 'events' ? 'active' : ''}`} onClick={() => setActiveTab('events')}>Manage Events</button>
            <button className={`admin-tab ${activeTab === 'team' ? 'active' : ''}`} onClick={() => setActiveTab('team')}>Manage Team</button>
            <button className={`admin-tab ${activeTab === 'gallery' ? 'active' : ''}`} onClick={() => setActiveTab('gallery')}>Manage Gallery</button>
          </div>

          <div className="admin-content card">
            {activeTab === 'events' && (
              <div className="admin-form-container">
                <h2>Create New Event</h2>
                <form onSubmit={handleEventSubmit}>
                  <div className="input-group">
                    <label>Event Image</label>
                    <input type="file" className="input-field" accept="image/*" required onChange={e => setEventImage(e.target.files[0])} />
                  </div>
                  <div className="input-group">
                    <label>Title</label>
                    <input type="text" className="input-field" required value={eventData.title} onChange={e => setEventData({ ...eventData, title: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Description</label>
                    <textarea className="input-field" rows="4" required value={eventData.description} onChange={e => setEventData({ ...eventData, description: e.target.value })} />
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label>Date</label>
                      <input type="date" className="input-field" required value={eventData.date} onChange={e => setEventData({ ...eventData, date: e.target.value })} />
                    </div>
                    <div className="input-group">
                      <label>Time</label>
                      <input type="text" className="input-field" placeholder="e.g. 10:00 AM - 4:00 PM" required value={eventData.time} onChange={e => setEventData({ ...eventData, time: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-row">
                    <div className="input-group">
                      <label>Location</label>
                      <LocationInput
                        value={eventData.location}
                        onChange={({ name, coordinates }) => setEventData({ ...eventData, location: name, coordinates })}
                      />
                      {eventData.coordinates && (
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          📍 Coordinates saved
                        </p>
                      )}
                    </div>
                    <div className="input-group">
                      <label>Total Seats</label>
                      <input type="number" className="input-field" required min="1" value={eventData.totalSeats} onChange={e => setEventData({ ...eventData, totalSeats: e.target.value })} />
                    </div>
                  </div>
                  <div className="input-group">
                    <label>Category</label>
                    <select className="input-field" value={eventData.category} onChange={e => setEventData({ ...eventData, category: e.target.value })}>
                      {eventCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={uploading}>
                    {uploading ? 'Uploading & Creating...' : 'Create Event'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'team' && (
              <div className="admin-form-container">
                <h2>Add Team Member</h2>
                <form onSubmit={handleTeamSubmit}>
                  <div className="input-group">
                    <label>Profile Image</label>
                    <input type="file" className="input-field" accept="image/*" required onChange={e => setTeamImage(e.target.files[0])} />
                  </div>
                  <div className="input-group">
                    <label>Name</label>
                    <input type="text" className="input-field" required value={teamData.name} onChange={e => setTeamData({ ...teamData, name: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Role</label>
                    <select className="input-field" value={teamData.role} onChange={e => setTeamData({ ...teamData, role: e.target.value })}>
                      {teamRoles.map(role => (
                        <option key={role} value={role}>{role}</option>
                      ))}
                    </select>
                  </div>
                  <div className="input-group">
                    <label>Category</label>
                    <select className="input-field" value={teamData.category} onChange={e => setTeamData({ ...teamData, category: e.target.value })}>
                      {teamCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={uploading}>
                    {uploading ? 'Uploading & Adding...' : 'Add Member'}
                  </button>
                </form>
              </div>
            )}

            {activeTab === 'gallery' && (
              <div className="admin-form-container">
                <h2>Upload Gallery Image</h2>
                <form onSubmit={handleGallerySubmit}>
                  <div className="input-group">
                    <label>Image File</label>
                    <input type="file" className="input-field" accept="image/*" required onChange={e => setGalleryImage(e.target.files[0])} />
                  </div>
                  <div className="input-group">
                    <label>Title (Optional)</label>
                    <input type="text" className="input-field" value={galleryData.title} onChange={e => setGalleryData({ ...galleryData, title: e.target.value })} />
                  </div>
                  <div className="input-group">
                    <label>Category</label>
                    <select className="input-field" value={galleryData.category} onChange={e => setGalleryData({ ...galleryData, category: e.target.value })}>
                      {galleryCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={uploading}>
                    {uploading ? 'Uploading & Adding...' : 'Add Image'}
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </ScrollReveal>
    </div>
  );
};

export default AdminDashboard;
