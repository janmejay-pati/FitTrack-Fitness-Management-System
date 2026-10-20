import React, { useRef, useState, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float, Sphere, Cylinder, Box, Capsule } from '@react-three/drei';
import CanvasErrorBoundary from './CanvasErrorBoundary';
import { User, RotateCcw, Eye, Compass, Info, Dumbbell } from 'lucide-react';
import './Fitness3D.css';

/**
 * Procedural Realistic Human Anatomical Figure
 * Supports distinct Male and Female anatomical proportions based on stored UserGender.
 */
function RealisticAnatomyMesh({
  gender = 'Male',
  muscleMap = {},
  selectedGroup,
  onSelectGroup,
  viewAngle = 'front',
  isReducedMotion
}) {
  const bodyGroupRef = useRef();
  const isFemale = String(gender).trim().toLowerCase() === 'female';

  // Realistic anatomical proportions
  const shoulderWidth = isFemale ? 0.95 : 1.35;
  const chestWidth = isFemale ? 0.78 : 1.05;
  const chestDepth = isFemale ? 0.38 : 0.45;
  const waistWidth = isFemale ? 0.58 : 0.78;
  const hipWidth = isFemale ? 0.92 : 0.82;
  const armThickness = isFemale ? 0.11 : 0.15;
  const legThickness = isFemale ? 0.16 : 0.19;

  // Gentle idle breathing animation
  useFrame((state, delta) => {
    if (isReducedMotion) return;
    if (bodyGroupRef.current) {
      // Subtle organic breathing oscillation
      const breath = Math.sin(state.clock.elapsedTime * 1.5) * 0.01;
      bodyGroupRef.current.position.y = breath;
    }
  });

  // Calculate realistic organic material colors based on actual training data
  const getMuscleMaterialProps = (groupName) => {
    const data = muscleMap[groupName];
    const isSelected = selectedGroup === groupName;
    const count = data?.sessionCount || 0;
    const intensity = data?.intensityLevel || 'none';

    // Base realistic skin tone
    let baseColor = '#334155'; // Clean anatomical slate
    let emissiveColor = '#0f172a';
    let emissiveIntensity = 0.1;

    if (isSelected) {
      baseColor = '#38bdf8';
      emissiveColor = '#0284c7';
      emissiveIntensity = 0.85;
    } else if (intensity === 'high') {
      baseColor = '#059669'; // Organic deep emerald
      emissiveColor = '#10b981';
      emissiveIntensity = 0.55;
    } else if (intensity === 'medium') {
      baseColor = '#0d9488'; // Teal
      emissiveColor = '#14b8a6';
      emissiveIntensity = 0.35;
    } else if (intensity === 'low') {
      baseColor = '#2563eb'; // Deep blue
      emissiveColor = '#3b82f6';
      emissiveIntensity = 0.25;
    }

    return {
      color: baseColor,
      emissive: emissiveColor,
      emissiveIntensity,
      roughness: 0.65,
      metalness: 0.08
    };
  };

  return (
    <group ref={bodyGroupRef} position={[0, -0.3, 0]}>
      {/* Anatomical Studio Lighting */}
      <ambientLight intensity={0.7} />
      <directionalLight position={[0, 8, 5]} intensity={1.4} color="#f8fafc" />
      <directionalLight position={[0, -4, -5]} intensity={0.5} color="#64748b" />
      <pointLight position={[3, 2, 3]} intensity={1.8} color="#38bdf8" />
      <pointLight position={[-3, 2, -3]} intensity={1.2} color="#10b981" />

      {/* HEAD & NECK */}
      <group position={[0, 2.2, 0]}>
        <Sphere args={[0.22, 24, 24]}>
          <meshStandardMaterial color="#475569" roughness={0.7} metalness={0.05} />
        </Sphere>
        <Cylinder args={[0.1, 0.13, 0.22, 20]} position={[0, -0.22, 0]}>
          <meshStandardMaterial color="#334155" roughness={0.7} />
        </Cylinder>
      </group>

      {/* CHEST (Pectoralis Major) */}
      <group position={[0, 1.62, 0.06]}>
        <Box
          args={[chestWidth, 0.42, chestDepth]}
          onClick={(e) => { e.stopPropagation(); onSelectGroup('Chest'); }}
        >
          <meshStandardMaterial {...getMuscleMaterialProps('Chest')} />
        </Box>
      </group>

      {/* UPPER & LOWER BACK (Latissimus Dorsi / Trapezius) */}
      <group position={[0, 1.42, -0.08]}>
        <Box
          args={[chestWidth * 0.95, 0.72, 0.24]}
          onClick={(e) => { e.stopPropagation(); onSelectGroup('Back'); }}
        >
          <meshStandardMaterial {...getMuscleMaterialProps('Back')} />
        </Box>
      </group>

      {/* SHOULDERS (Deltoids - Left & Right) */}
      <group position={[-shoulderWidth / 2, 1.68, 0]}>
        <Sphere
          args={[isFemale ? 0.16 : 0.21, 20, 20]}
          onClick={(e) => { e.stopPropagation(); onSelectGroup('Shoulders'); }}
        >
          <meshStandardMaterial {...getMuscleMaterialProps('Shoulders')} />
        </Sphere>
      </group>
      <group position={[shoulderWidth / 2, 1.68, 0]}>
        <Sphere
          args={[isFemale ? 0.16 : 0.21, 20, 20]}
          onClick={(e) => { e.stopPropagation(); onSelectGroup('Shoulders'); }}
        >
          <meshStandardMaterial {...getMuscleMaterialProps('Shoulders')} />
        </Sphere>
      </group>

      {/* BICEPS (Front Upper Arm) */}
      <group position={[-shoulderWidth / 2 - 0.08, 1.25, 0.05]}>
        <Cylinder
          args={[armThickness, armThickness * 0.9, 0.42, 18]}
          onClick={(e) => { e.stopPropagation(); onSelectGroup('Biceps'); }}
        >
          <meshStandardMaterial {...getMuscleMaterialProps('Biceps')} />
        </Cylinder>
      </group>
      <group position={[shoulderWidth / 2 + 0.08, 1.25, 0.05]}>
        <Cylinder
          args={[armThickness, armThickness * 0.9, 0.42, 18]}
          onClick={(e) => { e.stopPropagation(); onSelectGroup('Biceps'); }}
        >
          <meshStandardMaterial {...getMuscleMaterialProps('Biceps')} />
        </Cylinder>
      </group>

      {/* TRICEPS (Back Upper Arm) */}
      <group position={[-shoulderWidth / 2 - 0.08, 1.25, -0.06]}>
        <Cylinder
          args={[armThickness * 0.95, armThickness * 0.85, 0.42, 18]}
          onClick={(e) => { e.stopPropagation(); onSelectGroup('Triceps'); }}
        >
          <meshStandardMaterial {...getMuscleMaterialProps('Triceps')} />
        </Cylinder>
      </group>
      <group position={[shoulderWidth / 2 + 0.08, 1.25, -0.06]}>
        <Cylinder
          args={[armThickness * 0.95, armThickness * 0.85, 0.42, 18]}
          onClick={(e) => { e.stopPropagation(); onSelectGroup('Triceps'); }}
        >
          <meshStandardMaterial {...getMuscleMaterialProps('Triceps')} />
        </Cylinder>
      </group>

      {/* FOREARMS (Brachioradialis / Forearm Flexors) */}
      <group position={[-shoulderWidth / 2 - 0.08, 0.72, 0]}>
        <Cylinder
          args={[armThickness * 0.85, armThickness * 0.65, 0.52, 18]}
          onClick={(e) => { e.stopPropagation(); onSelectGroup('Forearms'); }}
        >
          <meshStandardMaterial {...getMuscleMaterialProps('Forearms')} />
        </Cylinder>
      </group>
      <group position={[shoulderWidth / 2 + 0.08, 0.72, 0]}>
        <Cylinder
          args={[armThickness * 0.85, armThickness * 0.65, 0.52, 18]}
          onClick={(e) => { e.stopPropagation(); onSelectGroup('Forearms'); }}
        >
          <meshStandardMaterial {...getMuscleMaterialProps('Forearms')} />
        </Cylinder>
      </group>

      {/* CORE (Rectus Abdominis & Obliques) */}
      <group position={[0, 1.15, 0.04]}>
        <Box
          args={[waistWidth, 0.48, 0.28]}
          onClick={(e) => { e.stopPropagation(); onSelectGroup('Core'); }}
        >
          <meshStandardMaterial {...getMuscleMaterialProps('Core')} />
        </Box>
      </group>

      {/* GLUTES (Pelvis / Gluteus Maximus) */}
      <group position={[0, 0.76, -0.04]}>
        <Box
          args={[hipWidth, 0.36, 0.36]}
          onClick={(e) => { e.stopPropagation(); onSelectGroup('Glutes'); }}
        >
          <meshStandardMaterial {...getMuscleMaterialProps('Glutes')} />
        </Box>
      </group>

      {/* QUADRICEPS (Front Upper Legs) */}
      <group position={[-hipWidth * 0.28, 0.18, 0.04]}>
        <Cylinder
          args={[legThickness, legThickness * 0.85, 0.75, 20]}
          onClick={(e) => { e.stopPropagation(); onSelectGroup('Quadriceps'); }}
        >
          <meshStandardMaterial {...getMuscleMaterialProps('Quadriceps')} />
        </Cylinder>
      </group>
      <group position={[hipWidth * 0.28, 0.18, 0.04]}>
        <Cylinder
          args={[legThickness, legThickness * 0.85, 0.75, 20]}
          onClick={(e) => { e.stopPropagation(); onSelectGroup('Quadriceps'); }}
        >
          <meshStandardMaterial {...getMuscleMaterialProps('Quadriceps')} />
        </Cylinder>
      </group>

      {/* HAMSTRINGS (Back Upper Legs) */}
      <group position={[-hipWidth * 0.28, 0.18, -0.06]}>
        <Cylinder
          args={[legThickness * 0.95, legThickness * 0.8, 0.75, 20]}
          onClick={(e) => { e.stopPropagation(); onSelectGroup('Hamstrings'); }}
        >
          <meshStandardMaterial {...getMuscleMaterialProps('Hamstrings')} />
        </Cylinder>
      </group>
      <group position={[hipWidth * 0.28, 0.18, -0.06]}>
        <Cylinder
          args={[legThickness * 0.95, legThickness * 0.8, 0.75, 20]}
          onClick={(e) => { e.stopPropagation(); onSelectGroup('Hamstrings'); }}
        >
          <meshStandardMaterial {...getMuscleMaterialProps('Hamstrings')} />
        </Cylinder>
      </group>

      {/* CALVES (Gastrocnemius & Soleus) */}
      <group position={[-hipWidth * 0.28, -0.62, 0]}>
        <Cylinder
          args={[legThickness * 0.78, legThickness * 0.55, 0.75, 20]}
          onClick={(e) => { e.stopPropagation(); onSelectGroup('Calves'); }}
        >
          <meshStandardMaterial {...getMuscleMaterialProps('Calves')} />
        </Cylinder>
      </group>
      <group position={[hipWidth * 0.28, -0.62, 0]}>
        <Cylinder
          args={[legThickness * 0.78, legThickness * 0.55, 0.75, 20]}
          onClick={(e) => { e.stopPropagation(); onSelectGroup('Calves'); }}
        >
          <meshStandardMaterial {...getMuscleMaterialProps('Calves')} />
        </Cylinder>
      </group>
    </group>
  );
}

// 2D Accessible Fallback View
function Anatomical2DFallback({ muscleList, muscleMap, selectedGroup, onSelectGroup }) {
  return (
    <div className="fallback-2d-container" style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: '#10b981' }}>
        <User size={24} />
        <strong style={{ fontSize: '1rem', color: '#f8fafc' }}>Anatomical Muscle Volume Map</strong>
      </div>
      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0, textAlign: 'center' }}>
        Interactive 2D muscle distribution grid derived from verified database exercise logs.
      </p>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(110px, 1fr))',
        gap: '0.65rem',
        width: '100%',
        marginTop: '1rem'
      }}>
        {muscleList.map(grp => {
          const item = muscleMap[grp] || {};
          const isSelected = selectedGroup === grp;
          return (
            <button
              key={grp}
              type="button"
              className={`muscle-stat-pill ${isSelected ? 'active' : ''}`}
              onClick={() => onSelectGroup(grp)}
              style={{ textAlign: 'left', padding: '0.65rem 0.8rem' }}
            >
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: isSelected ? '#38bdf8' : '#f8fafc' }}>
                {grp}
              </span>
              <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                {item.sessionCount ? `${item.sessionCount} sessions` : 'No logs'}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default function AnatomicalMuscleBody({
  muscleActivity = [],
  gender = 'Male',
  force2D = false
}) {
  const [selectedGroup, setSelectedGroup] = useState('Chest');
  const [mode2D, setMode2D] = useState(force2D);
  const [viewAngle, setViewAngle] = useState('front'); // 'front' | 'back'
  const controlsRef = useRef();

  const muscleList = [
    'Chest', 'Back', 'Shoulders', 'Biceps', 'Triceps',
    'Forearms', 'Core', 'Glutes', 'Quadriceps', 'Hamstrings', 'Calves'
  ];

  // Map array into lookup dictionary
  const muscleMap = useMemo(() => {
    const map = {};
    if (Array.isArray(muscleActivity)) {
      muscleActivity.forEach(m => {
        const key = m.muscleGroup || m.group || m.Group;
        if (key) {
          map[key] = {
            muscleGroup: key,
            sessionCount: m.sessionCount ?? m.workoutCount ?? 0,
            trainingContribution: m.trainingContribution ?? m.intensityPercentage ?? 0,
            intensityLevel: m.intensityLevel || (m.sessionCount > 2 ? 'high' : m.sessionCount > 0 ? 'medium' : 'none'),
            totalMinutes: m.totalMinutes ?? m.workoutMinutes ?? 0,
            totalCalories: m.totalCalories ?? m.caloriesBurned ?? 0,
            recentExercises: m.recentExercises || m.exercises || []
          };
        }
      });
    }
    return map;
  }, [muscleActivity]);

  const selectedData = muscleMap[selectedGroup] || {
    muscleGroup: selectedGroup,
    sessionCount: 0,
    trainingContribution: 0,
    intensityLevel: 'none',
    totalMinutes: 0,
    totalCalories: 0,
    recentExercises: []
  };

  // Camera angle switcher
  const handleToggleViewAngle = () => {
    const nextAngle = viewAngle === 'front' ? 'back' : 'front';
    setViewAngle(nextAngle);
    if (controlsRef.current) {
      if (nextAngle === 'back') {
        controlsRef.current.setAzimuthalAngle(Math.PI);
      } else {
        controlsRef.current.setAzimuthalAngle(0);
      }
    }
  };

  const handleResetCamera = () => {
    setViewAngle('front');
    if (controlsRef.current) {
      controlsRef.current.reset();
    }
  };

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
            <User size={20} />
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.15rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              3D Anatomical Muscle Distribution
              <span className="intel-badge intel-badge-emerald">
                {String(gender).toLowerCase() === 'female' ? 'Female Anatomy' : 'Male Anatomy'}
              </span>
            </h3>
            <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-muted)' }}>
              Rotatable realistic human anatomy with biomechanical load mapping from verified workouts.
            </p>
          </div>
        </div>

        {/* View Controls & 2D/3D Mode Switch */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          {!mode2D && (
            <>
              <button
                type="button"
                className="performance-toggle-btn"
                onClick={handleToggleViewAngle}
                title="Toggle between anterior (front) and posterior (back) views"
              >
                <Compass size={14} />
                {viewAngle === 'front' ? 'Turn to Back' : 'Turn to Front'}
              </button>
              <button
                type="button"
                className="performance-toggle-btn"
                onClick={handleResetCamera}
                title="Reset Camera View"
              >
                <RotateCcw size={14} />
                Reset
              </button>
            </>
          )}

          <button
            type="button"
            className={`performance-toggle-btn ${!mode2D ? 'active' : ''}`}
            onClick={() => setMode2D(false)}
          >
            3D Body
          </button>
          <button
            type="button"
            className={`performance-toggle-btn ${mode2D ? 'active' : ''}`}
            onClick={() => setMode2D(true)}
          >
            2D Map
          </button>
        </div>
      </div>

      {/* Main Container */}
      <div className="canvas-wrapper score-hero" style={{ minHeight: '390px' }}>
        {/* Left Side: 3D Scene / 2D Fallback */}
        <div style={{ position: 'relative', width: '100%', minHeight: '390px' }}>
          {mode2D ? (
            <Anatomical2DFallback
              muscleList={muscleList}
              muscleMap={muscleMap}
              selectedGroup={selectedGroup}
              onSelectGroup={setSelectedGroup}
            />
          ) : (
            <CanvasErrorBoundary
              fallback={
                <Anatomical2DFallback
                  muscleList={muscleList}
                  muscleMap={muscleMap}
                  selectedGroup={selectedGroup}
                  onSelectGroup={setSelectedGroup}
                />
              }
            >
              <Canvas
                camera={{ position: [0, 0.8, 3.8], fov: 42 }}
                gl={{ antialias: true, alpha: true, powerPreference: 'high-performance' }}
                style={{ width: '100%', height: '100%', minHeight: '390px' }}
              >
                <RealisticAnatomyMesh
                  gender={gender}
                  muscleMap={muscleMap}
                  selectedGroup={selectedGroup}
                  onSelectGroup={setSelectedGroup}
                  viewAngle={viewAngle}
                />
                <OrbitControls
                  ref={controlsRef}
                  enablePan={false}
                  minDistance={2.5}
                  maxDistance={6.0}
                  maxPolarAngle={Math.PI / 1.8}
                  minPolarAngle={Math.PI / 3.5}
                />
              </Canvas>
              <div className="canvas-controls-hint">
                Drag to rotate • Scroll to zoom • Click muscles to inspect
              </div>
            </CanvasErrorBoundary>
          )}

          {/* Selected Muscle Overlay Badge */}
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
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#38bdf8', lineHeight: 1 }}>
              {selectedGroup}
            </div>
            <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              {selectedData.trainingContribution}% Training Contribution
            </div>
          </div>
        </div>

        {/* Right Side: Muscle Information Panel */}
        <div style={{
          padding: '1.5rem',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          gap: '1.25rem',
          borderLeft: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(255, 255, 255, 0.015)'
        }}>
          {/* Quick Select Muscle Pills */}
          <div>
            <h4 style={{ fontSize: '0.88rem', fontWeight: 600, color: '#f8fafc', marginBottom: '0.5rem' }}>
              Select Muscle Group
            </h4>
            <div className="muscle-list-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(95px, 1fr))' }}>
              {muscleList.map(grp => {
                const info = muscleMap[grp] || {};
                const isSelected = selectedGroup === grp;
                return (
                  <div
                    key={grp}
                    className={`muscle-stat-pill ${isSelected ? 'active' : ''}`}
                    onClick={() => setSelectedGroup(grp)}
                    style={{ padding: '0.55rem 0.65rem' }}
                  >
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isSelected ? '#38bdf8' : '#f8fafc' }}>
                      {grp}
                    </span>
                    <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                      {info.sessionCount ? `${info.sessionCount} sessions` : '0 sessions'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Muscle Information Card */}
          <div style={{
            padding: '1.1rem',
            borderRadius: '12px',
            background: 'rgba(255, 255, 255, 0.03)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.75rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: '#10b981', fontWeight: 600, fontSize: '0.92rem' }}>
                <Dumbbell size={16} />
                <span>Muscle: {selectedGroup}</span>
              </div>
              <span className={`intel-badge ${selectedData.sessionCount > 0 ? 'intel-badge-emerald' : 'intel-badge-blue'}`}>
                {selectedData.trainingContribution}% Contribution
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem', padding: '0.5rem 0', borderTop: '1px solid rgba(255,255,255,0.06)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                  {selectedData.sessionCount}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Training Frequency</div>
              </div>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                  {selectedData.totalMinutes}m
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Total Duration</div>
              </div>
              <div>
                <div style={{ fontSize: '1.15rem', fontWeight: 700, color: '#f8fafc' }}>
                  {selectedData.totalCalories}
                </div>
                <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Active Calories</div>
              </div>
            </div>

            {/* Recent Exercises List or Empty State */}
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                Recent Exercises
              </span>
              {selectedData.recentExercises && selectedData.recentExercises.length > 0 ? (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.35rem' }}>
                  {selectedData.recentExercises.map((ex, idx) => (
                    <span
                      key={idx}
                      style={{
                        padding: '0.25rem 0.55rem',
                        borderRadius: '6px',
                        background: 'rgba(255, 255, 255, 0.05)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        fontSize: '0.8rem',
                        color: '#cbd5e1'
                      }}
                    >
                      {ex}
                    </span>
                  ))}
                </div>
              ) : (
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', marginTop: '0.35rem', fontStyle: 'italic' }}>
                  Not enough workout data yet.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
