import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ScrollReveal from '../components/ScrollReveal';
import { useAuth } from '../context/useAuth';
import { eventCategories, galleryCategories, teamCategories, teamRoles } from '../constants/taxonomy';
import { API_URL } from '../config/api';
import './AdminDashboard.css';

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

  const [teamData, setTeamData] = useState({ name: '', role: 'Student Member', category: 'Members', email: '' });
  const [teamImage, setTeamImage] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [adminEmails, setAdminEmails] = useState([]);
  const [confirmAdmin, setConfirmAdmin] = useState(null);
  const [confirmRemoveAdmin, setConfirmRemoveAdmin] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');

  const [galleryData, setGalleryData] = useState({ title: '', category: 'Events' });
  const [galleryImage, setGalleryImage] = useState(null);

  useEffect(() => {
    if (activeTab === 'team') {
      axios.get(`${API_URL}/team`).then(res => setTeamMembers(res.data)).catch(() => {});
      axios.get(`${API_URL}/auth/admins`, authConfig()).then(res => setAdminEmails(res.data)).catch(() => {});
    }
  }, [activeTab]);

  const handleMakeAdmin = async (member, password) => {
    try {
      await axios.post(`${API_URL}/auth/admins`, { email: member.email, name: member.name, password: password || undefined }, authConfig());
      setAdminEmails(prev => [...new Set([...prev, member.email])]);
      toast.success(`${member.name} has been granted admin access!`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to grant admin access');
    } finally {
      setConfirmAdmin(null);
      setAdminPassword('');
    }
  };

  const handleRemoveAdmin = async (member) => {
    try {
      await axios.delete(`${API_URL}/auth/admins`, { ...authConfig(), data: { email: member.email } });
      setAdminEmails(prev => prev.filter(e => e !== member.email));
      toast.success(`${member.name}'s admin access has been revoked.`);
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to revoke admin access');
    } finally {
      setConfirmRemoveAdmin(null);
    }
  };

  const authConfig = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await axios.post(`${API_URL}/upload`, formData, {
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
      await axios.post(`${API_URL}/events`, payload, authConfig());
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
      await axios.post(`${API_URL}/team`, { ...teamData, imageUrl }, authConfig());
      toast.success('Team member added!', { id: toastId });
      setTeamData({ name: '', role: 'Student Member', category: 'Members', email: '' });
      setTeamImage(null);
      axios.get(`${API_URL}/team`).then(res => setTeamMembers(res.data)).catch(() => {});
      axios.get(`${API_URL}/auth/admins`, authConfig()).then(res => setAdminEmails(res.data)).catch(() => {});
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
      await axios.post(`${API_URL}/gallery`, { ...galleryData, imageUrl }, authConfig());
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
                    <label>Email (for admin access)</label>
                    <input type="email" className="input-field" placeholder="Optional" value={teamData.email} onChange={e => setTeamData({ ...teamData, email: e.target.value })} />
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

                {teamMembers.length > 0 && (
                  <div style={{ marginTop: '2rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Current Team Members</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {teamMembers.filter(member => member.email !== user.email).map(member => (
                        <div key={member._id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-light, #f8f9fa)', borderRadius: '8px' }}>
                          <div>
                            <strong>{member.name}</strong>
                            <span style={{ marginLeft: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>{member.role}</span>
                          </div>
                          {member.email && (
                            adminEmails.includes(member.email)
                              ? <button
                                  className="btn"
                                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem', backgroundColor: '#ef4444', color: 'white' }}
                                  onClick={() => setConfirmRemoveAdmin(member)}
                                >Remove Admin</button>
                              : <button
                                  className="btn btn-secondary"
                                  style={{ padding: '0.3rem 0.75rem', fontSize: '0.8rem' }}
                                  onClick={() => setConfirmAdmin(member)}
                                >Make Admin</button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
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

      {confirmAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ padding: '2rem', maxWidth: '420px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem' }}>Confirm Admin Access</h3>
            <p style={{ marginBottom: '1rem' }}>Grant admin dashboard access to <strong>{confirmAdmin.name}</strong> ({confirmAdmin.email})?</p>
            <div className="input-group" style={{ textAlign: 'left', marginBottom: '1.5rem' }}>
              <label>Set Password <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(if no account yet)</span></label>
              <input
                type="password"
                className="input-field"
                placeholder="Leave blank if they already have an account"
                value={adminPassword}
                onChange={e => setAdminPassword(e.target.value)}
              />
            </div>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn btn-primary" onClick={() => handleMakeAdmin(confirmAdmin, adminPassword)}>Yes, Make Admin</button>
              <button className="btn btn-outline" onClick={() => { setConfirmAdmin(null); setAdminPassword(''); }}>Cancel</button>
            </div>
          </div>
        </div>
      )}
      {confirmRemoveAdmin && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="card" style={{ padding: '2rem', maxWidth: '420px', width: '90%', textAlign: 'center' }}>
            <h3 style={{ marginBottom: '1rem' }}>Revoke Admin Access</h3>
            <p style={{ marginBottom: '1.5rem' }}>Remove admin dashboard access from <strong>{confirmRemoveAdmin.name}</strong> ({confirmRemoveAdmin.email})?</p>
            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button className="btn" style={{ backgroundColor: '#ef4444', color: 'white' }} onClick={() => handleRemoveAdmin(confirmRemoveAdmin)}>Yes, Remove Admin</button>
              <button className="btn btn-outline" onClick={() => setConfirmRemoveAdmin(null)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
