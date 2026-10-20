import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Cylinder, Float, Text } from '@react-three/drei';
import CanvasErrorBoundary from './CanvasErrorBoundary';
import { Calendar, CheckCircle2, Clock, Dumbbell, Utensils, Sparkles } from 'lucide-react';
import './Fitness3D.css';

function PlannerPlatforms({ days, selectedDayIndex, onSelectDay, isReducedMotion }) {
  const groupRef = useRef();

  useFrame((state, delta) => {
    if (isReducedMotion) return;
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.3) * 0.05;
    }
  });

  return (
    <group ref={groupRef} position={[0, -0.2, 0]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[0, 6, 4]} intensity={1.2} />

      {days.map((d, index) => {
        // Distribute 7 days along X: from -3.6 to +3.6
        const xPos = -3.6 + index * 1.2;
        const isSelected = selectedDayIndex === index;
        const isToday = d.isToday;
        const isCompleted = d.isCompleted;

        const baseColor = isToday
          ? '#06b6d4'
          : isCompleted
          ? '#10b981'
          : '#1e293b';

        const emissiveColor = isToday
          ? '#0891b2'
          : isCompleted
          ? '#059669'
          : '#0f172a';

        const elevation = isSelected ? 0.35 : 0;

        return (
          <group
            key={index}
            position={[xPos, elevation, 0]}
            onClick={() => onSelectDay(index)}
          >
            {/* Floating Day Platform Base */}
            <Box args={[0.95, 0.2, 1.2]} position={[0, 0, 0]}>
              <meshStandardMaterial
                color={baseColor}
                emissive={emissiveColor}
                emissiveIntensity={isSelected ? 0.9 : isCompleted || isToday ? 0.5 : 0.15}
                roughness={0.2}
                metalness={0.7}
              />
            </Box>

            {/* Glowing Activity Beacon on platform */}
            {isCompleted && (
              <Cylinder args={[0.08, 0.08, 0.4, 16]} position={[0, 0.25, 0]}>
                <meshStandardMaterial color="#10b981" emissive="#34d399" emissiveIntensity={1.2} />
              </Cylinder>
            )}

            {isToday && (
              <Float speed={2} rotationIntensity={0.2} floatIntensity={0.4}>
                <Cylinder args={[0.1, 0.1, 0.5, 16]} position={[0, 0.35, 0]}>
                  <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={1.5} />
                </Cylinder>
              </Float>
            )}
          </group>
        );
      })}
    </group>
  );
}

function Fallback2DPlanner({ days, selectedDayIndex, onSelectDay }) {
  return (
    <div className="week-tabs" style={{ padding: '1rem' }}>
      {days.map((day, idx) => (
        <button
          key={idx}
          type="button"
          className={`week-tab-btn ${selectedDayIndex === idx ? 'active' : ''} ${day.isCompleted ? 'completed' : ''}`}
          onClick={() => onSelectDay(idx)}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 600, color: day.isToday ? '#06b6d4' : 'var(--text-muted)' }}>
            {day.day?.slice(0, 3)}
          </span>
          <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#f8fafc' }}>
            {day.date?.slice(8)}
          </span>
          {day.isCompleted ? (
            <CheckCircle2 size={14} color="#10b981" />
          ) : day.isToday ? (
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#06b6d4' }} />
          ) : (
            <Clock size={12} color="var(--text-muted)" />
          )}
        </button>
      ))}
    </div>
  );
}

export default function WeeklyPlanner3D({ adaptiveWeeklyPlan = [], force2D = false }) {
  const days = Array.isArray(adaptiveWeeklyPlan)
    ? adaptiveWeeklyPlan
    : (adaptiveWeeklyPlan?.days || []);

  const adaptationNote = !Array.isArray(adaptiveWeeklyPlan) ? adaptiveWeeklyPlan?.adaptationNote : null;

  const [selectedDayIndex, setSelectedDayIndex] = useState(() => {
    const todayIdx = days.findIndex(d => d.isToday);
    return todayIdx >= 0 ? todayIdx : 0;
  });
  const [mode2D, setMode2D] = useState(force2D);

  const selectedDay = days[selectedDayIndex] || days[0] || {};

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
            background: 'rgba(168, 85, 247, 0.15)',
            color: '#a855f7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Calendar size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Adaptive 7-Day Fitness Schedule
              <span className="intel-badge intel-badge-blue">Dynamic Adaptation</span>
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Self-balancing weekly structure populated with real historical workout and meal logs.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className={`performance-toggle-btn ${!mode2D ? 'active' : ''}`}
            onClick={() => setMode2D(false)}
          >
            3D Stage
          </button>
          <button
            type="button"
            className={`performance-toggle-btn ${mode2D ? 'active' : ''}`}
            onClick={() => setMode2D(true)}
          >
            2D Tabs
          </button>
        </div>
      </div>

      {/* 3D Visualizer or 2D Tabs */}
      <div className="canvas-wrapper" style={{ height: '240px' }}>
        {mode2D ? (
          <Fallback2DPlanner
            days={days}
            selectedDayIndex={selectedDayIndex}
            onSelectDay={setSelectedDayIndex}
          />
        ) : (
          <CanvasErrorBoundary
            fallback={<Fallback2DPlanner
              days={days}
              selectedDayIndex={selectedDayIndex}
              onSelectDay={setSelectedDayIndex}
            />}
          >
            <Canvas
              camera={{ position: [0, 2.6, 5.0], fov: 44 }}
              gl={{ antialias: true, alpha: true }}
              style={{ width: '100%', height: '100%' }}
            >
              <PlannerPlatforms
                days={days}
                selectedDayIndex={selectedDayIndex}
                onSelectDay={setSelectedDayIndex}
              />
            </Canvas>
            <div className="canvas-controls-hint">
              Click any 3D platform to view full workout & meal agenda
            </div>
          </CanvasErrorBoundary>
        )}
      </div>

      {/* Quick Day Selector Strip */}
      <div className="week-tabs" style={{ padding: '0.75rem 1.5rem', background: 'rgba(255, 255, 255, 0.015)' }}>
        {days.map((d, idx) => {
          const dayLabel = d.dayName || d.day || '';
          return (
            <button
              key={idx}
              type="button"
              className={`week-tab-btn ${selectedDayIndex === idx ? 'active' : ''} ${d.isCompleted ? 'completed' : ''}`}
              onClick={() => setSelectedDayIndex(idx)}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: d.isToday ? '#06b6d4' : 'var(--text-muted)' }}>
                {dayLabel.slice(0, 3)}
              </span>
              <span style={{ fontSize: '0.9rem', fontWeight: 700, color: '#f8fafc' }}>
                {d.date?.slice(8)}
              </span>
              {d.isCompleted ? (
                <CheckCircle2 size={14} color="#10b981" />
              ) : d.isToday ? (
                <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#06b6d4' }} />
              ) : (
                <Clock size={12} color="var(--text-muted)" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Day Detailed Card */}
      <div style={{
        padding: '1.25rem 1.5rem',
        borderTop: '1px solid rgba(255, 255, 255, 0.08)',
        background: 'rgba(255, 255, 255, 0.02)',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.25rem'
      }}>
        {/* Workout Item */}
        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#10b981', fontWeight: 600, fontSize: '0.9rem' }}>
            <Dumbbell size={16} /> Workout Focus
          </div>
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
            {selectedDay.focus || selectedDay.workoutSummary || 'Rest & Recovery'}
          </p>
          <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {selectedDay.loggedWorkouts?.length > 0
              ? `Logged: ${selectedDay.loggedWorkouts.map(w => w.Exercise || w.exercise).join(', ')} (${selectedDay.loggedWorkouts.reduce((acc, w) => acc + (w.Duration || w.duration || 0), 0)} mins)`
              : selectedDay.isRestDay
              ? 'Scheduled recovery session'
              : `Target: ${selectedDay.targetWorkoutMinutes || 45} mins active`}
          </div>
        </div>

        {/* Meal Item */}
        <div style={{
          padding: '1rem',
          borderRadius: '12px',
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid rgba(255, 255, 255, 0.06)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#06b6d4', fontWeight: 600, fontSize: '0.9rem' }}>
            <Utensils size={16} /> Nutrition Guidance
          </div>
          <p style={{ margin: 0, fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc' }}>
            {selectedDay.mealSummary || 'Balanced Whole Foods'}
          </p>
          <div style={{ marginTop: '0.5rem', fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            {selectedDay.loggedMeals?.length > 0
              ? `Logged: ${selectedDay.loggedMeals.map(m => m.FoodItems || m.foodItems).join(', ')} (${selectedDay.loggedMeals.reduce((acc, m) => acc + (m.Calories || m.calories || 0), 0)} kcal)`
              : 'Target macronutrient alignment'}
          </div>
        </div>
      </div>
    </div>
  );
}
