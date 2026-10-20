import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Torus, Sphere, Float } from '@react-three/drei';
import CanvasErrorBoundary from './CanvasErrorBoundary';
import { Activity, Dumbbell, Droplets, Utensils, Target } from 'lucide-react';
import './Fitness3D.css';

function GlobeRings({ workout, hydration, nutrition, goal, overall, isReducedMotion }) {
  const globeRef = useRef();
  const ring1 = useRef();
  const ring2 = useRef();
  const ring3 = useRef();
  const ring4 = useRef();

  useFrame((state, delta) => {
    if (isReducedMotion) return;
    if (globeRef.current) {
      globeRef.current.rotation.y += delta * 0.25;
      globeRef.current.rotation.x += delta * 0.1;
    }
    if (ring1.current) ring1.current.rotation.z += delta * 0.4;
    if (ring2.current) ring2.current.rotation.y += delta * 0.35;
    if (ring3.current) ring3.current.rotation.x += delta * 0.3;
    if (ring4.current) ring4.current.rotation.z -= delta * 0.3;
  });

  return (
    <group>
      <ambientLight intensity={0.6} />
      <pointLight position={[5, 5, 5]} intensity={2} color="#10b981" />
      <pointLight position={[-5, -5, -3]} intensity={1.5} color="#3b82f6" />

      {/* Central Consistency Core Sphere */}
      <Float speed={isReducedMotion ? 0 : 1.5} rotationIntensity={0.3} floatIntensity={0.5}>
        <Sphere ref={globeRef} args={[1.0, 32, 32]}>
          <meshStandardMaterial
            color="#0f172a"
            emissive="#10b981"
            emissiveIntensity={Math.max(0.1, overall / 200)}
            wireframe
            roughness={0.4}
          />
        </Sphere>
      </Float>

      {/* Ring 1: Workout (Emerald) */}
      <Torus ref={ring1} args={[1.4, 0.035, 16, 64]} rotation={[Math.PI / 6, 0, 0]}>
        <meshStandardMaterial color="#10b981" emissive="#10b981" emissiveIntensity={0.6} />
      </Torus>

      {/* Ring 2: Hydration (Blue) */}
      <Torus ref={ring2} args={[1.7, 0.035, 16, 64]} rotation={[0, Math.PI / 4, Math.PI / 4]}>
        <meshStandardMaterial color="#3b82f6" emissive="#3b82f6" emissiveIntensity={0.6} />
      </Torus>

      {/* Ring 3: Nutrition (Cyan) */}
      <Torus ref={ring3} args={[2.0, 0.035, 16, 64]} rotation={[Math.PI / 3, Math.PI / 3, 0]}>
        <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={0.6} />
      </Torus>

      {/* Ring 4: Daily Goal (Purple) */}
      <Torus ref={ring4} args={[2.3, 0.035, 16, 64]} rotation={[-Math.PI / 4, 0, Math.PI / 6]}>
        <meshStandardMaterial color="#a855f7" emissive="#a855f7" emissiveIntensity={0.6} />
      </Torus>
    </group>
  );
}

function Fallback2DGlobe({ workout, hydration, nutrition, goal, overall }) {
  return (
    <div className="fallback-2d-container">
      <div className="fallback-ring-outer" style={{
        background: `conic-gradient(#10b981 ${overall * 3.6}deg, rgba(255, 255, 255, 0.06) 0deg)`
      }}>
        <div className="fallback-ring-inner">
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#10b981' }}>{overall}%</span>
          <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Consistency</span>
        </div>
      </div>
    </div>
  );
}

export default function ProgressGlobe({ progressIntelligence, force2D = false }) {
  const [mode2D, setMode2D] = useState(force2D);

  const {
    workoutConsistency = 0,
    hydrationConsistency = 0,
    nutritionConsistency = 0,
    goalProgress = 0,
    overallConsistency = 0,
    monthlyTotals = {}
  } = progressIntelligence || {};

  const {
    totalCaloriesBurned = 0,
    totalWorkoutMinutes = 0,
    totalWorkouts = 0,
    totalWaterMl = 0
  } = monthlyTotals;

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
            background: 'rgba(59, 130, 246, 0.15)',
            color: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Activity size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>
              Progress Intelligence Globe
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Holistic consistency across workouts, hydration, nutrition, and personal goal targets.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className={`performance-toggle-btn ${!mode2D ? 'active' : ''}`}
            onClick={() => setMode2D(false)}
          >
            3D Globe
          </button>
          <button
            type="button"
            className={`performance-toggle-btn ${mode2D ? 'active' : ''}`}
            onClick={() => setMode2D(true)}
          >
            2D Mode
          </button>
        </div>
      </div>

      <div className="canvas-wrapper score-hero">
        {/* Globe canvas */}
        <div style={{ position: 'relative', width: '100%', minHeight: '340px' }}>
          {mode2D ? (
            <Fallback2DGlobe
              workout={workoutConsistency}
              hydration={hydrationConsistency}
              nutrition={nutritionConsistency}
              goal={goalProgress}
              overall={overallConsistency}
            />
          ) : (
            <CanvasErrorBoundary
              fallback={<Fallback2DGlobe
                workout={workoutConsistency}
                hydration={hydrationConsistency}
                nutrition={nutritionConsistency}
                goal={goalProgress}
                overall={overallConsistency}
              />}
            >
              <Canvas
                camera={{ position: [0, 0, 5], fov: 45 }}
                gl={{ antialias: true, alpha: true }}
                style={{ width: '100%', height: '100%', minHeight: '340px' }}
              >
                <GlobeRings
                  workout={workoutConsistency}
                  hydration={hydrationConsistency}
                  nutrition={nutritionConsistency}
                  goal={goalProgress}
                  overall={overallConsistency}
                />
              </Canvas>
              <div className="canvas-controls-hint">
                Multi-axis orbital status rings
              </div>
            </CanvasErrorBoundary>
          )}

          <div style={{
            position: 'absolute',
            bottom: '1rem',
            left: '1rem',
            background: 'rgba(15, 23, 42, 0.85)',
            backdropFilter: 'blur(8px)',
            padding: '0.65rem 1rem',
            borderRadius: '10px',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}>
            <div style={{ fontSize: '1.4rem', fontWeight: 800, color: '#10b981', lineHeight: 1 }}>
              {overallConsistency}%
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Overall Consistency
            </div>
          </div>
        </div>

        {/* Breakdown & 30-Day Totals */}
        <div style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '1.25rem',
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.75rem' }}>
              Consistency Indicators
            </h4>
            <div className="factor-breakdown-list">
              <div className="factor-item">
                <div className="factor-label-row">
                  <span style={{ color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Dumbbell size={14} /> Workout Days
                  </span>
                  <span>{workoutConsistency}%</span>
                </div>
                <div className="factor-bar-track">
                  <div className="factor-bar-fill" style={{ width: `${workoutConsistency}%`, background: '#10b981' }} />
                </div>
              </div>

              <div className="factor-item">
                <div className="factor-label-row">
                  <span style={{ color: '#3b82f6', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Droplets size={14} /> Hydration Consistency
                  </span>
                  <span>{hydrationConsistency}%</span>
                </div>
                <div className="factor-bar-track">
                  <div className="factor-bar-fill" style={{ width: `${hydrationConsistency}%`, background: '#3b82f6' }} />
                </div>
              </div>

              <div className="factor-item">
                <div className="factor-label-row">
                  <span style={{ color: '#06b6d4', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Utensils size={14} /> Nutrition Logging
                  </span>
                  <span>{nutritionConsistency}%</span>
                </div>
                <div className="factor-bar-track">
                  <div className="factor-bar-fill" style={{ width: `${nutritionConsistency}%`, background: '#06b6d4' }} />
                </div>
              </div>

              <div className="factor-item">
                <div className="factor-label-row">
                  <span style={{ color: '#a855f7', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Target size={14} /> Today's Goal Progress
                  </span>
                  <span>{goalProgress}%</span>
                </div>
                <div className="factor-bar-track">
                  <div className="factor-bar-fill" style={{ width: `${goalProgress}%`, background: '#a855f7' }} />
                </div>
              </div>
            </div>
          </div>

          <div style={{ borderTop: '1px solid rgba(255, 255, 255, 0.08)', paddingTop: '1rem' }}>
            <h4 style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Past 30 Days Cumulative Activity
            </h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem' }}>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#10b981' }}>{totalCaloriesBurned.toLocaleString()}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Calories Burned (kcal)</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#3b82f6' }}>{totalWorkoutMinutes}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Workout Minutes</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#a855f7' }}>{totalWorkouts}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Workouts Completed</div>
              </div>
              <div style={{ padding: '0.75rem', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.06)' }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#06b6d4' }}>{(totalWaterMl / 1000).toFixed(1)} L</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Water Consumed</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
