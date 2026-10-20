import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Cylinder, Torus, Float, Sphere } from '@react-three/drei';
import CanvasErrorBoundary from './CanvasErrorBoundary';
import { Trophy, Flame, Award, Zap, Star } from 'lucide-react';
import './Fitness3D.css';

function BadgePedestal({ isUnlocked, color = '#eab308', isReducedMotion }) {
  const badgeRef = useRef();

  useFrame((state, delta) => {
    if (isReducedMotion) return;
    if (badgeRef.current) {
      badgeRef.current.rotation.y += delta * 1.2;
    }
  });

  return (
    <group ref={badgeRef} position={[0, 0, 0]}>
      <ambientLight intensity={0.7} />
      <pointLight position={[3, 3, 3]} intensity={2} color={color} />
      <pointLight position={[-3, -3, -3]} intensity={1} color="#06b6d4" />

      {/* Outer Golden Ring */}
      <Torus args={[1.3, 0.08, 16, 64]}>
        <meshStandardMaterial
          color={isUnlocked ? color : '#334155'}
          emissive={isUnlocked ? color : '#1e293b'}
          emissiveIntensity={isUnlocked ? 0.6 : 0.1}
          metalness={0.9}
          roughness={0.2}
        />
      </Torus>

      {/* Central Medal Coin */}
      <Cylinder args={[1.0, 1.0, 0.12, 32]} rotation={[Math.PI / 2, 0, 0]}>
        <meshStandardMaterial
          color={isUnlocked ? '#1e293b' : '#0f172a'}
          emissive={isUnlocked ? color : '#000000'}
          emissiveIntensity={isUnlocked ? 0.3 : 0}
          metalness={0.8}
          roughness={0.3}
        />
      </Cylinder>

      {/* Center Star Gem */}
      <Float speed={2} rotationIntensity={0.5} floatIntensity={0.4}>
        <Sphere args={[0.22, 16, 16]} position={[0, 0, 0.12]}>
          <meshStandardMaterial
            color={isUnlocked ? '#ffffff' : '#64748b'}
            emissive={isUnlocked ? color : '#334155'}
            emissiveIntensity={isUnlocked ? 1.0 : 0.1}
          />
        </Sphere>
      </Float>
    </group>
  );
}

export default function AchievementGallery3D({ streaks = {}, achievements = [], force2D = false }) {
  const [selectedBadgeIdx, setSelectedBadgeIdx] = useState(0);
  const [mode2D, setMode2D] = useState(force2D);

  const {
    currentStreak = 0,
    longestStreak = 0,
    totalActiveDays = 0
  } = streaks;

  // Real badge list evaluated from real streak and database records
  const badges = [
    {
      id: 'streak_3',
      name: 'Consistent Ignition',
      desc: 'Achieve a 3-day active workout streak',
      unlocked: currentStreak >= 3 || longestStreak >= 3,
      color: '#f59e0b',
      progress: `${Math.min(3, Math.max(currentStreak, longestStreak))}/3 days`
    },
    {
      id: 'streak_7',
      name: 'Weekly Champion',
      desc: 'Maintain a 7-day uninterrupted streak',
      unlocked: currentStreak >= 7 || longestStreak >= 7,
      color: '#10b981',
      progress: `${Math.min(7, Math.max(currentStreak, longestStreak))}/7 days`
    },
    {
      id: 'active_10',
      name: 'Dedication Pioneer',
      desc: 'Log activity across 10 distinct days',
      unlocked: totalActiveDays >= 10,
      color: '#06b6d4',
      progress: `${Math.min(10, totalActiveDays)}/10 days`
    },
    {
      id: 'active_30',
      name: 'Monthly Titan',
      desc: 'Achieve 30 cumulative active fitness days',
      unlocked: totalActiveDays >= 30,
      color: '#a855f7',
      progress: `${Math.min(30, totalActiveDays)}/30 days`
    }
  ];

  const currentBadge = badges[selectedBadgeIdx] || badges[0];

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
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Flame size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Streak & Achievement Engine
              <span className="intel-badge intel-badge-gold">{currentStreak} Day Streak 🔥</span>
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Deterministic habit badges verified against continuous activity days.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className={`performance-toggle-btn ${!mode2D ? 'active' : ''}`}
            onClick={() => setMode2D(false)}
          >
            3D Medal
          </button>
          <button
            type="button"
            className={`performance-toggle-btn ${mode2D ? 'active' : ''}`}
            onClick={() => setMode2D(true)}
          >
            2D Badges
          </button>
        </div>
      </div>

      <div className="canvas-wrapper score-hero">
        {/* 3D Medal or 2D Badge Card */}
        <div style={{ position: 'relative', width: '100%', minHeight: '340px' }}>
          {mode2D ? (
            <div className="fallback-2d-container">
              <Trophy size={64} color={currentBadge.unlocked ? currentBadge.color : '#64748b'} />
              <span style={{ fontWeight: 700, fontSize: '1.2rem', color: '#f8fafc' }}>
                {currentBadge.name}
              </span>
              <span style={{ fontSize: '0.82rem', color: currentBadge.unlocked ? '#10b981' : 'var(--text-muted)' }}>
                {currentBadge.unlocked ? 'Unlocked Badge' : `Locked (${currentBadge.progress})`}
              </span>
            </div>
          ) : (
            <CanvasErrorBoundary>
              <Canvas camera={{ position: [0, 0, 4.0], fov: 45 }} gl={{ antialias: true, alpha: true }}>
                <BadgePedestal
                  isUnlocked={currentBadge.unlocked}
                  color={currentBadge.color}
                />
              </Canvas>
              <div className="canvas-controls-hint">
                Interactive 3D Medal • {currentBadge.unlocked ? 'Unlocked' : 'In Progress'}
              </div>
            </CanvasErrorBoundary>
          )}

          {/* Selected Badge Indicator */}
          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '0.65rem 1rem',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '1.05rem', fontWeight: 700, color: currentBadge.color, lineHeight: 1 }}>
              {currentBadge.name}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {currentBadge.desc}
            </div>
          </div>
        </div>

        {/* Streaks Stats & Badges Grid */}
        <div style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '1.25rem',
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Top Streak Stats */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#f59e0b' }}>{currentStreak}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Current Streak</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981' }}>{longestStreak}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Best Streak</div>
            </div>
            <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#38bdf8' }}>{totalActiveDays}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active Days</div>
            </div>
          </div>

          {/* Badges Carousel / Selector */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Badges Showcase
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {badges.map((b, idx) => (
                <div
                  key={b.id}
                  onClick={() => setSelectedBadgeIdx(idx)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.65rem 0.85rem',
                    borderRadius: '8px',
                    background: selectedBadgeIdx === idx ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.02)',
                    border: selectedBadgeIdx === idx ? `1px solid ${b.color}` : '1px solid rgba(255, 255, 255, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                    <div style={{
                      width: '28px',
                      height: '28px',
                      borderRadius: '6px',
                      background: b.unlocked ? `${b.color}22` : 'rgba(255, 255, 255, 0.04)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: b.unlocked ? b.color : 'var(--text-muted)'
                    }}>
                      <Star size={16} />
                    </div>
                    <div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 600, color: b.unlocked ? '#f8fafc' : 'var(--text-muted)' }}>
                        {b.name}
                      </div>
                      <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{b.desc}</div>
                    </div>
                  </div>

                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: b.unlocked ? '#10b981' : 'var(--text-muted)' }}>
                    {b.unlocked ? 'Unlocked' : b.progress}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
