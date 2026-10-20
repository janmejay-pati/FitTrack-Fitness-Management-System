import React, { useState, useEffect } from 'react';
import goalService from '../services/goalService';
import MetricCard from '../components/MetricCard';
import confetti from 'canvas-confetti';
import { Target, CheckCircle, Flame, Dumbbell, Droplets, Calendar, Award } from 'lucide-react';
import toast from 'react-hot-toast';

export default function GoalsPage() {
  const [goalData, setGoalData] = useState({ current: null, todayProgress: {}, history: [] });
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    calorieGoal: 2000,
    workoutGoal: 45,
    waterIntakeGoal: 2500
  });
  const [saving, setSaving] = useState(false);

  const fetchGoals = async () => {
    try {
      const data = await goalService.get();
      setGoalData(data);
      if (data.current) {
        setForm({
          calorieGoal: data.current.calorieGoal,
          workoutGoal: data.current.workoutGoal,
          waterIntakeGoal: data.current.waterIntakeGoal
        });
      }
    } catch {
      toast.error('Failed to load goals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await goalService.create(form);
      toast.success('Daily goals established successfully!');
      fetchGoals();
    } catch (err) {
      toast.error(err.message || 'Error updating goals');
    } finally {
      setSaving(false);
    }
  };

  const handleToggle = async (id) => {
    try {
      const res = await goalService.toggleComplete(id);
      if (res.isCompleted) {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
        toast.success('Awesome! Goal marked as completed! 🎯');
      } else {
        toast('Goal marked in progress');
      }
      fetchGoals();
    } catch (err) {
      toast.error(err.message || 'Error toggling goal');
    }
  };

  const { current, todayProgress, history } = goalData;
  const burned = todayProgress?.caloriesBurned || 0;
  const mins = todayProgress?.workoutMinutes || 0;
  const water = todayProgress?.waterIntake || 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1><Target size={28} color="var(--accent)" /> Daily Target Goals</h1>
          <p className="page-subtitle">Define daily energy expenditure, training duration, and hydration quotas.</p>
        </div>
      </div>

      {/* Target Progress Cards */}
      <div className="stats-grid">
        <MetricCard 
          title="ACTIVE BURN TARGET"
          value={`${burned} / ${form.calorieGoal}`}
          unit="kcal"
          subtitle={`${Math.min(100, Math.round((burned / form.calorieGoal) * 100))}% completed`}
          icon={Flame}
          color="var(--accent)"
          progress={(burned / form.calorieGoal) * 100}
        />
        <MetricCard 
          title="TRAINING TARGET"
          value={`${mins} / ${form.workoutGoal}`}
          unit="mins"
          subtitle={`${Math.min(100, Math.round((mins / form.workoutGoal) * 100))}% completed`}
          icon={Dumbbell}
          color="var(--accent-purple)"
          progress={(mins / form.workoutGoal) * 100}
        />
        <MetricCard 
          title="HYDRATION TARGET"
          value={`${water} / ${form.waterIntakeGoal}`}
          unit="ml"
          subtitle={`${Math.min(100, Math.round((water / form.waterIntakeGoal) * 100))}% completed`}
          icon={Droplets}
          color="var(--accent-blue)"
          progress={(water / form.waterIntakeGoal) * 100}
        />
        <MetricCard 
          title="DAILY GOAL STATUS"
          value={current?.isCompleted ? 'Finished' : 'In Progress'}
          subtitle={current?.isCompleted ? 'Target achieved today!' : 'Complete targets & check off'}
          icon={Award}
          color="var(--accent-amber)"
        />
      </div>

      {/* Set / Edit Goal Form */}
      <div className="content-grid-2">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Target size={20} />
            </div>
            <div>
              <h3>Configure Today's Targets</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Update daily targets to match your training plan</p>
            </div>
          </div>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Calorie Expenditure Goal (kcal)</label>
              <input 
                type="number"
                className="form-input"
                min="500"
                max="8000"
                step="50"
                value={form.calorieGoal}
                onChange={e => setForm({ ...form, calorieGoal: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Workout Duration Goal (Minutes)</label>
              <input 
                type="number"
                className="form-input"
                min="10"
                max="360"
                step="5"
                value={form.workoutGoal}
                onChange={e => setForm({ ...form, workoutGoal: Number(e.target.value) })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Water Intake Goal (ml)</label>
              <input 
                type="number"
                className="form-input"
                min="500"
                max="8000"
                step="100"
                value={form.waterIntakeGoal}
                onChange={e => setForm({ ...form, waterIntakeGoal: Number(e.target.value) })}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem' }} disabled={saving}>
              {saving ? 'Saving...' : 'Save Today\'s Goals'}
            </button>
          </form>
        </div>

        {/* Today's Goal Card with Toggle */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
              <h3>Today's Milestone Card</h3>
              <span className={`badge ${current?.isCompleted ? 'badge-success' : 'badge-warning'}`}>
                {current?.isCompleted ? 'Completed' : 'Active'}
              </span>
            </div>

            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Maintain consistency each day. When you hit your active calorie burn, workout duration, and water quotas, mark your milestone as complete.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Flame size={16} color="var(--accent)" /> Burn {form.calorieGoal} kcal
                </span>
                <span style={{ color: burned >= form.calorieGoal ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {burned >= form.calorieGoal ? 'Met ✅' : `${burned} / ${form.calorieGoal}`}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Dumbbell size={16} color="var(--accent-purple)" /> Train for {form.workoutGoal} mins
                </span>
                <span style={{ color: mins >= form.workoutGoal ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {mins >= form.workoutGoal ? 'Met ✅' : `${mins} / ${form.workoutGoal}`}
                </span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.75rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Droplets size={16} color="var(--accent-blue)" /> Drink {form.waterIntakeGoal} ml
                </span>
                <span style={{ color: water >= form.waterIntakeGoal ? 'var(--accent)' : 'var(--text-muted)', fontWeight: 600 }}>
                  {water >= form.waterIntakeGoal ? 'Met ✅' : `${water} / ${form.waterIntakeGoal}`}
                </span>
              </div>
            </div>
          </div>

          {current && (
            <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1.25rem', marginTop: '1.5rem' }}>
              <button
                className={`btn ${current.isCompleted ? 'btn-secondary' : 'btn-primary'}`}
                style={{ width: '100%', padding: '0.8rem' }}
                onClick={() => handleToggle(current.id)}
              >
                <CheckCircle size={18} /> {current.isCompleted ? 'Mark As In-Progress' : 'Mark Daily Goal Complete 🎉'}
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Goal History */}
      <div className="card">
        <h3 style={{ marginBottom: '1.25rem' }}>Past Milestone History</h3>
        {history.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>No past goal records.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Calorie Target</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Workout Target</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Water Target</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map(g => (
                  <tr key={g.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                      <Calendar size={13} style={{ display: 'inline', marginRight: '4px' }} />
                      {new Date(g.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>{g.calorieGoal} kcal</td>
                    <td style={{ padding: '0.85rem 1rem' }}>{g.workoutGoal} mins</td>
                    <td style={{ padding: '0.85rem 1rem' }}>{g.waterIntakeGoal} ml</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className={`badge ${g.isCompleted ? 'badge-success' : 'badge-warning'}`}>
                        {g.isCompleted ? 'Completed' : 'Pending'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
