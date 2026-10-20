import React, { useState } from 'react';
import { Calendar, CheckCircle2, Clock, Dumbbell, Utensils, Zap } from 'lucide-react';
import '../3d/Fitness3D.css';

export default function AdaptiveWeeklySchedule({ adaptiveWeeklyPlan = [] }) {
  const days = Array.isArray(adaptiveWeeklyPlan)
    ? adaptiveWeeklyPlan
    : (adaptiveWeeklyPlan?.days || []);

  const adaptationNote = !Array.isArray(adaptiveWeeklyPlan) ? adaptiveWeeklyPlan?.adaptationNote : null;

  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const todayIdx = days.findIndex(d => d.isToday);
    return todayIdx >= 0 ? todayIdx : 0;
  });

  const selectedDay = days[selectedDayIndex] || days[0] || {};

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
            background: 'rgba(168, 85, 247, 0.15)',
            color: '#a855f7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Adaptive 7-Day Fitness Schedule
              <span className="intel-badge intel-badge-blue">Rule-Based Adaptation</span>
            </h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Self-balancing weekly structure generated from your verified workout logs and activity momentum.
            </p>
          </div>
        </div>

        {adaptationNote && (
          <span style={{ fontSize: '0.75rem', color: '#38bdf8', background: 'rgba(56, 189, 248, 0.1)', padding: '0.3rem 0.65rem', borderRadius: '6px' }}>
            {adaptationNote}
          </span>
        )}
      </div>

      {/* 7-Day Horizontal Strip */}
      <div className="week-tabs" style={{ padding: '0.85rem 1.25rem', background: 'rgba(255, 255, 255, 0.015)' }}>
        {days.map((d, idx) => {
          const dayLabel = d.dayName || d.day || '';
          const isSelected = selectedDayIndex === idx;

          return (
            <button
              key={idx}
              type="button"
              className={`week-tab-btn ${isSelected ? 'active' : ''} ${d.isCompleted ? 'completed' : ''}`}
              onClick={() => setSelectedDayIndex(idx)}
              style={{ padding: '0.65rem 0.4rem' }}
            >
              <span style={{ fontSize: '0.72rem', fontWeight: 600, color: d.isToday ? '#06b6d4' : 'var(--text-muted)' }}>
                {dayLabel.slice(0, 3)}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                {d.date?.slice(8)}
              </span>
              {d.isCompleted ? (
                <CheckCircle2 size={14} color="#10b981" />
              ) : d.isToday ? (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#06b6d4' }} />
              ) : d.isRestDay ? (
                <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>Rest</span>
              ) : (
                <Clock size={12} color="var(--text-muted)" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Agenda */}
      <div style={{
        padding: '1.1rem 1.25rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(255, 255, 255, 0.02)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
        gap: '1rem'
      }}>
        {/* Workout Item */}
        <div style={{
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#10b981', fontWeight: 600, fontSize: '0.85rem' }}>
              <Dumbbell size={15} /> Workout Focus
            </span>
            <span className={`intel-badge ${selectedDay.isCompleted ? 'intel-badge-emerald' : 'intel-badge-blue'}`} style={{ padding: '0.15rem 0.55rem', fontSize: '0.7rem' }}>
              {selectedDay.isCompleted ? 'Completed ✓' : selectedDay.isRestDay ? 'Rest & Recovery' : 'Upcoming'}
            </span>
          </div>
          <strong style={{ fontSize: '0.92rem', color: '#f8fafc', display: 'block' }}>
            {selectedDay.focus || selectedDay.workoutSummary || 'Active Recovery'}
          </strong>
          <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {selectedDay.loggedWorkouts?.length > 0
              ? `Logged: ${selectedDay.loggedWorkouts.map(w => w.Exercise || w.exercise).join(', ')} (${selectedDay.loggedWorkouts.reduce((acc, w) => acc + (w.Duration || w.duration || 0), 0)} mins)`
              : selectedDay.isRestDay
              ? 'Scheduled recovery & mobility'
              : `Target: ${selectedDay.targetWorkoutMinutes || 45} mins active training`}
          </div>
        </div>

        {/* Nutrition Item */}
        <div style={{
          padding: '0.85rem 1rem',
          borderRadius: '10px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.35rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#06b6d4', fontWeight: 600, fontSize: '0.85rem' }}>
              <Utensils size={15} /> Nutrition Guidance
            </span>
            <span className="intel-badge intel-badge-blue" style={{ padding: '0.15rem 0.55rem', fontSize: '0.7rem' }}>
              Fuel Target
            </span>
          </div>
          <strong style={{ fontSize: '0.92rem', color: '#f8fafc', display: 'block' }}>
            {selectedDay.mealSummary || 'Balanced Whole Foods & Protein'}
          </strong>
          <div style={{ marginTop: '0.35rem', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
            {selectedDay.loggedMeals?.length > 0
              ? `Logged: ${selectedDay.loggedMeals.map(m => m.FoodItems || m.foodItems).join(', ')} (${selectedDay.loggedMeals.reduce((acc, m) => acc + (m.Calories || m.calories || 0), 0)} kcal)`
              : 'Target macronutrient and hydration alignment'}
          </div>
        </div>
      </div>
    </div>
  );
}
