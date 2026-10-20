import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Float } from '@react-three/drei';
import CanvasErrorBoundary from './CanvasErrorBoundary';
import { Clock, Dumbbell, Utensils, Droplets, Activity, Trophy, Filter } from 'lucide-react';
import './Fitness3D.css';

function TimelineSpine3D({ events, isReducedMotion }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (isReducedMotion) return;
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15;
    }
  });

  const nodeCount = Math.min(12, events.length);
  const visibleEvents = events.slice(0, nodeCount);

  return (
    <group ref={groupRef} position={[0, 0, 0]}>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#10b981" />
      <pointLight position={[-5, -5, -3]} intensity={1.5} color="#06b6d4" />

      {/* Central Spinal Column */}
      <Cylinder args={[0.04, 0.04, 4.8, 16]} position={[0, 0, 0]}>
        <meshStandardMaterial color="#334155" roughness={0.3} metalness={0.8} />
      </Cylinder>

      {/* Helical floating event nodes */}
      {visibleEvents.map((evt, idx) => {
        const yPos = 2.0 - idx * 0.38;
        const angle = idx * 0.8;
        const radius = 1.2;
        const xPos = Math.cos(angle) * radius;
        const zPos = Math.sin(angle) * radius;

        let nodeColor = '#10b981';
        if (evt.type === 'meal') nodeColor = '#06b6d4';
        else if (evt.type === 'water') nodeColor = '#3b82f6';
        else if (evt.type === 'bmi') nodeColor = '#eab308';
        else if (evt.type === 'achievement') nodeColor = '#a855f7';

        return (
          <group key={idx} position={[xPos, yPos, zPos]}>
            <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
              <Sphere args={[0.14, 16, 16]}>
                <meshStandardMaterial
                  color={nodeColor}
                  emissive={nodeColor}
                  emissiveIntensity={0.8}
                  roughness={0.2}
                />
              </Sphere>
            </Float>
          </group>
        );
      })}
    </group>
  );
}

export default function FitnessTimeline3D({ timeline = [], force2D = false }) {
  const [filterType, setFilterType] = useState('all');
  const [mode2D, setMode2D] = useState(force2D);

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
        return <Dumbbell size={18} color="#10b981" />;
      case 'meal':
        return <Utensils size={18} color="#06b6d4" />;
      case 'water':
        return <Droplets size={18} color="#3b82f6" />;
      case 'bmi':
        return <Activity size={18} color="#eab308" />;
      case 'achievement':
        return <Trophy size={18} color="#a855f7" />;
      default:
        return <Clock size={18} color="var(--text-muted)" />;
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
      <div style={{
        padding: '1.25rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: '8px',
            background: 'rgba(6, 182, 212, 0.15)',
            color: '#06b6d4',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Clock size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>
              Unified Fitness Timeline
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Cross-category chronological event ledger of verified workouts, meals, hydration & milestones.
            </p>
          </div>
        </div>

        {/* Filter Buttons */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
          {['all', 'workout', 'meal', 'water', 'bmi'].map(f => (
            <button
              key={f}
              type="button"
              className={`performance-toggle-btn ${filterType === f ? 'active' : ''}`}
              style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem', textTransform: 'capitalize' }}
              onClick={() => setFilterType(f)}
            >
              {f}
            </button>
          ))}
          <button
            type="button"
            className={`performance-toggle-btn ${mode2D ? 'active' : ''}`}
            style={{ padding: '0.35rem 0.65rem', fontSize: '0.78rem' }}
            onClick={() => setMode2D(!mode2D)}
          >
            {mode2D ? '2D View' : '3D Spine'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: mode2D ? '1fr' : '1.4fr 1fr', minHeight: '380px' }}>
        {/* Timeline Events List */}
        <div style={{ padding: '1.25rem 1.5rem', borderRight: mode2D ? 'none' : '1px solid rgba(255, 255, 255, 0.08)' }}>
          {filteredEvents.length === 0 ? (
            <div style={{ padding: '2.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
              Not enough historical data yet for this category. Log an entry to see it in your timeline!
            </div>
          ) : (
            <div className="timeline-list">
              {filteredEvents.map(evt => (
                <div key={evt.id || Math.random()} className="timeline-card">
                  <div className="timeline-icon-box" style={{ background: getIconBg(evt.type) }}>
                    {getEventIcon(evt.type)}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#f8fafc' }}>
                        {evt.title}
                      </span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                        {formatDateTime(evt.timestamp)}
                      </span>
                    </div>
                    <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary, #cbd5e1)' }}>
                      {evt.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* 3D Helical Spine Column */}
        {!mode2D && (
          <div className="canvas-wrapper" style={{ minHeight: '380px', borderRadius: 0 }}>
            <CanvasErrorBoundary
              fallback={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-muted)' }}>
                  Helical Spine resting
                </div>
              }
            >
              <Canvas camera={{ position: [0, 0, 4.5], fov: 45 }} gl={{ antialias: true, alpha: true }}>
                <TimelineSpine3D events={filteredEvents} />
              </Canvas>
              <div className="canvas-controls-hint">
                3D Event Spine • Helical Chronology
              </div>
            </CanvasErrorBoundary>
          </div>
        )}
      </div>
    </div>
  );
}
