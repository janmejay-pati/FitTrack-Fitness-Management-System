import React, { useState } from 'react';
import { Clock, Dumbbell, Utensils, Droplets, Activity, Trophy, Filter } from 'lucide-react';
import '../3d/Fitness3D.css';

export default function UnifiedFitnessTimeline({ timeline = [] }) {
  const [filterType, setFilterType] = useState('all');

  const normalizedEvents = (timeline || []).map(e => ({
    id: e.id || e.Id || Math.random().toString(),
    type: (e.type || e.Type || 'workout').toLowerCase(),
    title: e.title || e.Title || 'Activity Log',
    description: e.description || e.Description || '',
    category: e.category || e.Category || '',
    timestamp: e.timestamp || e.Timestamp || ''
  }));

  const filteredEvents = normalizedEvents.filter(item => {
    if (filterType === 'all') return true;
    return item.type === filterType;
  });

  const getEventIcon = (type) => {
    switch (type) {
      case 'workout':
        return <Dumbbell size={16} color="#10b981" />;
      case 'meal':
        return <Utensils size={16} color="#06b6d4" />;
      case 'water':
        return <Droplets size={16} color="#3b82f6" />;
      case 'bmi':
        return <Activity size={16} color="#eab308" />;
      case 'achievement':
        return <Trophy size={16} color="#a855f7" />;
      default:
        return <Clock size={16} color="var(--text-muted)" />;
    }
  };

  const getIconBg = (type) => {
    switch (type) {
      case 'workout':
        return 'rgba(16, 185, 129, 0.15)';
      case 'meal':
        return 'rgba(6, 182, 212, 0.15)';
      case 'water':
        return 'rgba(59, 130, 246, 0.15)';
      case 'bmi':
        return 'rgba(234, 179, 8, 0.15)';
      case 'achievement':
        return 'rgba(168, 85, 247, 0.15)';
      default:
        return 'rgba(255, 255, 255, 0.05)';
    }
  };

  const formatDateTime = (isoString) => {
    if (!isoString) return '';
    const d = new Date(isoString);
    if (isNaN(d.getTime())) return isoString;
    return d.toLocaleDateString(undefined, {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header with Filter Buttons */}
      <div style={{
        padding: '1rem 1.25rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.5rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            background: 'rgba(6, 182, 212, 0.15)',
            color: '#06b6d4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem' }}>
              Unified Fitness Timeline
            </h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Chronological ledger of verified activities and biometrics.
            </p>
          </div>
        </div>

        {/* Category Filters */}
        <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
          {['all', 'workout', 'meal', 'water', 'bmi'].map(cat => (
            <button
              key={cat}
              type="button"
              className={`performance-toggle-btn ${filterType === cat ? 'active' : ''}`}
              style={{ padding: '0.28rem 0.65rem', fontSize: '0.75rem', textTransform: 'capitalize' }}
              onClick={() => setFilterType(cat)}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Events List */}
      <div style={{ padding: '1rem 1.25rem' }}>
        {filteredEvents.length === 0 ? (
          <div style={{ padding: '2rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            Not enough historical data yet for this category. Log your workouts, meals, or water to see them in your timeline!
          </div>
        ) : (
          <div className="timeline-list" style={{ maxHeight: '340px' }}>
            {filteredEvents.map(evt => (
              <div key={evt.id} className="timeline-card" style={{ padding: '0.75rem 0.95rem' }}>
                <div className="timeline-icon-box" style={{ background: getIconBg(evt.type), width: '34px', height: '34px' }}>
                  {getEventIcon(evt.type)}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                    <strong style={{ fontSize: '0.88rem', color: '#f8fafc' }}>
                      {evt.title}
                    </strong>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      {formatDateTime(evt.timestamp)}
                    </span>
                  </div>
                  <p style={{ margin: '0.15rem 0 0', fontSize: '0.78rem', color: 'var(--text-secondary, #cbd5e1)' }}>
                    {evt.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
