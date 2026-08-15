import { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import ScrollReveal from '../components/ScrollReveal';
import { useAuth } from '../context/useAuth';
import { eventCategories, galleryCategories, teamCategories } from '../constants/taxonomy';
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
  const [editingEventId, setEditingEventId] = useState(null);
  const [events, setEvents] = useState([]);

  const [teamData, setTeamData] = useState({ name: '', category: 'Members', email: '' });
  const [teamImage, setTeamImage] = useState(null);
  const [editingTeamId, setEditingTeamId] = useState(null);
  const [teamMembers, setTeamMembers] = useState([]);
  const [adminEmails, setAdminEmails] = useState([]);
  const [confirmAdmin, setConfirmAdmin] = useState(null);
  const [confirmRemoveAdmin, setConfirmRemoveAdmin] = useState(null);
  const [adminPassword, setAdminPassword] = useState('');

  const [galleryData, setGalleryData] = useState({ title: '', category: 'Events' });
  const [galleryImage, setGalleryImage] = useState(null);
  const [editingGalleryId, setEditingGalleryId] = useState(null);
  const [galleryItems, setGalleryItems] = useState([]);

  const authConfig = () => ({ headers: { Authorization: `Bearer ${user.token}` } });

  const fetchEvents = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/events`);
      setEvents(data);
    } catch {
      toast.error('Failed to load events');
    }
  };

  const fetchTeamMembers = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/team`);
      setTeamMembers(data);
    } catch {
      toast.error('Failed to load team members');
    }
  };

  const fetchGalleryItems = async () => {
    try {
      const { data } = await axios.get(`${API_URL}/gallery`);
      setGalleryItems(data);
    } catch {
      toast.error('Failed to load gallery');
    }
  };

  useEffect(() => {
    if (user?.token) {
      axios.get(`${API_URL}/auth/admins`, authConfig()).then(res => setAdminEmails(res.data)).catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    if (activeTab === 'events') fetchEvents();
    if (activeTab === 'team') {
      fetchTeamMembers();
      axios.get(`${API_URL}/auth/admins`, authConfig()).then(res => setAdminEmails(res.data)).catch(() => {});
    }
    if (activeTab === 'gallery') fetchGalleryItems();
  }, [activeTab]);

  const uploadImage = async (file) => {
    const formData = new FormData();
    formData.append('image', file);
    const { data } = await axios.post(`${API_URL}/upload`, formData, {
      headers: { 'Content-Type': 'multipart/form-data', Authorization: `Bearer ${user.token}` }
    });
    const imageUrl = data.imageUrl || data.secure_url || data.url;
    if (!imageUrl) throw new Error('Image uploaded, but no image URL was returned');
    return imageUrl;
  };

  const resetEventForm = () => {
    setEventData({ title: '', description: '', date: '', time: '', location: '', coordinates: null, totalSeats: '', category: 'Workshop' });
    setEventImage(null); 
    setEditingEventId(null);
  };

  const resetTeamForm = () => {
    setTeamData({ name: '', category: 'Members', email: '' });
    setTeamImage(null); 
    setEditingTeamId(null);
  };

  const resetGalleryForm = () => {
    setGalleryData({ title: '', category: 'Events' });
    setGalleryImage(null);
    setEditingGalleryId(null);
  };

  const handleEventSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const toastId = toast.loading(editingEventId ? 'Updating event...' : 'Creating event...');
    try {
      const imageUrl = eventImage ? await uploadImage(eventImage) : (editingEventId ? events.find(event => event._id === editingEventId)?.imageUrl : null);
      if (!imageUrl) throw new Error('Event image is required');

      const payload = {
        ...eventData,
        imageUrl,
        totalSeats: Number(eventData.totalSeats),
        remainingSeats: editingEventId
          ? Math.max(Number(eventData.totalSeats) - (events.find(event => event._id === editingEventId)?.registeredUsers?.length || 0), 0)
          : Number(eventData.totalSeats)
      };

      if (editingEventId) {
        await axios.put(`${API_URL}/events/${editingEventId}`, payload, authConfig());
        toast.success('Event updated successfully!', { id: toastId });
      } else {
        await axios.post(`${API_URL}/events`, payload, authConfig());
        toast.success('Event created successfully!', { id: toastId });
      }

      resetEventForm();
      fetchEvents();
    } catch (error) {
      const msg = error.response?.data?.errors?.map(e => e.msg).join(', ') || error.response?.data?.message || 'Error saving event';
      toast.error(msg, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const toastId = toast.loading(editingTeamId ? 'Updating team member...' : 'Adding team member...');
    try {
      const imageUrl = teamImage ? await uploadImage(teamImage) : (editingTeamId ? teamMembers.find(member => member._id === editingTeamId)?.imageUrl : null);
      if (!imageUrl) throw new Error('Profile image is required');

      const payload = { ...teamData, imageUrl };
      if (editingTeamId) {
        await axios.put(`${API_URL}/team/${editingTeamId}`, payload, authConfig());
        toast.success('Team member updated!', { id: toastId });
      } else {
        await axios.post(`${API_URL}/team`, payload, authConfig());
        toast.success('Team member added!', { id: toastId });
      }

      resetTeamForm();
      fetchTeamMembers();
      axios.get(`${API_URL}/auth/admins`, authConfig()).then(res => setAdminEmails(res.data)).catch(() => {});
    } catch (error) {
      const msg = error.response?.data?.errors?.map(e => e.msg).join(', ') || error.response?.data?.message || 'Error saving team member';
      toast.error(msg, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const handleGallerySubmit = async (e) => {
    e.preventDefault();
    setUploading(true);
    const toastId = toast.loading(editingGalleryId ? 'Updating gallery item...' : 'Uploading image...');
    try {
      const imageUrl = galleryImage ? await uploadImage(galleryImage) : (editingGalleryId ? galleryItems.find(item => item._id === editingGalleryId)?.imageUrl : null);
      if (!imageUrl) throw new Error('Image is required for gallery');

      const payload = { ...galleryData, imageUrl };
      if (editingGalleryId) {
        await axios.put(`${API_URL}/gallery/${editingGalleryId}`, payload, authConfig());
        toast.success('Gallery item updated!', { id: toastId });
      } else {
        await axios.post(`${API_URL}/gallery`, payload, authConfig());
        toast.success('Gallery image added!', { id: toastId });
      }

      resetGalleryForm();
      fetchGalleryItems();
    } catch (error) {
      const msg = error.response?.data?.errors?.map(e => e.msg).join(', ') || error.response?.data?.message || 'Error saving gallery item';
      toast.error(msg, { id: toastId });
    } finally {
      setUploading(false);
    }
  };

  const startEditEvent = (event) => {
    setEditingEventId(event._id);
    setEventData({
      title: event.title,
      description: event.description,
      date: event.date ? new Date(event.date).toISOString().slice(0, 10) : '',
      time: event.time,
      location: event.location,
      coordinates: event.coordinates || null,
      totalSeats: String(event.totalSeats ?? ''),
      category: event.category
    });
    setEventImage(null);
    setActiveTab('events');
  };

  const startEditTeam = (member) => {
    setEditingTeamId(member._id);
    setTeamData({
      name: member.name,
      category: member.category,
      email: member.email || ''
    });
    setTeamImage(null);
    setActiveTab('team');
  };

  const startEditGallery = (item) => {
    setEditingGalleryId(item._id);
    setGalleryData({ title: item.title || '', category: item.category });
    setGalleryImage(null);
    setActiveTab('gallery');
  };

  const handleDeleteEvent = async (id) => {
    try {
      await axios.delete(`${API_URL}/events/${id}`, authConfig());
      toast.success('Event deleted');
      fetchEvents();
    } catch {
      toast.error('Failed to delete event');
    }
  };

  const handleDeleteTeam = async (id) => {
    try {
      await axios.delete(`${API_URL}/team/${id}`, authConfig());
      toast.success('Team member deleted');
      fetchTeamMembers();
    } catch {
      toast.error('Failed to delete team member');
    }
  };

  const handleDeleteGallery = async (id) => {
    try {
      await axios.delete(`${API_URL}/gallery/${id}`, authConfig());
      toast.success('Gallery item deleted');
      fetchGalleryItems();
    } catch {
      toast.error('Failed to delete gallery item');
    }
  };

  const moveItem = async (resource, id, direction) => {
    const list = resource === 'events' ? [...events] : resource === 'team' ? [...teamMembers] : [...galleryItems];
    const index = list.findIndex(item => item._id === id);
    if (index < 0) return;

    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    if (swapIndex < 0 || swapIndex >= list.length) return;

    const reordered = [...list];
    [reordered[index], reordered[swapIndex]] = [reordered[swapIndex], reordered[index]];
    const orderedIds = reordered.map(item => item._id);

    try {
      await axios.put(`${API_URL}/${resource === 'events' ? 'events' : resource === 'team' ? 'team' : 'gallery'}/reorder`, { orderedIds }, authConfig());
      if (resource === 'events') fetchEvents();
      if (resource === 'team') fetchTeamMembers();
      if (resource === 'gallery') fetchGalleryItems();
      toast.success('Order updated');
    } catch {
      toast.error('Failed to reorder items');
    }
  };

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
                    <input type="file" className="input-field" accept="image/*" required={!editingEventId} onChange={e => setEventImage(e.target.files[0])} />
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
                  <div className="admin-form-actions">
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={uploading}>
                      {uploading ? (editingEventId ? 'Updating...' : 'Uploading & Creating...') : (editingEventId ? 'Update Event' : 'Create Event')}
                    </button>
                    {editingEventId && (
                      <button type="button" className="btn btn-outline" onClick={resetEventForm}>Cancel Edit</button>
                    )}
                  </div>
                </form>

                {events.length > 0 && (
                  <div className="admin-list-panel">
                    <h3>Current Events</h3>
                    {events.map((event, index) => (
                      <div key={event._id} className="admin-list-item">
                        <div>
                          <strong>{event.title}</strong>
                          <span>{event.category} · {event.registeredUsers?.length || 0} registered</span>
                        </div>
                        <div className="admin-item-actions">
                          <button onClick={() => moveItem('events', event._id, 'up')} disabled={index === 0}>↑</button>
                          <button onClick={() => moveItem('events', event._id, 'down')} disabled={index === events.length - 1}>↓</button>
                          <button className="btn btn-secondary" onClick={() => startEditEvent(event)}>Edit</button>
                          <button className="btn btn-outline" onClick={() => handleDeleteEvent(event._id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'team' && (
              <div className="admin-form-container">
                <h2>Add Team Member</h2>
                <form onSubmit={handleTeamSubmit}>
                  <div className="input-group">
                    <label>Profile Image</label>
                    <input type="file" className="input-field" accept="image/*" required={!editingTeamId} onChange={e => setTeamImage(e.target.files[0])} />
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
                    <label>Category</label>
                    <select className="input-field" value={teamData.category} onChange={e => setTeamData({ ...teamData, category: e.target.value })}>
                      {teamCategories.map(category => (
                        <option key={category} value={category}>{category}</option>
                      ))}
                    </select>
                  </div>
                  <div className="admin-form-actions">
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={uploading}>
                      {uploading ? (editingTeamId ? 'Updating...' : 'Uploading & Adding...') : (editingTeamId ? 'Update Member' : 'Add Member')}
                    </button>
                    {editingTeamId && (
                      <button type="button" className="btn btn-outline" onClick={resetTeamForm}>Cancel Edit</button>
                    )}
                  </div>
                </form>

                {teamMembers.length > 0 && (
                  <div className="admin-list-panel">
                    <h3>Current Team Members</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                      {teamMembers.filter(member => member.email !== user.email).map((member, index) => (
                        <div key={member._id} className="admin-list-item">
                          <div>
                            <strong>{member.name}</strong>
                            <span>{member.category}</span>
                          </div>
                          <div className="admin-item-actions">
                            <button onClick={() => moveItem('team', member._id, 'up')} disabled={index === 0}>↑</button>
                            <button onClick={() => moveItem('team', member._id, 'down')} disabled={index === teamMembers.length - 1}>↓</button>
                            <button className="btn btn-secondary" onClick={() => startEditTeam(member)}>Edit</button>
                            <button className="btn btn-outline" onClick={() => handleDeleteTeam(member._id)}>Delete</button>
                            {member.email && (
                              adminEmails.includes(member.email)
                                ? <button className="btn" style={{ backgroundColor: '#ef4444', color: 'white' }} onClick={() => setConfirmRemoveAdmin(member)}>Remove Admin</button>
                                : <button className="btn btn-secondary" onClick={() => setConfirmAdmin(member)}>Make Admin</button>
                            )}
                          </div>
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
                    <input type="file" className="input-field" accept="image/*" required={!editingGalleryId} onChange={e => setGalleryImage(e.target.files[0])} />
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
                  <div className="admin-form-actions">
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={uploading}>
                      {uploading ? (editingGalleryId ? 'Updating...' : 'Uploading & Adding...') : (editingGalleryId ? 'Update Image' : 'Add Image')}
                    </button>
                    {editingGalleryId && (
                      <button type="button" className="btn btn-outline" onClick={resetGalleryForm}>Cancel Edit</button>
                    )}
                  </div>
                </form>

                {galleryItems.length > 0 && (
                  <div className="admin-list-panel">
                    <h3>Current Gallery Items</h3>
                    {galleryItems.map((item, index) => (
                      <div key={item._id} className="admin-list-item">
                        <div>
                          <strong>{item.title || 'Untitled'}</strong>
                          <span>{item.category}</span>
                        </div>
                        <div className="admin-item-actions">
                          <button onClick={() => moveItem('gallery', item._id, 'up')} disabled={index === 0}>↑</button>
                          <button onClick={() => moveItem('gallery', item._id, 'down')} disabled={index === galleryItems.length - 1}>↓</button>
                          <button className="btn btn-secondary" onClick={() => startEditGallery(item)}>Edit</button>
                          <button className="btn btn-outline" onClick={() => handleDeleteGallery(item._id)}>Delete</button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
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
