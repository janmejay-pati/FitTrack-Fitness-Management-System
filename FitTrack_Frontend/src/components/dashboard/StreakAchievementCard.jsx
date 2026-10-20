import React from 'react';
import { Flame, Trophy, Award, Star, CheckCircle2, Circle } from 'lucide-react';
import '../3d/Fitness3D.css';

export default function StreakAchievementCard({ streaks = {} }) {
  const {
    currentStreak = 0,
    longestStreak = 0,
    totalActiveDays = 0
  } = streaks;

  // Real badge list evaluated strictly against database activity
  const badges = [
    {
      id: 'streak_3',
      name: 'Consistent Ignition',
      desc: '3-day consecutive activity streak',
      unlocked: currentStreak >= 3 || longestStreak >= 3,
      color: '#f59e0b',
      icon: Flame,
      progress: `${Math.min(3, Math.max(currentStreak, longestStreak))}/3 days`
    },
    {
      id: 'streak_7',
      name: '7-Day Consistency',
      desc: '7-day uninterrupted streak',
      unlocked: currentStreak >= 7 || longestStreak >= 7,
      color: '#10b981',
      icon: Award,
      progress: `${Math.min(7, Math.max(currentStreak, longestStreak))}/7 days`
    },
    {
      id: 'active_10',
      name: 'Dedication Pioneer',
      desc: '10 cumulative active fitness days',
      unlocked: totalActiveDays >= 10,
      color: '#06b6d4',
      icon: Star,
      progress: `${Math.min(10, totalActiveDays)}/10 days`
    },
    {
      id: 'active_30',
      name: 'Monthly Titan',
      desc: '30 cumulative active fitness days',
      unlocked: totalActiveDays >= 30,
      color: '#a855f7',
      icon: Trophy,
      progress: `${Math.min(30, totalActiveDays)}/30 days`
    }
  ];

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header */}
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
            background: 'rgba(245, 158, 11, 0.15)',
            color: '#f59e0b',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Flame size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Streak & Achievement Engine
              {currentStreak > 0 ? (
                <span className="intel-badge intel-badge-gold">{currentStreak} Day Streak 🔥</span>
              ) : (
                <span className="intel-badge intel-badge-blue">No active streak</span>
              )}
            </h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Deterministic habit badges verified against continuous activity days.
            </p>
          </div>
        </div>
      </div>

      {/* Streak Top Numbers */}
      <div style={{ padding: '1rem 1.25rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.65rem', marginBottom: '1rem' }}>
          <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#f59e0b' }}>{currentStreak}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Current Streak</div>
          </div>
          <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#10b981' }}>{longestStreak}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Best Streak</div>
          </div>
          <div style={{ padding: '0.65rem 0.85rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
            <div style={{ fontSize: '1.35rem', fontWeight: 800, color: '#38bdf8' }}>{totalActiveDays}</div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active Days</div>
          </div>
        </div>

        {/* Badges List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {badges.map(b => {
            const IconComponent = b.icon;
            return (
              <div
                key={b.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.65rem 0.85rem',
                  borderRadius: '8px',
                  background: b.unlocked ? 'rgba(255, 255, 255, 0.04)' : 'rgba(255, 255, 255, 0.015)',
                  border: b.unlocked ? `1px solid ${b.color}44` : '1px solid rgba(255, 255, 255, 0.05)'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <div style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    background: b.unlocked ? `${b.color}22` : 'rgba(255, 255, 255, 0.04)',
                    color: b.unlocked ? b.color : 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}>
                    <IconComponent size={16} />
                  </div>
                  <div>
                    <div style={{ fontSize: '0.82rem', fontWeight: 600, color: b.unlocked ? '#f8fafc' : 'var(--text-muted)' }}>
                      {b.name}
                    </div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>{b.desc}</div>
                  </div>
                </div>

                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: b.unlocked ? '#10b981' : 'var(--text-muted)' }}>
                  {b.unlocked ? 'Unlocked ✓' : b.progress}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
