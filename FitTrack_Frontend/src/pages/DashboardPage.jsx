import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import dashboardService from '../services/dashboardService';
import waterService from '../services/waterService';
import fitnessService from '../services/fitnessService';
import MetricCard from '../components/MetricCard';

// Three Major 3D Intelligence Experiences
import AnatomicalMuscleBody from '../components/3d/AnatomicalMuscleBody';
import ProgressIntelligenceGlobe from '../components/3d/ProgressIntelligenceGlobe';
import GoalJourneyEngine from '../components/3d/GoalJourneyEngine';

// Compact Clean 2D Intelligence Components
import AdaptiveWeeklySchedule from '../components/dashboard/AdaptiveWeeklySchedule';
import UnifiedFitnessTimeline from '../components/dashboard/UnifiedFitnessTimeline';
import StreakAchievementCard from '../components/dashboard/StreakAchievementCard';

import { 
  Flame, Utensils, Dumbbell, Droplets, Activity, 
  Plus, ChevronRight, Eye, EyeOff
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  Tooltip, CartesianGrid, BarChart, Bar, Legend 
} from 'recharts';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [recentActivity, setRecentActivity] = useState({ workouts: [], meals: [] });
  
  // Fitness Intelligence States
  const [intelligence, setIntelligence] = useState(null);
  const [timeline, setTimeline] = useState([]);
  const [muscleActivity, setMuscleActivity] = useState([]);

  // Master 3D / 2D rendering switch
  const [global3DEnabled, setGlobal3DEnabled] = useState(true);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      const [s, w, a, intelRes, timeRes, muscRes] = await Promise.allSettled([
        dashboardService.getStats(),
        dashboardService.getWeeklyProgress(),
        dashboardService.getRecentActivity(),
        fitnessService.getIntelligence(),
        fitnessService.getTimeline(30),
        fitnessService.getMuscleActivity()
      ]);

      if (s.status === 'fulfilled') setStats(s.value);
      if (w.status === 'fulfilled') setWeeklyData(w.value || []);
      if (a.status === 'fulfilled') setRecentActivity(a.value || { workouts: [], meals: [] });

      if (intelRes.status === 'fulfilled') setIntelligence(intelRes.value);
      if (timeRes.status === 'fulfilled') setTimeline(timeRes.value || []);
      if (muscRes.status === 'fulfilled') setMuscleActivity(muscRes.value || []);

    } catch (err) {
      toast.error('Unable to refresh some dashboard metrics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboard();
  }, []);

  const handleQuickAddWater = async (amount) => {
    try {
      await waterService.addWater(amount);
      toast.success(`+${amount}ml water logged!`);
      fetchDashboard();
    } catch (err) {
      toast.error(err.message || 'Failed to add water');
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        <div style={{ height: '38px', width: '250px', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }} />
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card" style={{ height: '140px', background: 'var(--surface)' }} />
          ))}
        </div>
      </div>
    );
  }

  const {
    caloriesConsumed = 0,
    caloriesBurned = 0,
    netCalories = 0,
    workoutsCount = 0,
    workoutMinutes = 0,
    waterIntake = 0,
    streak = 0,
    latestBmi = null,
    goals = {}
  } = stats || {};

  // Resolve user gender strictly from DB profile (intelligence.gender or currentUser.gender)
  const resolvedGender = intelligence?.gender || currentUser?.gender || 'Male';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.75rem' }}>
      {/* Page Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1>
            Good day, {currentUser?.name ? currentUser.name.split(' ')[0] : 'Athlete'} 👋
          </h1>
          <p className="page-subtitle">
            FitTrack Personal Fitness Intelligence Headquarters • Real-time Biometrics & Predictive Progress
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          {/* Master 3D / 2D Toggle */}
          <button
            className={`btn ${global3DEnabled ? 'btn-primary' : 'btn-secondary'}`}
            style={{ fontSize: '0.85rem' }}
            onClick={() => setGlobal3DEnabled(!global3DEnabled)}
            title={global3DEnabled ? 'Switch 3D canvases to lightweight 2D mode' : 'Enable interactive 3D visualizations'}
          >
            {global3DEnabled ? <Eye size={16} /> : <EyeOff size={16} />}
            {global3DEnabled ? '3D Active' : '2D Mode'}
          </button>

          <button className="btn btn-secondary" onClick={() => navigate('/meals')}>
            <Plus size={16} /> Log Meal
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/workouts')}>
            <Plus size={16} /> Log Workout
          </button>
        </div>
      </div>

      {/* 4 Top Metric Cards */}
      <div className="stats-grid">
        <MetricCard 
          title="ACTIVE BURN"
          value={caloriesBurned}
          unit="kcal"
          subtitle={`${workoutMinutes} mins active`}
          icon={Flame}
          color="var(--accent)"
          progress={goals?.calorieProgress}
          trend={streak > 0 ? `${streak} day streak 🔥` : 'Start your streak!'}
        />

        <MetricCard 
          title="CALORIES CONSUMED"
          value={caloriesConsumed}
          unit="kcal"
          subtitle={`Net: ${netCalories > 0 ? '+' : ''}${netCalories} kcal`}
          icon={Utensils}
          color="var(--accent-cyan)"
          progress={goals?.calorieGoal ? (caloriesConsumed / goals.calorieGoal) * 100 : 0}
        />

        <MetricCard 
          title="WORKOUTS TODAY"
          value={workoutsCount}
          unit="sessions"
          subtitle={`${workoutMinutes} total mins`}
          icon={Dumbbell}
          color="var(--accent-purple)"
          progress={goals?.workoutProgress}
        />

        <MetricCard 
          title="WATER INTAKE"
          value={waterIntake}
          unit="ml"
          subtitle={`Goal: ${goals?.waterGoal || 2500} ml`}
          icon={Droplets}
          color="var(--accent-blue)"
          progress={goals?.waterProgress}
        />
      </div>

      {/* Quick Water Bar */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '0.9rem 1.25rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div style={{ width: '36px', height: '36px', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Droplets size={18} />
          </div>
          <div>
            <strong style={{ fontSize: '0.92rem', display: 'block' }}>Quick Hydration Logger</strong>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Tap to add water ({waterIntake} / {goals?.waterGoal || 2500} ml)</span>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '0.45rem', flexWrap: 'wrap' }}>
          {[250, 500, 750, 1000].map(amount => (
            <button 
              key={amount} 
              className="btn btn-secondary" 
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.75rem' }}
              onClick={() => handleQuickAddWater(amount)}
            >
              +{amount} ml
            </button>
          ))}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3D EXPERIENCE #1: 3D ANATOMICAL MUSCLE DISTRIBUTION */}
      {/* ========================================================================= */}
      <AnatomicalMuscleBody
        muscleActivity={muscleActivity}
        gender={resolvedGender}
        force2D={!global3DEnabled}
      />

      {/* ========================================================================= */}
      {/* 3D EXPERIENCE #2 & #3: PROGRESS GLOBE (WITH FITNESS SCORE) & GOAL JOURNEY */}
      {/* ========================================================================= */}
      <div className="content-grid-2">
        <ProgressIntelligenceGlobe
          personalScore={intelligence?.fitnessScore || intelligence?.personalScore}
          progressIntelligence={intelligence?.progress || intelligence?.progressIntelligence}
          force2D={!global3DEnabled}
        />
        <GoalJourneyEngine
          goalJourney={intelligence?.goalJourney}
          force2D={!global3DEnabled}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2D INTELLIGENCE: ADAPTIVE 7-DAY SCHEDULE & STREAK / ACHIEVEMENTS */}
      {/* ========================================================================= */}
      <div className="content-grid-2">
        <AdaptiveWeeklySchedule
          adaptiveWeeklyPlan={intelligence?.adaptiveWeeklyPlan || []}
        />
        <StreakAchievementCard
          streaks={intelligence?.streaks || {}}
        />
      </div>

      {/* ========================================================================= */}
      {/* 2D INTELLIGENCE: UNIFIED FITNESS TIMELINE */}
      {/* ========================================================================= */}
      <UnifiedFitnessTimeline
        timeline={timeline}
      />

      {/* ========================================================================= */}
      {/* HISTORICAL CHARTS (RECHARTS) */}
      {/* ========================================================================= */}
      <div className="content-grid-2">
        {/* 7-Day Calorie Comparison Chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Calorie Expenditure vs Intake</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '0.2rem 0 0' }}>Past 7 Days Energy Balance</p>
            </div>
            <span className="badge badge-success">7-Day Trend</span>
          </div>

          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="burnGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="consumeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }} 
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                />
                <Legend />
                <Area type="monotone" dataKey="caloriesBurned" name="Burned (kcal)" stroke="#10b981" fillOpacity={1} fill="url(#burnGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="caloriesConsumed" name="Consumed (kcal)" stroke="#06b6d4" fillOpacity={1} fill="url(#consumeGrad)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Weekly Workout Minutes Bar Chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Daily Activity Minutes</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.78rem', margin: '0.2rem 0 0' }}>Workout Duration Breakdown</p>
            </div>
            <span className="badge badge-purple">Time Active</span>
          </div>

          <div style={{ width: '100%', height: '260px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }} 
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                />
                <Bar dataKey="workoutMinutes" name="Minutes" fill="#8b5cf6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Lower Row: BMI Summary & Recent Workouts */}
      <div className="content-grid-2">
        {/* BMI Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                <div style={{ width: '34px', height: '34px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <Activity size={18} />
                </div>
                <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Biometric BMI Status</h3>
              </div>
              <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }} onClick={() => navigate('/bmi')}>
                Details <ChevronRight size={14} />
              </button>
            </div>

            {latestBmi ? (
              <div>
                <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <span style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--accent)' }}>
                    {latestBmi.score}
                  </span>
                  <span className="badge badge-success" style={{ fontSize: '0.85rem' }}>
                    {latestBmi.status ? latestBmi.status.split('-')[0] : 'Recorded'}
                  </span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: 1.5 }}>
                  {latestBmi.status}
                </p>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem 1rem' }}>
                <p style={{ color: 'var(--text-secondary)', marginBottom: '1rem', fontSize: '0.88rem' }}>
                  No BMI recorded yet. Calculate your score to unlock customized fitness plans!
                </p>
                <button className="btn btn-primary" onClick={() => navigate('/bmi')}>
                  Calculate BMI Now
                </button>
              </div>
            )}
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.85rem', marginTop: '1.25rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
            <span>Target Goal: {goals?.isGoalMet ? 'Achieved Today ✅' : 'In Progress ⏳'}</span>
            <span style={{ color: 'var(--accent)' }}>{goals?.calorieProgress}% Calorie Target</span>
          </div>
        </div>

        {/* Recent Workouts Feed */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.05rem', margin: 0 }}>Recent Activity Summary</h3>
            <button className="btn btn-secondary" style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }} onClick={() => navigate('/workouts')}>
              View All <ChevronRight size={14} />
            </button>
          </div>

          {recentActivity.workouts.length === 0 && recentActivity.meals.length === 0 ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
              No recent activities logged yet.
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              {recentActivity.workouts.slice(0, 3).map(w => (
                <div key={`w-${w.id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Dumbbell size={15} color="var(--accent)" />
                    <div>
                      <strong style={{ fontSize: '0.88rem', display: 'block' }}>{w.title}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{w.category} · {w.duration} mins</span>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--accent)', fontSize: '0.88rem' }}>
                    -{w.calories} kcal
                  </span>
                </div>
              ))}

              {recentActivity.meals.slice(0, 2).map(m => (
                <div key={`m-${m.id}`} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', justifyContent: 'space-between', padding: '0.6rem 0.85rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Utensils size={15} color="var(--accent-cyan)" />
                    <div>
                      <strong style={{ fontSize: '0.88rem', display: 'block' }}>{m.title}</strong>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>{m.category}</span>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: 'var(--accent-cyan)', fontSize: '0.88rem' }}>
                    +{m.calories} kcal
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
