import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ScrollReveal from '../components/ScrollReveal';
import { useSocket } from '../context/SocketContext';
import { galleryCategories } from '../constants/taxonomy';
import './Gallery.css';

const GalleryImage = ({ item }) => {
  const [imageFailed, setImageFailed] = useState(false);
  const imageUrl = item.imageUrl || item.secure_url || item.url;

  useEffect(() => {
    setImageFailed(false);
  }, [imageUrl]);

  if (!imageUrl || imageFailed) {
    return <div className="gallery-img gallery-img-placeholder" />;
  }

  return (
    <img
      src={imageUrl}
      alt={item.title || item.category}
      className="gallery-img"
      onError={() => setImageFailed(true)}
    />
  );
};

const Gallery = () => {
  const [items, setItems] = useState([]);
  const [filter, setFilter] = useState('All');
  const socket = useSocket();

  useEffect(() => {
    const fetchGallery = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
        const res = await axios.get(`${apiUrl}/gallery`);
        setItems(res.data);
      } catch (error) {
        console.error("Error fetching gallery:", error);
      }
    };
    fetchGallery();
  }, []);

  useEffect(() => {
    if (!socket) return;
    
    socket.on('gallery_updated', async () => {
       const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
       const res = await axios.get(`${apiUrl}/gallery`);
       setItems(res.data);
    });
    
    return () => socket.off('gallery_updated');
  }, [socket]);

  const categories = ['All', ...galleryCategories];

  const filteredItems = filter === 'All' ? items : items.filter(i => i.category === filter);

  return (
    <div className="gallery-page section container">
      <ScrollReveal>
        <div className="page-header text-center" style={{marginBottom: '3rem'}}>
          <span className="badge">Visual Archive</span>
          <h1 className="hero-title" style={{textAlign: 'center', marginBottom: '1rem'}}>Moments of Innovation</h1><br /><br />
          <p className="section-subtitle">
            Explore our journey through workshops, pitch days, and community events that drive the entrepreneurial spirit on campus.
          </p>
        </div>

        <div className="gallery-filters">
          {categories.map(cat => (
            <button 
              key={cat}
              className={`gallery-filter-btn ${filter === cat ? 'active' : ''}`}
              onClick={() => setFilter(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="gallery-grid">
          {filteredItems.length > 0 ? filteredItems.map((item, index) => (
            <ScrollReveal key={item._id} delay={index * 0.1}>
              <div className="gallery-item">
                <GalleryImage item={item} />
                <div className="gallery-overlay">
                  <span className="gallery-category">{item.category}</span>
                  {item.title && <h3 className="gallery-title">{item.title}</h3>}
                </div>
              </div>
            </ScrollReveal>
          )) : (
            <p className="text-center" style={{gridColumn: '1 / -1', padding: '4rem 0'}}>No images found for this category.</p>
          )}
        </div>
        
        {filteredItems.length > 0 && (
          <div className="gallery-footer text-center" style={{marginTop: '4rem', paddingBottom: '2rem'}}>
             <hr style={{maxWidth: '100px', margin: '0 auto 1rem auto', borderColor: 'var(--border)'}} />
             <p style={{color: 'var(--text-muted)'}}>Showing {filteredItems.length} of {items.length} items</p>
          </div>
        )}
      </ScrollReveal>
    </div>
  );
};

export default Gallery;
