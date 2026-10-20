import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dumbbell, Clock, Flame, Filter, Sparkles, Activity, Shield } from 'lucide-react';
import toast from 'react-hot-toast';
import workoutPlanService from '../services/workoutPlanService';

const CATEGORIES = ['All', 'Underweight', 'Normal', 'Overweight', 'Obese'];
const INTENSITIES = ['All', 'Low', 'Medium', 'High'];

export default function WorkoutPlansPage() {
  const [plans, setPlans] = useState([]);
  const [recommended, setRecommended] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedIntensity, setSelectedIntensity] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, recRes] = await Promise.all([
        workoutPlanService.getWorkoutPlans(
          selectedCategory === 'All' ? null : selectedCategory,
          selectedIntensity === 'All' ? null : selectedIntensity
        ),
        workoutPlanService.getRecommendedPlans().catch(() => null)
      ]);

      setPlans(Array.isArray(plansRes) ? plansRes : (plansRes?.data || []));
      setRecommended(recRes?.data || recRes || null);
    } catch (err) {
      toast.error('Failed to load workout plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory, selectedIntensity]);

  const getIntensityBadgeClass = (intensity) => {
    switch (intensity?.toLowerCase()) {
      case 'low': return 'badge-cyan';
      case 'medium': return 'badge-warning';
      case 'high': return 'badge-danger';
      default: return 'badge-info';
    }
  };

  const getBmiBadgeClass = (category) => {
    switch (category?.toLowerCase()) {
      case 'underweight': return 'badge-info';
      case 'normal': return 'badge-success';
      case 'overweight': return 'badge-warning';
      case 'obese': return 'badge-danger';
      default: return 'badge-cyan';
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1><Dumbbell style={{ color: 'var(--accent)' }} /> Structured Workout Routines</h1>
          <p className="page-subtitle">Periodized physical conditioning regimens engineered for your fitness level</p>
        </div>
      </div>

      {/* Recommended Banner */}
      {recommended && recommended.workoutPlans?.length > 0 && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(6, 182, 212, 0.12) 0%, rgba(139, 92, 246, 0.08) 100%)',
            borderColor: 'rgba(6, 182, 212, 0.3)',
            padding: '1.5rem 2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-cyan"><Sparkles size={13} /> Recommended For Your Current BMI</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Metabolic Index: <strong>{recommended.bmiScore}</strong> ({recommended.bmiCategory})
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            Optimized Training Load for {recommended.bmiCategory} Conditioning
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '800px' }}>
            These routines balance cardiovascular conditioning and resistance volume to maximize muscular retention, metabolic output, and joint safety.
          </p>
        </motion.div>
      )}

      {/* Filter Controls */}
      <div style={{
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        alignItems: 'center',
        marginBottom: '2rem',
        padding: '1rem',
        background: 'var(--surface)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border)'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginRight: '0.5rem' }}>
          <Filter size={18} style={{ color: 'var(--accent)' }} />
          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Filters:</span>
        </div>

        {/* Category filters */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>Target:</span>
          {CATEGORIES.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', borderRadius: '999px' }}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ width: '1px', height: '24px', background: 'var(--border)', margin: '0 0.5rem' }} />

        {/* Intensity filters */}
        <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginRight: '0.25rem' }}>Intensity:</span>
          {INTENSITIES.map(int => (
            <button
              key={int}
              onClick={() => setSelectedIntensity(int)}
              className={`btn ${selectedIntensity === int ? 'btn-primary' : 'btn-secondary'}`}
              style={{ padding: '0.35rem 0.85rem', fontSize: '0.8rem', borderRadius: '999px' }}
            >
              {int}
            </button>
          ))}
        </div>
      </div>

      {/* Routine Cards */}
      {loading ? (
        <div style={{ padding: '4rem 0', textAlign: 'center' }}>
          <div className="spinner" />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading workout plans...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="empty-state">
          <Dumbbell className="empty-icon" />
          <h3>No workout plans match your filter</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            Try adjusting your target category or intensity level.
          </p>
        </div>
      ) : (
        <div className="content-grid-3">
          {plans.map((plan, idx) => {
            const isMatch = recommended?.bmiCategory?.toLowerCase() === plan.bmiCategory?.toLowerCase();

            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="card card-hover"
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  borderTop: isMatch ? '3px solid var(--accent-cyan)' : '1px solid var(--border)'
                }}
              >
                {isMatch && (
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                    <span className="badge badge-cyan"><Sparkles size={11} /> Tailored Match</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span className={`badge ${getBmiBadgeClass(plan.bmiCategory)}`}>
                    {plan.bmiCategory} Target
                  </span>
                  <span className={`badge ${getIntensityBadgeClass(plan.intensityLevel)}`}>
                    {plan.intensityLevel} Intensity
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', paddingRight: isMatch ? '4.5rem' : 0 }}>
                  {plan.planName}
                </h3>

                <p style={{
                  color: 'var(--text-secondary)',
                  fontSize: '0.9rem',
                  lineHeight: '1.5',
                  flex: 1,
                  marginBottom: '1.5rem'
                }}>
                  {plan.description}
                </p>

                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '1rem',
                  borderTop: '1px solid var(--border)',
                  marginTop: 'auto'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent)', fontWeight: 600 }}>
                    <Clock size={16} />
                    <span>{plan.durationMinutes || 30} mins/session</span>
                  </div>
                  <span className="badge badge-purple" style={{ fontSize: '0.75rem' }}>
                    Structured
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
