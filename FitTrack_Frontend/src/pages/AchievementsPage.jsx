import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Award, Zap, ShieldCheck, Droplets, Target, Utensils, 
  Activity, Lock, CheckCircle2, Sparkles, Trophy, RefreshCw
} from 'lucide-react';
import toast from 'react-hot-toast';
import confetti from 'canvas-confetti';
import achievementService from '../services/achievementService';

const getBadgeIcon = (iconName) => {
  switch (iconName) {
    case 'zap': return <Zap size={28} />;
    case 'shield-check': return <ShieldCheck size={28} />;
    case 'droplet': return <Droplets size={28} />;
    case 'target': return <Target size={28} />;
    case 'utensils': return <Utensils size={28} />;
    case 'activity': return <Activity size={28} />;
    default: return <Award size={28} />;
  }
};

export default function AchievementsPage() {
  const [achievements, setAchievements] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAchievements = async () => {
    try {
      setLoading(true);
      const res = await achievementService.get();
      const list = Array.isArray(res) ? res : (res?.data || []);
      setAchievements(list);
      
      // If user has unlocked any badges, trigger a brief celebration
      const unlockedCount = list.filter(a => a.isUnlocked).length;
      if (unlockedCount > 0) {
        confetti({
          particleCount: 40,
          spread: 60,
          origin: { y: 0.7 }
        });
      }
    } catch (err) {
      toast.error('Failed to load achievements');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAchievements();
  }, []);

  const totalBadges = achievements.length;
  const unlockedCount = achievements.filter(a => a.isUnlocked).length;
  const progressPercent = totalBadges > 0 ? Math.round((unlockedCount / totalBadges) * 100) : 0;

  const getRank = (count) => {
    if (count >= 6) return { name: 'Apex Legend', color: '#10b981', tier: 'Tier V' };
    if (count >= 4) return { name: 'Iron Titan', color: '#3b82f6', tier: 'Tier IV' };
    if (count >= 3) return { name: 'Fitness Warrior', color: '#8b5cf6', tier: 'Tier III' };
    if (count >= 1) return { name: 'Rising Challenger', color: '#f59e0b', tier: 'Tier II' };
    return { name: 'Fitness Initiate', color: '#94a3b8', tier: 'Tier I' };
  };

  const rank = getRank(unlockedCount);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1><Award style={{ color: 'var(--accent)' }} /> Badges & Achievements</h1>
          <p className="page-subtitle">Track your fitness journey milestones and earn prestigious badges</p>
        </div>
        <button className="btn btn-secondary" onClick={fetchAchievements} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Badges
        </button>
      </div>

      {/* Gamification Level Banner */}
      <motion.div 
        className="card"
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          marginBottom: '2rem',
          background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(6, 182, 212, 0.08) 100%)',
          borderColor: 'rgba(16, 185, 129, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1.5rem',
          padding: '1.75rem 2rem'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: 'var(--radius-lg)',
            background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-hover) 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#fff',
            boxShadow: '0 4px 20px var(--accent-glow)'
          }}>
            <Trophy size={32} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
              <span className="badge badge-cyan">{rank.tier}</span>
              <h2 style={{ fontSize: '1.5rem', margin: 0 }}>{rank.name}</h2>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {unlockedCount} of {totalBadges} badges unlocked ({progressPercent}% overall completion)
            </p>
          </div>
        </div>

        <div style={{ minWidth: '220px', flex: '1 1 220px', maxWidth: '360px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.5rem', color: 'var(--text-secondary)' }}>
            <span>Milestone Progress</span>
            <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{unlockedCount} / {totalBadges}</span>
          </div>
          <div style={{
            width: '100%',
            height: '10px',
            background: 'var(--bg-tertiary)',
            borderRadius: '999px',
            overflow: 'hidden'
          }}>
            <motion.div 
              style={{
                height: '100%',
                background: 'linear-gradient(90deg, var(--accent) 0%, var(--accent-cyan) 100%)',
                borderRadius: '999px'
              }}
              initial={{ width: 0 }}
              animate={{ width: `${progressPercent}%` }}
              transition={{ duration: 0.8, ease: 'easeOut' }}
            />
          </div>
        </div>
      </motion.div>

      {/* Badges Grid */}
      {loading ? (
        <div style={{ padding: '4rem 0', textAlign: 'center' }}>
          <div className="spinner" />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Scanning fitness achievements...</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem'
        }}>
          {achievements.map((badge, idx) => {
            const isUnlocked = badge.isUnlocked;

            return (
              <motion.div
                key={badge.key}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.07 }}
                className="card"
                style={{
                  position: 'relative',
                  overflow: 'hidden',
                  background: isUnlocked 
                    ? 'radial-gradient(circle at top right, rgba(16, 185, 129, 0.12), transparent 70%), var(--surface)' 
                    : 'var(--surface)',
                  borderColor: isUnlocked ? 'rgba(16, 185, 129, 0.4)' : 'var(--border)',
                  boxShadow: isUnlocked ? '0 4px 20px rgba(16, 185, 129, 0.1)' : 'none'
                }}
              >
                {/* Status Watermark / Indicator */}
                <div style={{
                  position: 'absolute',
                  top: '1rem',
                  right: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.35rem'
                }}>
                  {isUnlocked ? (
                    <span className="badge badge-success">
                      <Sparkles size={12} /> Unlocked
                    </span>
                  ) : (
                    <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>
                      <Lock size={12} /> Locked
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', marginTop: '0.5rem' }}>
                  {/* Badge Icon Orb */}
                  <div style={{
                    width: '56px',
                    height: '56px',
                    borderRadius: '50%',
                    background: isUnlocked 
                      ? 'linear-gradient(135deg, rgba(16, 185, 129, 0.25) 0%, rgba(6, 182, 212, 0.2) 100%)' 
                      : 'var(--bg-tertiary)',
                    border: `2px solid ${isUnlocked ? 'var(--accent)' : 'var(--border)'}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: isUnlocked ? 'var(--accent)' : 'var(--text-muted)',
                    flexShrink: 0,
                    boxShadow: isUnlocked ? '0 0 15px var(--accent-glow)' : 'none'
                  }}>
                    {getBadgeIcon(badge.icon)}
                  </div>

                  <div style={{ flex: 1, paddingRight: '1rem' }}>
                    <h3 style={{ 
                      fontSize: '1.15rem', 
                      marginBottom: '0.35rem', 
                      color: isUnlocked ? 'var(--text-primary)' : 'var(--text-secondary)' 
                    }}>
                      {badge.title}
                    </h3>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                      {badge.description}
                    </p>
                  </div>
                </div>

                {/* Progress Bar / Timestamp */}
                <div style={{ marginTop: '1.5rem', paddingTop: '1rem', borderTop: '1px solid var(--border)' }}>
                  {isUnlocked ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.8rem', color: 'var(--accent)' }}>
                      <CheckCircle2 size={16} />
                      <span>Unlocked {badge.unlockedAt ? new Date(badge.unlockedAt).toLocaleDateString() : 'Active'}</span>
                    </div>
                  ) : (
                    <div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>
                        <span>Progress</span>
                        <span>{badge.currentProgress} / {badge.requiredCount}</span>
                      </div>
                      <div style={{ width: '100%', height: '6px', background: 'var(--bg-tertiary)', borderRadius: '999px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${badge.progressPercentage || 0}%`,
                          height: '100%',
                          background: 'var(--accent)',
                          borderRadius: '999px',
                          transition: 'width 0.4s ease'
                        }} />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
