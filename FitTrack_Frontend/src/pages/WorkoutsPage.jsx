import React, { useState, useEffect } from 'react';
import workoutService from '../services/workoutService';
import MetricCard from '../components/MetricCard';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import toast from 'react-hot-toast';
import {
  Dumbbell,
  Plus,
  Search,
  Filter,
  Edit2,
  Trash2,
  X,
  Flame,
  Clock,
  Calendar,
  Activity
} from 'lucide-react';

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [category, setCategory] = useState('All');
  const [search, setSearch] = useState('');
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWorkout, setEditingWorkout] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [form, setForm] = useState({
    exercise: '',
    exerciseType: 'Cardio',
    duration: 30,
    caloriesBurned: 220,
    intensity: 'Medium',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchWorkouts = async () => {
    try {
      const data = await workoutService.getMyWorkouts(category, search);
      setWorkouts(data || []);
    } catch {
      toast.error('Failed to load workouts');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkouts();
  }, [category, search]);

  const openCreateModal = () => {
    setEditingWorkout(null);
    setForm({
      exercise: '',
      exerciseType: 'Cardio',
      duration: 30,
      caloriesBurned: 220,
      intensity: 'Medium',
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (w) => {
    setEditingWorkout(w);
    setForm({
      exercise: w.exercise,
      exerciseType: w.exerciseType,
      duration: w.duration,
      caloriesBurned: w.caloriesBurned,
      intensity: w.intensity || 'Medium',
      date: w.date ? w.date.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.exercise.trim()) {
      toast.error('Please enter an exercise name');
      return;
    }

    try {
      if (editingWorkout) {
        await workoutService.update({ ...form, id: editingWorkout.id });
        toast.success('Workout updated successfully!');
      } else {
        await workoutService.create(form);
        toast.success('Workout logged successfully! Keep burning!');
      }
      setIsModalOpen(false);
      fetchWorkouts();
    } catch (err) {
      toast.error(err.message || 'Error saving workout');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await workoutService.delete(deleteTargetId);
      toast.success('Workout removed');
      fetchWorkouts();
    } catch (err) {
      toast.error(err.message || 'Error deleting workout');
    }
  };

  const totalMinutes = workouts.reduce((sum, w) => sum + (w.duration || 0), 0);
  const totalBurned = workouts.reduce((sum, w) => sum + (w.caloriesBurned || 0), 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1><Dumbbell size={28} color="var(--accent)" /> Workouts & Training</h1>
          <p className="page-subtitle">Track individual workout sessions, exercise intensity, and calories burned.</p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} /> Log Workout
        </button>
      </div>

      {/* Metric Cards */}
      <div className="stats-grid">
        <MetricCard 
          title="TOTAL SESSIONS"
          value={workouts.length}
          unit="logged"
          icon={Dumbbell}
          color="var(--accent-purple)"
        />
        <MetricCard 
          title="TOTAL DURATION"
          value={totalMinutes}
          unit="mins"
          icon={Clock}
          color="var(--accent-cyan)"
        />
        <MetricCard 
          title="TOTAL CALORIES BURNED"
          value={totalBurned}
          unit="kcal"
          icon={Flame}
          color="var(--accent)"
        />
        <MetricCard 
          title="AVG INTENSITY"
          value={workouts.length > 0 ? 'Optimal' : '--'}
          subtitle="Resistance & Cardio Balance"
          icon={Activity}
          color="var(--accent-amber)"
        />
      </div>

      {/* Filter & Search Bar */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Filter Category:</span>
          {['All', 'Cardio', 'Strength', 'HIIT', 'Yoga', 'Core'].map(cat => (
            <button
              key={cat}
              className={`btn ${category === cat ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
              onClick={() => setCategory(cat)}
            >
              {cat}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <input 
            type="text"
            className="form-input"
            placeholder="Search exercises..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem', paddingRight: '1rem', fontSize: '0.875rem' }}
          />
          <div style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <Search size={15} />
          </div>
        </div>
      </div>

      {/* Workouts Grid */}
      {loading ? (
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => <div key={i} className="card" style={{ height: '160px' }} />)}
        </div>
      ) : workouts.length === 0 ? (
        <EmptyState 
          icon={Dumbbell}
          title="No workouts recorded"
          description="Log your daily running, lifting, or conditioning workouts to see your burn statistics."
          actionLabel="Log Your First Workout"
          onAction={openCreateModal}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {workouts.map(w => (
            <div key={w.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <div>
                    <span className="badge badge-purple" style={{ marginBottom: '0.35rem' }}>{w.exerciseType}</span>
                    <h3 style={{ fontSize: '1.15rem' }}>{w.exercise}</h3>
                  </div>
                  <span className="badge badge-success">{w.intensity || 'Medium'}</span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginTop: '1rem', padding: '0.75rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>DURATION</span>
                    <strong style={{ fontSize: '1rem' }}>{w.duration} min</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>CALORIES</span>
                    <strong style={{ fontSize: '1rem', color: 'var(--accent)' }}>{w.caloriesBurned} kcal</strong>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.85rem', marginTop: '1rem' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Calendar size={13} /> {new Date(w.date).toLocaleDateString()}
                </span>
                <div style={{ display: 'flex', gap: '0.4rem' }}>
                  <button className="btn-icon" onClick={() => openEditModal(w)} title="Edit workout">
                    <Edit2 size={15} />
                  </button>
                  <button className="btn-icon" onClick={() => setDeleteTargetId(w.id)} style={{ color: 'var(--accent-rose)' }} title="Delete workout">
                    <Trash2 size={15} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingWorkout ? 'Edit Workout Entry' : 'Log New Workout'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Exercise Name</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Morning 5K Run or Bench Press"
                  value={form.exercise}
                  onChange={e => setForm({ ...form, exercise: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Type / Category</label>
                  <select 
                    className="form-select"
                    value={form.exerciseType}
                    onChange={e => setForm({ ...form, exerciseType: e.target.value })}
                  >
                    <option value="Cardio">Cardio</option>
                    <option value="Strength">Strength</option>
                    <option value="HIIT">HIIT</option>
                    <option value="Yoga">Yoga</option>
                    <option value="Core">Core</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Intensity</label>
                  <select 
                    className="form-select"
                    value={form.intensity}
                    onChange={e => setForm({ ...form, intensity: e.target.value })}
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Duration (Minutes)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="1"
                    max="600"
                    value={form.duration}
                    onChange={e => setForm({ ...form, duration: Number(e.target.value) })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Calories Burned (kcal)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="1"
                    max="5000"
                    value={form.caloriesBurned}
                    onChange={e => setForm({ ...form, caloriesBurned: Number(e.target.value) })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">Date</label>
                <input 
                  type="date" 
                  className="form-input" 
                  value={form.date}
                  onChange={e => setForm({ ...form, date: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setIsModalOpen(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  {editingWorkout ? 'Save Changes' : 'Record Workout'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal 
        isOpen={Boolean(deleteTargetId)}
        title="Delete Workout"
        message="Are you sure you want to delete this workout record? This will remove its calories from your totals."
        confirmLabel="Delete Workout"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
