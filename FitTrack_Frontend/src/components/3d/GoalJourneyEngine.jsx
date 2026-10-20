import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Box, Cylinder, Sphere, Float } from '@react-three/drei';
import CanvasErrorBoundary from './CanvasErrorBoundary';
import { Compass, CheckCircle2, Circle, Flame, Dumbbell, Droplets, ArrowRight } from 'lucide-react';
import './Fitness3D.css';

// 3D Runway with smooth eased progress beacon
function RunwayScene({ progress = 0, milestones = [], isReducedMotion }) {
  const markerRef = useRef();
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const targetX = -2.8 + (clampedProgress / 100) * 5.6;

  // Smooth realistic easing towards targetX
  useFrame((state, delta) => {
    if (markerRef.current) {
      if (isReducedMotion) {
        markerRef.current.position.x = targetX;
      } else {
        markerRef.current.position.x += (targetX - markerRef.current.position.x) * (delta * 3.5);
      }
      markerRef.current.rotation.y += delta * 1.2;
    }
  });

  return (
    <group position={[0, -0.4, 0]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[0, 5, 4]} intensity={1.2} />
      <pointLight position={[targetX, 1.2, 0]} intensity={2.5} color="#10b981" />

      {/* Runway track base */}
      <Box args={[6.6, 0.1, 1.2]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
      </Box>

      {/* Track center glow line */}
      <Box args={[6.2, 0.02, 0.06]} position={[0, 0.02, 0]}>
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.8} />
      </Box>

      {/* Milestone Pedestals at 25%, 50%, 75%, 100% */}
      {milestones && milestones.map((m, idx) => {
        const threshold = m.threshold ?? m.percent ?? 25;
        const isAchieved = m.achieved ?? m.isAchieved ?? false;
        const pedX = -2.8 + (threshold / 100) * 5.6;

        return (
          <group key={idx} position={[pedX, 0.18, 0]}>
            <Cylinder args={[0.18, 0.22, 0.35, 16]}>
              <meshStandardMaterial
                color={isAchieved ? '#10b981' : '#334155'}
                emissive={isAchieved ? '#059669' : '#1e293b'}
                emissiveIntensity={isAchieved ? 0.8 : 0.2}
                roughness={0.25}
              />
            </Cylinder>
            <Float speed={isAchieved ? 2 : 0} rotationIntensity={0.3} floatIntensity={0.2}>
              <Sphere args={[0.09, 16, 16]} position={[0, 0.3, 0]}>
                <meshStandardMaterial
                  color={isAchieved ? '#34d399' : '#64748b'}
                  emissive={isAchieved ? '#10b981' : '#334155'}
                  emissiveIntensity={isAchieved ? 1.0 : 0.1}
                />
              </Sphere>
            </Float>
          </group>
        );
      })}

      {/* Eased 3D Progress Marker */}
      <group position={[-2.8, 0.48, 0]} ref={markerRef}>
        <Sphere args={[0.22, 24, 24]}>
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={1.2}
            roughness={0.15}
            metalness={0.85}
          />
        </Sphere>
      </group>
    </group>
  );
}

// 2D Accessible / Mobile Fallback
function GoalJourney2DFallback({ progress, calorieCurrent, calorieTarget, isCompleted }) {
  return (
    <div style={{ padding: '1.5rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontWeight: 600, fontSize: '0.9rem' }}>
        <span style={{ color: 'var(--text-secondary)' }}>Today's Goal Trajectory</span>
        <span style={{ color: isCompleted ? '#10b981' : '#38bdf8' }}>{progress}% Completed</span>
      </div>
      <div className="factor-bar-track" style={{ height: '10px' }}>
        <div
          className="factor-bar-fill"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #06b6d4 0%, #10b981 100%)'
          }}
        />
      </div>
    </div>
  );
}

export default function GoalJourneyEngine({ goalJourney = {}, force2D = false }) {
  const [mode2D, setMode2D] = useState(force2D);

  const {
    hasActiveGoal = false,
    goalId = 0,
    calorieTarget = 2000,
    calorieCurrent = 0,
    workoutTarget = 45,
    workoutCurrent = 0,
    waterTarget = 2500,
    waterCurrent = 0,
    overallProgressPercentage = 0,
    isCompleted = false,
    milestones = [
      { threshold: 25, label: 'Quarter Pace', achieved: false },
      { threshold: 50, label: 'Halfway Mark', achieved: false },
      { threshold: 75, label: 'Final Stretch', achieved: false },
      { threshold: 100, label: 'Goal Completed', achieved: false }
    ]
  } = goalJourney || {};

  const remainingCalories = Math.max(0, calorieTarget - calorieCurrent);

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header bar */}
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
            background: 'rgba(234, 179, 8, 0.15)',
            color: '#eab308',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Compass size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Goal Journey Engine
              {isCompleted ? (
                <span className="intel-badge intel-badge-emerald">All Goals Achieved!</span>
              ) : (
                <span className="intel-badge intel-badge-gold">{overallProgressPercentage}% Complete</span>
              )}
            </h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Real-time progress runway toward today's verified biometric targets.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <button
            type="button"
            className={`performance-toggle-btn ${!mode2D ? 'active' : ''}`}
            onClick={() => setMode2D(false)}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
          >
            3D Runway
          </button>
          <button
            type="button"
            className={`performance-toggle-btn ${mode2D ? 'active' : ''}`}
            onClick={() => setMode2D(true)}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
          >
            2D Track
          </button>
        </div>
      </div>

      {/* 3D Runway or 2D Progress */}
      <div className="canvas-wrapper" style={{ height: '210px' }}>
        {mode2D ? (
          <GoalJourney2DFallback
            progress={overallProgressPercentage}
            calorieCurrent={calorieCurrent}
            calorieTarget={calorieTarget}
            isCompleted={isCompleted}
          />
        ) : (
          <CanvasErrorBoundary
            fallback={
              <GoalJourney2DFallback
                progress={overallProgressPercentage}
                calorieCurrent={calorieCurrent}
                calorieTarget={calorieTarget}
                isCompleted={isCompleted}
              />
            }
          >
            <Canvas
              camera={{ position: [0, 2.4, 4.8], fov: 42 }}
              gl={{ antialias: true, alpha: true }}
              style={{ width: '100%', height: '100%' }}
            >
              <RunwayScene
                progress={overallProgressPercentage}
                milestones={milestones}
              />
            </Canvas>
            <div className="canvas-controls-hint" style={{ bottom: '0.5rem', right: '0.75rem' }}>
              3D Milestone Runway • Cyan Beacon at {overallProgressPercentage}%
            </div>
          </CanvasErrorBoundary>
        )}
      </div>

      {/* Milestone Strip & Real Metric Numbers */}
      <div style={{ padding: '1rem 1.25rem', background: 'rgba(255, 255, 255, 0.015)' }}>
        <div className="milestones-strip" style={{ marginTop: 0, gap: '0.5rem' }}>
          {milestones.map((m, idx) => {
            const threshold = m.threshold ?? m.percent ?? 25;
            const isAchieved = m.achieved ?? m.isAchieved ?? false;
            const label = m.label ?? m.title ?? `${threshold}% Mark`;

            return (
              <div
                key={threshold || idx}
                className={`milestone-card ${isAchieved ? 'achieved' : ''}`}
                style={{ padding: '0.65rem 0.75rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.75rem', fontWeight: 700, color: isAchieved ? '#10b981' : 'var(--text-muted)' }}>
                    {threshold}%
                  </span>
                  {isAchieved ? (
                    <CheckCircle2 size={14} color="#10b981" />
                  ) : (
                    <Circle size={14} color="var(--text-muted)" />
                  )}
                </div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#f8fafc', marginTop: '2px' }}>
                  {label}
                </span>
                <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)' }}>
                  {isAchieved ? 'Cleared' : 'Pending'}
                </span>
              </div>
            );
          })}
        </div>

        {/* 3 Metric Target Gauges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '0.85rem',
          marginTop: '1rem',
          paddingTop: '0.85rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Calorie Burned */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#10b981', fontWeight: 600 }}>
                <Flame size={13} /> Active Burn
              </span>
              <span>{calorieCurrent} / {calorieTarget} kcal</span>
            </div>
            <div className="factor-bar-track" style={{ height: '6px' }}>
              <div
                className="factor-bar-fill"
                style={{
                  width: `${Math.min(100, Math.round((calorieCurrent / Math.max(1, calorieTarget)) * 100))}%`,
                  background: '#10b981'
                }}
              />
            </div>
          </div>

          {/* Workout Minutes */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#a855f7', fontWeight: 600 }}>
                <Dumbbell size={13} /> Active Minutes
              </span>
              <span>{workoutCurrent} / {workoutTarget} min</span>
            </div>
            <div className="factor-bar-track" style={{ height: '6px' }}>
              <div
                className="factor-bar-fill"
                style={{
                  width: `${Math.min(100, Math.round((workoutCurrent / Math.max(1, workoutTarget)) * 100))}%`,
                  background: '#a855f7'
                }}
              />
            </div>
          </div>

          {/* Water Intake */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', color: '#3b82f6', fontWeight: 600 }}>
                <Droplets size={13} /> Water Intake
              </span>
              <span>{waterCurrent} / {waterTarget} ml</span>
            </div>
            <div className="factor-bar-track" style={{ height: '6px' }}>
              <div
                className="factor-bar-fill"
                style={{
                  width: `${Math.min(100, Math.round((waterCurrent / Math.max(1, waterTarget)) * 100))}%`,
                  background: '#3b82f6'
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
