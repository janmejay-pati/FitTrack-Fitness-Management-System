import React, { useRef, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, Cylinder, Box, Float } from '@react-three/drei';
import CanvasErrorBoundary from './CanvasErrorBoundary';
import { User, Activity, Dumbbell } from 'lucide-react';
import './Fitness3D.css';

// 3D Anatomical Body with dynamic muscle group colors
function AnatomicalFigure({ muscleData = {}, selectedGroup, onSelectGroup, isReducedMotion }) {
  const bodyRef = useRef();

  useFrame((state, delta) => {
    if (isReducedMotion) return;
    if (bodyRef.current) {
      bodyRef.current.rotation.y = Math.sin(state.clock.elapsedTime * 0.4) * 0.25;
    }
  });

  const getColorForGroup = (groupName) => {
    const data = muscleData[groupName];
    if (selectedGroup === groupName) return '#38bdf8'; // Highlighted cyan
    if (!data || data.intensityPercentage === 0) return '#334155'; // Dark slate
    if (data.intensityPercentage >= 60) return '#10b981'; // Vibrant emerald
    if (data.intensityPercentage >= 30) return '#06b6d4'; // Cyan
    return '#3b82f6'; // Deep blue
  };

  const getEmissiveForGroup = (groupName) => {
    const data = muscleData[groupName];
    if (selectedGroup === groupName) return '#0284c7';
    if (!data || data.intensityPercentage === 0) return '#0f172a';
    if (data.intensityPercentage >= 60) return '#059669';
    if (data.intensityPercentage >= 30) return '#0891b2';
    return '#1d4ed8';
  };

  return (
    <group ref={bodyRef} position={[0, -0.4, 0]}>
      <ambientLight intensity={0.7} />
      <pointLight position={[3, 4, 3]} intensity={2} color="#10b981" />
      <pointLight position={[-3, -2, -2]} intensity={1.5} color="#38bdf8" />

      {/* Head */}
      <Sphere args={[0.24, 16, 16]} position={[0, 2.1, 0]}>
        <meshStandardMaterial color="#475569" roughness={0.3} metalness={0.6} />
      </Sphere>

      {/* Neck */}
      <Cylinder args={[0.1, 0.12, 0.2, 16]} position={[0, 1.8, 0]}>
        <meshStandardMaterial color="#334155" roughness={0.4} />
      </Cylinder>

      {/* Chest (Pectorals) */}
      <Box
        args={[0.85, 0.45, 0.35]}
        position={[0, 1.45, 0.05]}
        onClick={() => onSelectGroup('Chest')}
      >
        <meshStandardMaterial
          color={getColorForGroup('Chest')}
          emissive={getEmissiveForGroup('Chest')}
          emissiveIntensity={selectedGroup === 'Chest' ? 1.2 : 0.6}
          roughness={0.2}
          metalness={0.7}
        />
      </Box>

      {/* Core / Abdominals */}
      <Box
        args={[0.7, 0.5, 0.3]}
        position={[0, 0.95, 0.03]}
        onClick={() => onSelectGroup('Core')}
      >
        <meshStandardMaterial
          color={getColorForGroup('Core')}
          emissive={getEmissiveForGroup('Core')}
          emissiveIntensity={selectedGroup === 'Core' ? 1.2 : 0.6}
          roughness={0.2}
          metalness={0.7}
        />
      </Box>

      {/* Shoulders (Deltoids) */}
      <Sphere
        args={[0.2, 16, 16]}
        position={[-0.58, 1.5, 0]}
        onClick={() => onSelectGroup('Shoulders')}
      >
        <meshStandardMaterial
          color={getColorForGroup('Shoulders')}
          emissive={getEmissiveForGroup('Shoulders')}
          emissiveIntensity={selectedGroup === 'Shoulders' ? 1.2 : 0.6}
        />
      </Sphere>
      <Sphere
        args={[0.2, 16, 16]}
        position={[0.58, 1.5, 0]}
        onClick={() => onSelectGroup('Shoulders')}
      >
        <meshStandardMaterial
          color={getColorForGroup('Shoulders')}
          emissive={getEmissiveForGroup('Shoulders')}
          emissiveIntensity={selectedGroup === 'Shoulders' ? 1.2 : 0.6}
        />
      </Sphere>

      {/* Arms (Biceps & Triceps) */}
      <Cylinder
        args={[0.12, 0.1, 0.8, 16]}
        position={[-0.65, 0.95, 0]}
        onClick={() => onSelectGroup('Arms')}
      >
        <meshStandardMaterial
          color={getColorForGroup('Arms')}
          emissive={getEmissiveForGroup('Arms')}
          emissiveIntensity={selectedGroup === 'Arms' ? 1.2 : 0.6}
        />
      </Cylinder>
      <Cylinder
        args={[0.12, 0.1, 0.8, 16]}
        position={[0.65, 0.95, 0]}
        onClick={() => onSelectGroup('Arms')}
      >
        <meshStandardMaterial
          color={getColorForGroup('Arms')}
          emissive={getEmissiveForGroup('Arms')}
          emissiveIntensity={selectedGroup === 'Arms' ? 1.2 : 0.6}
        />
      </Cylinder>

      {/* Back (Upper & Lower Lats) */}
      <Box
        args={[0.82, 0.85, 0.15]}
        position={[0, 1.25, -0.15]}
        onClick={() => onSelectGroup('Back')}
      >
        <meshStandardMaterial
          color={getColorForGroup('Back')}
          emissive={getEmissiveForGroup('Back')}
          emissiveIntensity={selectedGroup === 'Back' ? 1.2 : 0.6}
        />
      </Box>

      {/* Pelvis / Hips */}
      <Box args={[0.75, 0.25, 0.3]} position={[0, 0.58, 0]}>
        <meshStandardMaterial color="#334155" roughness={0.4} />
      </Box>

      {/* Legs (Quads & Hamstrings) */}
      <Cylinder
        args={[0.16, 0.12, 1.3, 16]}
        position={[-0.24, -0.22, 0]}
        onClick={() => onSelectGroup('Legs')}
      >
        <meshStandardMaterial
          color={getColorForGroup('Legs')}
          emissive={getEmissiveForGroup('Legs')}
          emissiveIntensity={selectedGroup === 'Legs' ? 1.2 : 0.6}
        />
      </Cylinder>
      <Cylinder
        args={[0.16, 0.12, 1.3, 16]}
        position={[0.24, -0.22, 0]}
        onClick={() => onSelectGroup('Legs')}
      >
        <meshStandardMaterial
          color={getColorForGroup('Legs')}
          emissive={getEmissiveForGroup('Legs')}
          emissiveIntensity={selectedGroup === 'Legs' ? 1.2 : 0.6}
        />
      </Cylinder>
    </group>
  );
}

export default function FitnessBody3D({ muscleActivity = [], force2D = false }) {
  const [selectedGroup, setSelectedGroup] = useState('Chest');
  const [mode2D, setMode2D] = useState(force2D);

  // Convert array to dictionary keyed by group name
  const muscleMap = {};
  if (Array.isArray(muscleActivity)) {
    muscleActivity.forEach(m => {
      const g = m.group || m.Group;
      if (g) {
        muscleMap[g] = {
          group: g,
          workoutCount: m.workoutCount ?? m.WorkoutCount ?? 0,
          setsCount: m.setsCount ?? m.SetsCount ?? 0,
          caloriesBurned: m.caloriesBurned ?? m.CaloriesBurned ?? 0,
          intensityPercentage: m.intensityPercentage ?? m.IntensityPercentage ?? 0
        };
      }
    });
  }

  const selectedData = muscleMap[selectedGroup] || {
    group: selectedGroup,
    workoutCount: 0,
    setsCount: 0,
    caloriesBurned: 0,
    intensityPercentage: 0
  };

  const groupsList = ['Chest', 'Back', 'Shoulders', 'Arms', 'Legs', 'Core'];

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
            background: 'rgba(16, 185, 129, 0.15)',
            color: '#10b981',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <User size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem' }}>
              3D Anatomical Muscle Distribution
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Real-time biomechanical load calculated from your verified workout sets and exercise categories.
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            className={`performance-toggle-btn ${!mode2D ? 'active' : ''}`}
            onClick={() => setMode2D(false)}
          >
            3D Mannequin
          </button>
          <button
            type="button"
            className={`performance-toggle-btn ${mode2D ? 'active' : ''}`}
            onClick={() => setMode2D(true)}
          >
            2D Grid
          </button>
        </div>
      </div>

      <div className="canvas-wrapper score-hero">
        {/* 3D Model or 2D Diagram */}
        <div style={{ position: 'relative', width: '100%', minHeight: '380px' }}>
          {mode2D ? (
            <div className="fallback-2d-container">
              <User size={64} color="#10b981" />
              <span style={{ fontWeight: 600, color: '#f8fafc' }}>2D Muscle Group Map</span>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Select a group below to view your logged sets</span>
            </div>
          ) : (
            <CanvasErrorBoundary>
              <Canvas
                camera={{ position: [0, 0.8, 4.4], fov: 42 }}
                gl={{ antialias: true, alpha: true }}
                style={{ width: '100%', height: '100%', minHeight: '380px' }}
              >
                <AnatomicalFigure
                  muscleData={muscleMap}
                  selectedGroup={selectedGroup}
                  onSelectGroup={setSelectedGroup}
                />
              </Canvas>
              <div className="canvas-controls-hint">
                Click body part or muscle tab to inspect volume
              </div>
            </CanvasErrorBoundary>
          )}

          {/* Selected Group Badge */}
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
            <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#38bdf8', lineHeight: 1 }}>
              {selectedGroup}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
              {selectedData.intensityPercentage}% Load Share
            </div>
          </div>
        </div>

        {/* Muscle Selector & Details */}
        <div style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '1.25rem',
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)'
        }}>
          <div>
            <h4 style={{ fontSize: '0.92rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Select Muscle Group
            </h4>
            <div className="muscle-list-grid">
              {groupsList.map(grp => {
                const info = muscleMap[grp] || { intensityPercentage: 0 };
                return (
                  <div
                    key={grp}
                    className={`muscle-stat-pill ${selectedGroup === grp ? 'active' : ''}`}
                    onClick={() => setSelectedGroup(grp)}
                  >
                    <span style={{ fontSize: '0.82rem', fontWeight: 600, color: selectedGroup === grp ? '#38bdf8' : '#f8fafc' }}>
                      {grp}
                    </span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {info.intensityPercentage}% load
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{
            padding: '1rem',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.06)'
          }}>
            <h5 style={{ margin: '0 0 0.5rem', fontSize: '0.85rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <Dumbbell size={15} /> {selectedGroup} Training Breakdown
            </h5>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', marginTop: '0.75rem' }}>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>{selectedData.workoutCount}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Workouts</div>
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>{selectedData.setsCount}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Sets</div>
              </div>
              <div>
                <div style={{ fontSize: '1.2rem', fontWeight: 700, color: '#f8fafc' }}>{selectedData.caloriesBurned}</div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>kcal Burned</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
