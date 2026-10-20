import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Torus, Sphere, Float, Html } from '@react-three/drei';
import CanvasErrorBoundary from './CanvasErrorBoundary';
import { Activity, Dumbbell, Droplets, Utensils, Target, TrendingUp, TrendingDown, Info } from 'lucide-react';
import './Fitness3D.css';

// 3D Core with integrated score ring and orbital category arcs
function GlobeCore({
  score = 0,
  workout = 0,
  nutrition = 0,
  hydration = 0,
  goal = 0,
  overall = 0,
  activeTooltip,
  setActiveTooltip,
  isReducedMotion
}) {
  const coreRef = useRef();
  const ringWorkoutRef = useRef();
  const ringHydrationRef = useRef();
  const ringNutritionRef = useRef();
  const ringGoalRef = useRef();

  useFrame((state, delta) => {
    if (isReducedMotion) return;
    const speed = 0.4;
    if (coreRef.current) {
      coreRef.current.rotation.y += delta * 0.3 * speed;
      coreRef.current.rotation.x += delta * 0.15 * speed;
    }
    if (ringWorkoutRef.current) ringWorkoutRef.current.rotation.z += delta * 0.35 * speed;
    if (ringHydrationRef.current) ringHydrationRef.current.rotation.y += delta * 0.3 * speed;
    if (ringNutritionRef.current) ringNutritionRef.current.rotation.x += delta * 0.25 * speed;
    if (ringGoalRef.current) ringGoalRef.current.rotation.z -= delta * 0.28 * speed;
  });

  const coreColor = useMemo(() => {
    if (score >= 75) return '#10b981'; // Emerald
    if (score >= 50) return '#06b6d4'; // Cyan
    if (score >= 30) return '#3b82f6'; // Blue
    if (score > 0) return '#f59e0b';  // Amber
    return '#64748b';                 // Muted
  }, [score]);

  return (
    <group position={[0, 0, 0]}>
      <ambientLight intensity={0.7} />
      <pointLight position={[4, 4, 4]} intensity={2.2} color={coreColor} />
      <pointLight position={[-4, -4, -3]} intensity={1.5} color="#06b6d4" />

      {/* Central Integrated Fitness Core */}
      <Float speed={isReducedMotion ? 0 : 1.5} rotationIntensity={0.2} floatIntensity={0.4}>
        <Sphere ref={coreRef} args={[0.95, 32, 32]}>
          <meshStandardMaterial
            color="#0f172a"
            emissive={coreColor}
            emissiveIntensity={Math.max(0.2, (score / 100) * 0.8)}
            wireframe
            roughness={0.3}
            metalness={0.8}
          />
        </Sphere>
      </Float>

      {/* Thin Orbit Ring 1: Workout Consistency (Emerald) */}
      <Torus
        ref={ringWorkoutRef}
        args={[1.35, 0.022, 16, 64]}
        rotation={[Math.PI / 4, 0, 0]}
        onPointerOver={() => setActiveTooltip({ title: 'Workout Consistency', value: `${workout}%` })}
        onPointerOut={() => setActiveTooltip(null)}
      >
        <meshStandardMaterial
          color="#10b981"
          emissive="#10b981"
          emissiveIntensity={activeTooltip?.title === 'Workout Consistency' ? 1.0 : 0.6}
        />
      </Torus>

      {/* Thin Orbit Ring 2: Hydration Target (Blue) */}
      <Torus
        ref={ringHydrationRef}
        args={[1.65, 0.022, 16, 64]}
        rotation={[0, Math.PI / 3, Math.PI / 6]}
        onPointerOver={() => setActiveTooltip({ title: 'Hydration Target', value: `${hydration}%` })}
        onPointerOut={() => setActiveTooltip(null)}
      >
        <meshStandardMaterial
          color="#3b82f6"
          emissive="#3b82f6"
          emissiveIntensity={activeTooltip?.title === 'Hydration Target' ? 1.0 : 0.6}
        />
      </Torus>

      {/* Thin Orbit Ring 3: Nutrition Tracking (Cyan) */}
      <Torus
        ref={ringNutritionRef}
        args={[1.95, 0.022, 16, 64]}
        rotation={[Math.PI / 3, -Math.PI / 4, 0]}
        onPointerOver={() => setActiveTooltip({ title: 'Nutrition Tracking', value: `${nutrition}%` })}
        onPointerOut={() => setActiveTooltip(null)}
      >
        <meshStandardMaterial
          color="#06b6d4"
          emissive="#06b6d4"
          emissiveIntensity={activeTooltip?.title === 'Nutrition Tracking' ? 1.0 : 0.6}
        />
      </Torus>

      {/* Thin Orbit Ring 4: Daily Goal Adherence (Purple) */}
      <Torus
        ref={ringGoalRef}
        args={[2.25, 0.022, 16, 64]}
        rotation={[-Math.PI / 4, 0, Math.PI / 3]}
        onPointerOver={() => setActiveTooltip({ title: 'Daily Goal Adherence', value: `${goal}%` })}
        onPointerOut={() => setActiveTooltip(null)}
      >
        <meshStandardMaterial
          color="#a855f7"
          emissive="#a855f7"
          emissiveIntensity={activeTooltip?.title === 'Daily Goal Adherence' ? 1.0 : 0.6}
        />
      </Torus>
    </group>
  );
}

// 2D Fallback View
function ProgressGlobe2DFallback({ score, trend, evaluation, workout, hydration, nutrition, goal, overall }) {
  return (
    <div className="fallback-2d-container" style={{ padding: '1.25rem' }}>
      <div
        className="fallback-ring-outer"
        style={{
          width: '130px',
          height: '130px',
          background: `conic-gradient(#10b981 ${score * 3.6}deg, rgba(255, 255, 255, 0.06) 0deg)`
        }}
      >
        <div className="fallback-ring-inner" style={{ width: '100px', height: '100px' }}>
          <span style={{ fontSize: '1.8rem', fontWeight: 800, color: '#f8fafc', lineHeight: 1 }}>
            {score}
          </span>
          <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
            Score / 100
          </span>
        </div>
      </div>
      <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
        <div style={{ fontWeight: 600, fontSize: '0.95rem', color: '#10b981' }}>{evaluation}</div>
        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
          {trend !== null ? `${trend >= 0 ? '+' : ''}${trend} from last week` : 'Building baseline'}
        </div>
      </div>
    </div>
  );
}

export default function ProgressIntelligenceGlobe({
  personalScore = {},
  progressIntelligence = {},
  force2D = false
}) {
  const [mode2D, setMode2D] = useState(force2D);
  const [activeTooltip, setActiveTooltip] = useState(null);

  const score = personalScore?.score ?? 0;
  const evaluation = personalScore?.evaluation || 'Building Habits';
  const trend = personalScore?.trend ?? null;
  const hasData = personalScore?.hasEnoughData ?? personalScore?.hasData ?? (score > 0);

  const {
    workoutConsistency = 0,
    hydrationConsistency = 0,
    nutritionConsistency = 0,
    goalProgress = 0,
    overallConsistency = 0
  } = progressIntelligence || {};

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
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={18} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.05rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              Progress Intelligence Globe
              <span className="intel-badge intel-badge-emerald">{evaluation}</span>
            </h3>
            <p style={{ margin: 0, fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Holistic biometric consistency index synthesized with 3D orbital status rings.
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
            3D Globe
          </button>
          <button
            type="button"
            className={`performance-toggle-btn ${mode2D ? 'active' : ''}`}
            onClick={() => setMode2D(true)}
            style={{ padding: '0.35rem 0.75rem', fontSize: '0.78rem' }}
          >
            2D Mode
          </button>
        </div>
      </div>

      {/* Main Visualizer Container */}
      <div className="canvas-wrapper score-hero" style={{ minHeight: '280px' }}>
        {/* Left Side: 3D Globe with Integrated Central Score */}
        <div style={{ position: 'relative', width: '100%', minHeight: '280px' }}>
          {mode2D ? (
            <ProgressGlobe2DFallback
              score={score}
              trend={trend}
              evaluation={evaluation}
              workout={workoutConsistency}
              hydration={hydrationConsistency}
              nutrition={nutritionConsistency}
              goal={goalProgress}
              overall={overallConsistency}
            />
          ) : (
            <CanvasErrorBoundary
              fallback={
                <ProgressGlobe2DFallback
                  score={score}
                  trend={trend}
                  evaluation={evaluation}
                  workout={workoutConsistency}
                  hydration={hydrationConsistency}
                  nutrition={nutritionConsistency}
                  goal={goalProgress}
                  overall={overallConsistency}
                />
              }
            >
              <Canvas
                camera={{ position: [0, 0, 4.2], fov: 45 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                style={{ width: '100%', height: '100%', minHeight: '280px' }}
              >
                <GlobeCore
                  score={score}
                  workout={workoutConsistency}
                  nutrition={nutritionConsistency}
                  hydration={hydrationConsistency}
                  goal={goalProgress}
                  overall={overallConsistency}
                  activeTooltip={activeTooltip}
                  setActiveTooltip={setActiveTooltip}
                />
              </Canvas>
              <div className="canvas-controls-hint" style={{ bottom: '0.5rem', right: '0.75rem' }}>
                Hover rings for category metrics
              </div>
            </CanvasErrorBoundary>
          )}

          {/* Central Fitness Score Floating Readout */}
          <div style={{
            position: 'absolute',
            bottom: '0.85rem',
            left: '0.85rem',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '0.55rem 0.9rem',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#10b981', lineHeight: 1 }}>
              {score}
              <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>/100</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Fitness Score
              </span>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, color: '#f8fafc', display: 'flex', alignItems: 'center', gap: '0.2rem' }}>
                {trend !== null ? (
                  trend >= 0 ? (
                    <><TrendingUp size={13} color="#10b981" /> +{trend} from last week</>
                  ) : (
                    <><TrendingDown size={13} color="#f59e0b" /> {trend} from last week</>
                  )
                ) : (
                  <span style={{ color: 'var(--text-muted)', fontSize: '0.72rem' }}>
                    {hasData ? 'Current 7-day baseline' : 'Not enough historical data yet'}
                  </span>
                )}
              </span>
            </div>
          </div>

          {/* Interactive Category Tooltip */}
          {activeTooltip && (
            <div style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(15, 23, 42, 0.9)',
              backdropFilter: 'blur(8px)',
              padding: '0.45rem 0.75rem',
              borderRadius: '8px',
              border: '1px solid #10b981',
              color: '#f8fafc',
              fontSize: '0.8rem',
              fontWeight: 600,
              pointerEvents: 'none'
            }}>
              {activeTooltip.title}: <span style={{ color: '#10b981' }}>{activeTooltip.value}</span>
            </div>
          )}
        </div>

        {/* Right Side: Category Progress Breakdown */}
        <div style={{
          padding: '1.25rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '0.85rem',
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <h4 style={{ fontSize: '0.85rem', fontWeight: 600, color: '#f8fafc', margin: 0 }}>
            Consistency Breakdown
          </h4>

          <div className="factor-breakdown-list" style={{ gap: '0.65rem' }}>
            <div className="factor-item">
              <div className="factor-label-row">
                <span style={{ color: '#10b981', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Dumbbell size={13} /> Workouts
                </span>
                <span style={{ fontSize: '0.78rem' }}>{workoutConsistency}%</span>
              </div>
              <div className="factor-bar-track" style={{ height: '6px' }}>
                <div className="factor-bar-fill" style={{ width: `${workoutConsistency}%`, background: '#10b981' }} />
              </div>
            </div>

            <div className="factor-item">
              <div className="factor-label-row">
                <span style={{ color: '#3b82f6', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Droplets size={13} /> Hydration
                </span>
                <span style={{ fontSize: '0.78rem' }}>{hydrationConsistency}%</span>
              </div>
              <div className="factor-bar-track" style={{ height: '6px' }}>
                <div className="factor-bar-fill" style={{ width: `${hydrationConsistency}%`, background: '#3b82f6' }} />
              </div>
            </div>

            <div className="factor-item">
              <div className="factor-label-row">
                <span style={{ color: '#06b6d4', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Utensils size={13} /> Nutrition
                </span>
                <span style={{ fontSize: '0.78rem' }}>{nutritionConsistency}%</span>
              </div>
              <div className="factor-bar-track" style={{ height: '6px' }}>
                <div className="factor-bar-fill" style={{ width: `${nutritionConsistency}%`, background: '#06b6d4' }} />
              </div>
            </div>

            <div className="factor-item">
              <div className="factor-label-row">
                <span style={{ color: '#a855f7', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Target size={13} /> Daily Goal
                </span>
                <span style={{ fontSize: '0.78rem' }}>{goalProgress}%</span>
              </div>
              <div className="factor-bar-track" style={{ height: '6px' }}>
                <div className="factor-bar-fill" style={{ width: `${goalProgress}%`, background: '#a855f7' }} />
              </div>
            </div>
          </div>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0.5rem 0.75rem',
            background: 'rgba(255,255,255,0.03)',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.06)',
            marginTop: '0.25rem'
          }}>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Overall Consistency</span>
            <span style={{ fontSize: '0.95rem', fontWeight: 700, color: '#10b981' }}>{overallConsistency}%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
