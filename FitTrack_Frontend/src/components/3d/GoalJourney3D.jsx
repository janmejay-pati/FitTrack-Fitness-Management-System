import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Cylinder, Sphere, Float, Box } from '@react-three/drei';
import CanvasErrorBoundary from './CanvasErrorBoundary';
import { Compass, CheckCircle2, Circle, Flame, Dumbbell, Droplets } from 'lucide-react';
import './Fitness3D.css';

function JourneyRunway({ progress, milestones, isReducedMotion }) {
  const runnerRef = useRef();

  // Position between -3.0 (0%) and +3.0 (100%)
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const runnerX = -3.0 + (clampedProgress / 100) * 6.0;

  useFrame((state, delta) => {
    if (isReducedMotion) return;
    if (runnerRef.current) {
      runnerRef.current.rotation.y += delta * 1.5;
    }
  });

  return (
    <group position={[0, -0.5, 0]}>
      <ambientLight intensity={0.6} />
      <directionalLight position={[0, 5, 3]} intensity={1.2} />
      <pointLight position={[runnerX, 1.2, 0]} intensity={3} color="#10b981" />

      {/* Runway track base */}
      <Box args={[7.2, 0.1, 1.4]} position={[0, -0.05, 0]}>
        <meshStandardMaterial color="#0f172a" roughness={0.3} metalness={0.7} />
      </Box>

      {/* Track center glow line */}
      <Box args={[6.8, 0.02, 0.08]} position={[0, 0.02, 0]}>
        <meshStandardMaterial color="#38bdf8" emissive="#38bdf8" emissiveIntensity={0.8} />
      </Box>

      {/* Milestone Pedestals at 25%, 50%, 75%, 100% */}
      {milestones && milestones.map((m, idx) => {
        const threshold = m.threshold ?? m.percent ?? 25;
        const isAchieved = m.achieved ?? m.isAchieved ?? false;
        const pedX = -3.0 + (threshold / 100) * 6.0;
        return (
          <group key={idx} position={[pedX, 0.2, 0]}>
            {/* Cylinder pedestal */}
            <Cylinder args={[0.22, 0.28, 0.4, 16]}>
              <meshStandardMaterial
                color={isAchieved ? '#10b981' : '#334155'}
                emissive={isAchieved ? '#059669' : '#1e293b'}
                emissiveIntensity={isAchieved ? 0.8 : 0.2}
                roughness={0.2}
              />
            </Cylinder>
            {/* Floating milestone gem */}
            <Float speed={2} rotationIntensity={0.5} floatIntensity={0.3}>
              <Sphere args={[0.12, 16, 16]} position={[0, 0.4, 0]}>
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

      {/* User Progress Beacon Orb */}
      <group position={[runnerX, 0.55, 0]} ref={runnerRef}>
        <Sphere args={[0.26, 32, 32]}>
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={1.2}
            roughness={0.1}
            metalness={0.9}
          />
        </Sphere>
      </group>
    </group>
  );
}

function Fallback2DJourney({ progress, milestones }) {
  return (
    <div style={{ padding: '2rem 1.5rem', width: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', fontWeight: 600 }}>
        <span>Current Journey Progress</span>
        <span style={{ color: '#10b981' }}>{progress}%</span>
      </div>
      <div className="factor-bar-track" style={{ height: '14px' }}>
        <div className="factor-bar-fill" style={{ width: `${progress}%`, background: 'linear-gradient(90deg, #06b6d4 0%, #10b981 100%)' }} />
      </div>
    </div>
  );
}

export default function GoalJourney3D({ goalJourney, force2D = false }) {
  const [mode2D, setMode2D] = useState(force2D);

  const {
    hasActiveGoal = false,
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
            background: 'rgba(234, 179, 8, 0.15)',
            color: '#eab308',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Compass size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Goal Journey Engine
              {isCompleted ? (
                <span className="intel-badge intel-badge-emerald">All Goals Achieved!</span>
              ) : (
                <span className="intel-badge intel-badge-gold">{overallProgressPercentage}% Complete</span>
              )}
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-time trajectory tracking toward today's verified biometric targets.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className={`performance-toggle-btn ${!mode2D ? 'active' : ''}`}
            onClick={() => setMode2D(false)}
          >
            3D Runway
          </button>
          <button
            type="button"
            className={`performance-toggle-btn ${mode2D ? 'active' : ''}`}
            onClick={() => setMode2D(true)}
          >
            2D Track
          </button>
        </div>
      </div>

      {/* 3D Runway or 2D progress */}
      <div className="canvas-wrapper" style={{ height: '260px' }}>
        {mode2D ? (
          <Fallback2DJourney progress={overallProgressPercentage} milestones={milestones} />
        ) : (
          <CanvasErrorBoundary fallback={<Fallback2DJourney progress={overallProgressPercentage} milestones={milestones} />}>
            <Canvas
              camera={{ position: [0, 2.8, 5.5], fov: 42 }}
              gl={{ antialias: true, alpha: true }}
              style={{ width: '100%', height: '100%' }}
            >
              <JourneyRunway
                progress={overallProgressPercentage}
                milestones={milestones}
              />
            </Canvas>
            <div className="canvas-controls-hint">
              3D Milestone Pedestals • Cyan Beacon = Current Progress ({overallProgressPercentage}%)
            </div>
          </CanvasErrorBoundary>
        )}
      </div>

      {/* Milestone Cards & Target Breakdowns */}
      <div style={{ padding: '1.25rem 1.5rem', background: 'rgba(255, 255, 255, 0.015)' }}>
        {/* Milestones Strip */}
        <div className="milestones-strip">
          {milestones.map((m, idx) => {
            const threshold = m.threshold ?? m.percent ?? 25;
            const isAchieved = m.achieved ?? m.isAchieved ?? false;
            const label = m.label ?? m.title ?? `${threshold}% Milestone`;
            return (
              <div
                key={threshold || idx}
                className={`milestone-card ${isAchieved ? 'achieved' : ''} ${
                  !isAchieved && overallProgressPercentage < threshold && overallProgressPercentage >= (threshold - 25)
                    ? 'current'
                    : ''
                }`}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 700, color: isAchieved ? '#10b981' : 'var(--text-muted)' }}>
                    {threshold}%
                  </span>
                  {isAchieved ? (
                    <CheckCircle2 size={16} color="#10b981" />
                  ) : (
                    <Circle size={16} color="var(--text-muted)" />
                  )}
                </div>
                <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc' }}>{label}</span>
                <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                  {isAchieved ? 'Milestone Cleared' : 'In Progress'}
                </span>
              </div>
            );
          })}
        </div>

        {/* 3 Metric Target Progress Gauges */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginTop: '1.25rem',
          paddingTop: '1.25rem',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          {/* Calorie Burned */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#10b981', fontWeight: 600 }}>
                <Flame size={14} /> Active Burn
              </span>
              <span>{calorieCurrent} / {calorieTarget} kcal</span>
            </div>
            <div className="factor-bar-track">
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#a855f7', fontWeight: 600 }}>
                <Dumbbell size={14} /> Active Minutes
              </span>
              <span>{workoutCurrent} / {workoutTarget} min</span>
            </div>
            <div className="factor-bar-track">
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
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', color: '#3b82f6', fontWeight: 600 }}>
                <Droplets size={14} /> Water Intake
              </span>
              <span>{waterCurrent} / {waterTarget} ml</span>
            </div>
            <div className="factor-bar-track">
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
