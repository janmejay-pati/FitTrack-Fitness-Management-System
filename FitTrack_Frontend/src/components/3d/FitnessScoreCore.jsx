import React, { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial, Sphere, Torus, Html } from '@react-three/drei';
import CanvasErrorBoundary from './CanvasErrorBoundary';
import { Award, Zap, TrendingUp, TrendingDown, Info, RotateCcw } from 'lucide-react';
import './Fitness3D.css';

// 3D Core Sphere & Factor Rings inside Canvas
function CoreOrb({ score, factors, activeFactor, setActiveFactor, isReducedMotion }) {
  const coreRef = useRef();
  const ring1Ref = useRef();
  const ring2Ref = useRef();
  const ring3Ref = useRef();

  // Color selection based on real score
  const coreColor = useMemo(() => {
    if (score >= 80) return '#10b981'; // Emerald
    if (score >= 60) return '#06b6d4'; // Cyan
    if (score >= 40) return '#3b82f6'; // Blue
    if (score > 0) return '#f59e0b';  // Amber
    return '#64748b';                 // Muted Gray
  }, [score]);

  const emissiveColor = useMemo(() => {
    if (score >= 80) return '#059669';
    if (score >= 60) return '#0891b2';
    if (score >= 40) return '#2563eb';
    if (score > 0) return '#d97706';
    return '#475569';
  }, [score]);

  useFrame((state, delta) => {
    if (isReducedMotion) return;
    const speed = 0.5 + (score / 100) * 0.8;
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.4 * speed;
      coreRef.current.rotation.x += delta * 0.2 * speed;
    }
    if (ring1Ref.current) {
      ring1Ref.current.rotation.x += delta * 0.3 * speed;
      ring1Ref.current.rotation.y += delta * 0.2 * speed;
    }
    if (ring2Ref.current) {
      ring2Ref.current.rotation.y -= delta * 0.35 * speed;
      ring2Ref.current.rotation.z += delta * 0.25 * speed;
    }
    if (ring3Ref.current) {
      ring3Ref.current.rotation.z += delta * 0.2 * speed;
      ring3Ref.current.rotation.x -= delta * 0.15 * speed;
    }
  });

  return (
    <group>
      {/* 3D Ambient & Directional Lighting */}
      <ambientLight intensity={0.7} />
      <pointLight position={[5, 5, 5]} intensity={2.5} color={coreColor} />
      <pointLight position={[-5, -5, -3]} intensity={1.5} color="#06b6d4" />

      {/* Outer Ring - Workout & Activity */}
      <Torus 
        ref={ring1Ref} 
        args={[2.2, 0.04, 24, 80]}
        onClick={() => setActiveFactor('workout')}
      >
        <meshStandardMaterial 
          color="#10b981" 
          emissive="#10b981" 
          emissiveIntensity={activeFactor === 'workout' ? 0.9 : 0.4} 
          roughness={0.2}
          metalness={0.8}
        />
      </Torus>

      {/* Middle Ring - Nutrition & Fuel */}
      <Torus 
        ref={ring2Ref} 
        args={[1.75, 0.035, 24, 80]} 
        rotation={[Math.PI / 4, Math.PI / 6, 0]}
        onClick={() => setActiveFactor('nutrition')}
      >
        <meshStandardMaterial 
          color="#06b6d4" 
          emissive="#06b6d4" 
          emissiveIntensity={activeFactor === 'nutrition' ? 0.9 : 0.4} 
          roughness={0.2}
          metalness={0.8}
        />
      </Torus>

      {/* Inner Ring - Hydration & Goals */}
      <Torus 
        ref={ring3Ref} 
        args={[1.35, 0.03, 24, 80]} 
        rotation={[-Math.PI / 3, 0, Math.PI / 4]}
        onClick={() => setActiveFactor('hydration')}
      >
        <meshStandardMaterial 
          color="#3b82f6" 
          emissive="#3b82f6" 
          emissiveIntensity={activeFactor === 'hydration' ? 0.9 : 0.4} 
          roughness={0.2}
          metalness={0.8}
        />
      </Torus>

      {/* Pulsing Core Sphere */}
      <Float speed={isReducedMotion ? 0 : 2} rotationIntensity={0.4} floatIntensity={0.8}>
        <Sphere ref={coreRef} args={[0.92, 48, 48]}>
          <MeshDistortMaterial
            color={coreColor}
            emissive={emissiveColor}
            emissiveIntensity={score > 0 ? 0.5 : 0.2}
            distort={score > 0 ? 0.3 : 0.08}
            speed={isReducedMotion ? 0 : 1.8}
            roughness={0.15}
            metalness={0.85}
          />
        </Sphere>
      </Float>
    </group>
  );
}

// 2D Fallback Ring
function Fallback2DScore({ score, evaluation, trend }) {
  const percent = Math.min(100, Math.max(0, score));
  return (
    <div className="fallback-2d-container">
      <div 
        className="fallback-ring-outer"
        style={{
          background: `conic-gradient(#10b981 ${percent * 3.6}deg, rgba(255, 255, 255, 0.06) 0deg)`
        }}
      >
        <div className="fallback-ring-inner">
          <span style={{ fontSize: '2.5rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', marginTop: '4px' }}>
            Score / 100
          </span>
        </div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 600, fontSize: '1.1rem', color: '#10b981' }}>{evaluation}</div>
        <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
          {trend !== null && trend !== undefined
            ? `${trend >= 0 ? '+' : ''}${trend} pts vs previous 7-day period`
            : 'Building initial activity baseline'}
        </div>
      </div>
    </div>
  );
}

export default function FitnessScoreCore({ personalScore, force2D = false }) {
  const [activeFactor, setActiveFactor] = useState(null);
  const [mode2D, setMode2D] = useState(force2D);

  const breakdown = personalScore?.breakdown || {};
  const score = personalScore?.score ?? 0;
  const workoutScore = breakdown.workoutConsistency ?? personalScore?.workoutScore ?? 0;
  const nutritionScore = breakdown.nutritionConsistency ?? personalScore?.nutritionScore ?? 0;
  const hydrationScore = breakdown.hydrationConsistency ?? personalScore?.hydrationScore ?? 0;
  const goalScore = breakdown.goalAdherence ?? personalScore?.goalScore ?? 0;
  const streakScore = breakdown.streakAndBiometrics ?? personalScore?.streakScore ?? 0;
  const evaluation = personalScore?.evaluation || 'Calibrating Baseline';
  const trend = personalScore?.trend ?? null;
  const hasData = personalScore?.hasEnoughData ?? personalScore?.hasData ?? (score > 0);

  const factors = [
    { key: 'workout', label: 'Workout Volume', score: workoutScore, weight: '30%', color: '#10b981' },
    { key: 'nutrition', label: 'Nutrition & Macros', score: nutritionScore, weight: '25%', color: '#06b6d4' },
    { key: 'hydration', label: 'Hydration Target', score: hydrationScore, weight: '20%', color: '#3b82f6' },
    { key: 'goal', label: 'Daily Goal Progress', score: goalScore, weight: '15%', color: '#8b5cf6' },
    { key: 'streak', label: 'Habit Consistency', score: streakScore, weight: '10%', color: '#f59e0b' }
  ];

  return (
    <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
      {/* Header bar */}
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
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Zap size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Personal Fitness Intelligence Core
              <span className="intel-badge intel-badge-emerald">{evaluation}</span>
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Deterministic multi-factor fitness index dynamically synthesized from your logged workouts, meals, water & goals.
            </p>
          </div>
        </div>

        {/* 2D / 3D Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className={`performance-toggle-btn ${!mode2D ? 'active' : ''}`}
            onClick={() => setMode2D(false)}
            title="Interactive 3D Energy Core"
          >
            3D View
          </button>
          <button
            type="button"
            className={`performance-toggle-btn ${mode2D ? 'active' : ''}`}
            onClick={() => setMode2D(true)}
            title="Lightweight 2D Mode"
          >
            2D Mode
          </button>
        </div>
      </div>

      {/* Main Core Body */}
      <div className="canvas-wrapper score-hero">
        {/* Left Side: 3D Canvas or 2D Ring */}
        <div style={{ position: 'relative', width: '100%', minHeight: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          {mode2D ? (
            <Fallback2DScore score={score} evaluation={evaluation} trend={trend} />
          ) : (
            <CanvasErrorBoundary fallback={<Fallback2DScore score={score} evaluation={evaluation} trend={trend} />}>
              <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                style={{ width: '100%', height: '100%', minHeight: '380px' }}
              >
                <CoreOrb
                  score={score}
                  factors={factors}
                  activeFactor={activeFactor}
                  setActiveFactor={setActiveFactor}
                />
              </Canvas>
              <div className="canvas-controls-hint">
                Interactive 3D Core • Reflects Real Activity
              </div>
            </CanvasErrorBoundary>
          )}

          {/* Central Score Floating Badge */}
          <div style={{
            position: 'absolute',
            bottom: '1.25rem',
            left: '1.25rem',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(10px)',
            padding: '0.75rem 1.1rem',
            borderRadius: '12px',
            border: '1px solid rgba(255, 255, 255, 0.12)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.85rem'
          }}>
            <div style={{ fontSize: '2.2rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
              {score}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Fitness Index
              </span>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                {trend !== null ? (
                  trend >= 0 ? (
                    <><TrendingUp size={14} color="#10b981" /> +{trend} pts vs last wk</>
                  ) : (
                    <><TrendingDown size={14} color="#f59e0b" /> {trend} pts vs last wk</>
                  )
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>
                    {hasData ? 'Current 7-day baseline' : 'Not enough historical data yet'}
                  </span>
                )}
              </span>
            </div>
          </div>
        </div>

        {/* Right Side: Factor Breakdown Panel */}
        <div style={{
          padding: '1.75rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '1.25rem',
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.015)'
        }}>
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.25rem' }}>
              Mathematical Score Breakdown
            </h4>
            <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Computed solely from verified database records over the rolling 7-day window.
            </p>
          </div>

          <div className="factor-breakdown-list">
            {factors.map(item => (
              <div 
                key={item.key} 
                className="factor-item"
                style={{
                  cursor: 'pointer',
                  padding: '0.35rem 0.5rem',
                  borderRadius: '6px',
                  background: activeFactor === item.key ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
                  transition: 'background 0.2s ease'
                }}
                onMouseEnter={() => setActiveFactor(item.key)}
                onMouseLeave={() => setActiveFactor(null)}
              >
                <div className="factor-label-row">
                  <span style={{ color: item.color, fontWeight: 600 }}>{item.label}</span>
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                    {item.score}% <span style={{ opacity: 0.6 }}>({item.weight} weight)</span>
                  </span>
                </div>
                <div className="factor-bar-track">
                  <div
                    className="factor-bar-fill"
                    style={{
                      width: `${item.score}%`,
                      background: item.color
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          {!hasData && (
            <div style={{
              padding: '0.65rem 0.85rem',
              background: 'rgba(234, 179, 8, 0.1)',
              border: '1px solid rgba(234, 179, 8, 0.25)',
              borderRadius: '8px',
              fontSize: '0.78rem',
              color: '#fbbf24',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}>
              <Info size={16} />
              <span>Not enough historical data yet. Log workouts, meals, or water to elevate your score!</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
