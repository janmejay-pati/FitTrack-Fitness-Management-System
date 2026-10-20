import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Utensils, Flame, Sparkles, Filter, Apple, Clock, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import dietPlanService from '../services/dietPlanService';

const CATEGORIES = ['All', 'Underweight', 'Normal', 'Overweight', 'Obese'];

export default function DietPlansPage() {
  const [plans, setPlans] = useState([]);
  const [recommended, setRecommended] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [plansRes, recRes] = await Promise.all([
        dietPlanService.getDietPlans(selectedCategory === 'All' ? null : selectedCategory),
        dietPlanService.getRecommendedPlans().catch(() => null)
      ]);

      setPlans(Array.isArray(plansRes) ? plansRes : (plansRes?.data || []));
      setRecommended(recRes?.data || recRes || null);
    } catch (err) {
      toast.error('Failed to load diet plans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [selectedCategory]);

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
          <h1><Utensils style={{ color: 'var(--accent)' }} /> Diet & Nutrition Plans</h1>
          <p className="page-subtitle">Scientifically curated nutrition regimes matched to your metabolic goals</p>
        </div>
      </div>

      {/* Recommended Plan Banner */}
      {recommended && recommended.dietPlans?.length > 0 && (
        <motion.div
          className="card"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(59, 130, 246, 0.08) 100%)',
            borderColor: 'rgba(16, 185, 129, 0.3)',
            padding: '1.5rem 2rem'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
            <span className="badge badge-success"><Sparkles size={13} /> Personalized AI Recommendation</span>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Based on your BMI of <strong>{recommended.bmiScore}</strong> ({recommended.bmiCategory})
            </span>
          </div>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>
            Targeted Dietary Roadmap for {recommended.bmiCategory} Metabolism
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', maxWidth: '800px' }}>
            We recommend prioritizing protein density and balanced macronutrient distribution tailored to support your metabolic recovery and daily physical output.
          </p>
        </motion.div>
      )}

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        overflowX: 'auto',
        paddingBottom: '0.75rem',
        marginBottom: '1.75rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem', marginRight: '0.5rem' }}>
          <Filter size={16} /> Filters:
        </div>
        {CATEGORIES.map(cat => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`btn ${selectedCategory === cat ? 'btn-primary' : 'btn-secondary'}`}
            style={{
              padding: '0.45rem 1rem',
              fontSize: '0.85rem',
              borderRadius: '999px'
            }}
          >
            {cat} {cat !== 'All' ? 'Target' : 'Plans'}
          </button>
        ))}
      </div>

      {/* Diet Plan Cards Grid */}
      {loading ? (
        <div style={{ padding: '4rem 0', textAlign: 'center' }}>
          <div className="spinner" />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading nutrition guides...</p>
        </div>
      ) : plans.length === 0 ? (
        <div className="empty-state">
          <Apple className="empty-icon" />
          <h3>No diet plans found</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            There are currently no active diet plans listed for this category.
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
                  borderTop: isMatch ? '3px solid var(--accent)' : '1px solid var(--border)'
                }}
              >
                {isMatch && (
                  <div style={{ position: 'absolute', top: '1rem', right: '1rem' }}>
                    <span className="badge badge-success"><Sparkles size={11} /> Top Match</span>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem', flexWrap: 'wrap' }}>
                  <span className={`badge ${getBmiBadgeClass(plan.bmiCategory)}`}>
                    {plan.bmiCategory} Target
                  </span>
                  <span className="badge badge-cyan">
                    {plan.mealType || 'Meal Plan'}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', paddingRight: isMatch ? '4rem' : 0 }}>
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
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#f59e0b', fontWeight: 600 }}>
                    <Flame size={18} />
                    <span>{plan.calories ? plan.calories.toLocaleString() : '1,800'} kcal/day</span>
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                    Active Daily Goal
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
