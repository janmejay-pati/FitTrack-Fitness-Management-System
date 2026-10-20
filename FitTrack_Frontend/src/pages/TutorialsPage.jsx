import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Video, Play, Search, Filter, Clock, X, ExternalLink } from 'lucide-react';
import toast from 'react-hot-toast';
import tutorialService from '../services/tutorialService';

const CATEGORIES = ['All', 'Workout', 'Strength', 'Cardio', 'Nutrition', 'Yoga'];

export default function TutorialsPage() {
  const [tutorials, setTutorials] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeVideo, setActiveVideo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchTutorials = async () => {
    try {
      setLoading(true);
      const res = await tutorialService.get(
        selectedCategory === 'All' ? null : selectedCategory,
        searchQuery ? searchQuery.trim() : null
      );
      setTutorials(Array.isArray(res) ? res : (res?.data || []));
    } catch (err) {
      toast.error('Failed to load video tutorials');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      fetchTutorials();
    }, 250);
    return () => clearTimeout(delayDebounce);
  }, [selectedCategory, searchQuery]);

  // Convert regular YouTube links to embeddable URLs
  const getEmbedUrl = (url) => {
    if (!url) return '';
    try {
      if (url.includes('youtube.com/watch?v=')) {
        const videoId = url.split('v=')[1]?.split('&')[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
      if (url.includes('youtu.be/')) {
        const videoId = url.split('youtu.be/')[1]?.split('?')[0];
        return `https://www.youtube.com/embed/${videoId}?autoplay=1`;
      }
      return url;
    } catch {
      return url;
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1><Video style={{ color: 'var(--accent)' }} /> Video Knowledge Hub</h1>
          <p className="page-subtitle">Expert form tutorials, biomechanical guides, and science-based exercise breakdowns</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '2rem'
      }}>
        {/* Search input */}
        <div style={{ position: 'relative', flex: '1 1 300px', maxWidth: '420px' }}>
          <Search size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input
            type="text"
            className="form-input"
            style={{ paddingLeft: '2.75rem' }}
            placeholder="Search exercises, nutrition, form..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '0.5rem', overflowX: 'auto', paddingBottom: '0.25rem' }}>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.45rem 1rem', fontSize: '0.85rem', borderRadius: '999px' }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tutorials Grid */}
      {loading ? (
        <div style={{ padding: '4rem 0', textAlign: 'center' }}>
          <div className="spinner" />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading tutorial library...</p>
        </div>
      ) : tutorials.length === 0 ? (
        <div className="empty-state">
          <Video className="empty-icon" />
          <h3>No tutorials match your criteria</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Try clearing your search or switching to another category.
          </p>
        </div>
      ) : (
        <div className="content-grid-3">
          {tutorials.map((video, idx) => (
            <motion.div
              key={video.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: idx * 0.05 }}
              className="card card-hover"
              style={{ display: 'flex', flexDirection: 'column', padding: '0', overflow: 'hidden' }}
            >
              {/* Thumbnail / Play Overlay */}
              <div
                onClick={() => setActiveVideo(video)}
                style={{
                  height: '190px',
                  background: video.thumbnailUrl ? `url(${video.thumbnailUrl}) center / cover no-repeat` : 'var(--bg-tertiary)',
                  position: 'relative',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                {/* Dark Vignette */}
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  background: 'rgba(0, 0, 0, 0.45)',
                  transition: 'background 0.2s ease'
                }} />

                {/* Play Button Icon */}
                <div style={{
                  position: 'relative',
                  width: '54px',
                  height: '54px',
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  boxShadow: '0 4px 20px var(--accent-glow)',
                  transition: 'transform 0.2s ease'
                }}>
                  <Play size={24} style={{ marginLeft: '3px' }} />
                </div>

                {/* Category badge */}
                <div style={{ position: 'absolute', top: '0.75rem', left: '0.75rem' }}>
                  <span className="badge badge-purple">{video.category || 'General'}</span>
                </div>

                {/* Duration badge */}
                <div style={{ position: 'absolute', bottom: '0.75rem', right: '0.75rem' }}>
                  <span className="badge" style={{ background: 'rgba(0, 0, 0, 0.75)', color: '#fff' }}>
                    <Clock size={11} /> {video.duration || '10 min'}
                  </span>
                </div>
              </div>

              {/* Card Meta */}
              <div style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem', lineHeight: '1.4' }}>
                  {video.title}
                </h3>
                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem',
                  lineHeight: '1.5',
                  marginBottom: '1rem',
                  flex: 1
                }}>
                  {video.description || 'Comprehensive step-by-step masterclass.'}
                </p>

                <button
                  className="btn btn-secondary"
                  style={{ width: '100%', gap: '0.5rem' }}
                  onClick={() => setActiveVideo(video)}
                >
                  <Play size={16} /> Watch Tutorial
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      <AnimatePresence>
        {activeVideo && (
          <div className="modal-overlay" onClick={() => setActiveVideo(null)}>
            <motion.div
              className="modal-content"
              style={{ maxWidth: '850px', padding: '1.5rem' }}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
            >
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="badge badge-purple">{activeVideo.category}</span>
                  <h3 style={{ fontSize: '1.25rem', margin: 0 }}>{activeVideo.title}</h3>
                </div>
                <button className="modal-close" onClick={() => setActiveVideo(null)}>
                  <X size={20} />
                </button>
              </div>

              {/* Video Player Frame */}
              <div style={{
                position: 'relative',
                paddingBottom: '56.25%', // 16:9 aspect ratio
                height: 0,
                borderRadius: 'var(--radius-md)',
                overflow: 'hidden',
                background: '#000',
                marginBottom: '1rem'
              }}>
                <iframe
                  src={getEmbedUrl(activeVideo.videoUrl)}
                  title={activeVideo.title}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    border: 'none'
                  }}
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', margin: 0 }}>
                  {activeVideo.description}
                </p>
                {activeVideo.videoUrl && (
                  <a
                    href={activeVideo.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn btn-secondary"
                    style={{ fontSize: '0.85rem' }}
                  >
                    Open Source <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
