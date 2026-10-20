import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldAlert, Users, Dumbbell, Utensils, Video, Bell, 
  Trash2, Plus, Edit2, CheckCircle2, AlertTriangle, Send, RefreshCw, X
} from 'lucide-react';
import toast from 'react-hot-toast';
import adminService from '../services/adminService';
import dietPlanService from '../services/dietPlanService';
import workoutPlanService from '../services/workoutPlanService';
import tutorialService from '../services/tutorialService';
import ConfirmModal from '../components/ConfirmModal';

export default function AdminPage() {
  const [activeTab, setActiveTab] = useState('users'); // users, diet, workouts, tutorials, broadcast
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [dietPlans, setDietPlans] = useState([]);
  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [tutorials, setTutorials] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals & form state
  const [confirmDelete, setConfirmDelete] = useState({ isOpen: false, type: '', id: null, name: '' });
  const [dietModal, setDietModal] = useState({ isOpen: false, data: null });
  const [workoutModal, setWorkoutModal] = useState({ isOpen: false, data: null });
  const [tutorialModal, setTutorialModal] = useState({ isOpen: false, data: null });

  // Broadcast Notification Form
  const [broadcastForm, setBroadcastForm] = useState({ title: '', message: '', type: 'info' });
  const [sendingBroadcast, setSendingBroadcast] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [statsRes, usersRes, dietsRes, workoutsRes, tutsRes] = await Promise.all([
        adminService.getStats(),
        adminService.getUsers(),
        dietPlanService.getDietPlans(),
        workoutPlanService.getWorkoutPlans(),
        tutorialService.get()
      ]);

      setStats(statsRes?.data || statsRes);
      setUsers(Array.isArray(usersRes) ? usersRes : (usersRes?.data || []));
      setDietPlans(Array.isArray(dietsRes) ? dietsRes : (dietsRes?.data || []));
      setWorkoutPlans(Array.isArray(workoutsRes) ? workoutsRes : (workoutsRes?.data || []));
      setTutorials(Array.isArray(tutsRes) ? tutsRes : (tutsRes?.data || []));
    } catch (err) {
      toast.error('Failed to load administrative management console');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Delete Handlers
  const handleDeleteConfirm = async () => {
    const { type, id } = confirmDelete;
    try {
      if (type === 'user') await adminService.deleteUser(id);
      else if (type === 'diet') await adminService.deleteDietPlan(id);
      else if (type === 'workout') await adminService.deleteWorkoutPlan(id);
      else if (type === 'tutorial') await adminService.deleteTutorial(id);

      toast.success('Item deleted successfully');
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error executing delete');
    } finally {
      setConfirmDelete({ isOpen: false, type: '', id: null, name: '' });
    }
  };

  // Diet Plan Save
  const handleSaveDiet = async (e) => {
    e.preventDefault();
    try {
      await adminService.saveDietPlan(dietModal.data);
      toast.success('Diet plan saved successfully');
      setDietModal({ isOpen: false, data: null });
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error saving diet plan');
    }
  };

  // Workout Plan Save
  const handleSaveWorkout = async (e) => {
    e.preventDefault();
    try {
      await adminService.saveWorkoutPlan(workoutModal.data);
      toast.success('Workout plan saved successfully');
      setWorkoutModal({ isOpen: false, data: null });
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error saving workout plan');
    }
  };

  // Tutorial Save
  const handleSaveTutorial = async (e) => {
    e.preventDefault();
    try {
      await adminService.saveTutorial(tutorialModal.data);
      toast.success('Tutorial saved successfully');
      setTutorialModal({ isOpen: false, data: null });
      loadData();
    } catch (err) {
      toast.error(err.message || 'Error saving tutorial');
    }
  };

  // Broadcast Handler
  const handleBroadcast = async (e) => {
    e.preventDefault();
    if (!broadcastForm.title || !broadcastForm.message) {
      toast.error('Please enter both title and message');
      return;
    }

    try {
      setSendingBroadcast(true);
      await adminService.broadcastNotification(broadcastForm);
      toast.success('Announcement broadcast successfully');
      setBroadcastForm({ title: '', message: '', type: 'info' });
    } catch (err) {
      toast.error(err.message || 'Error sending broadcast');
    } finally {
      setSendingBroadcast(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-title-group">
          <h1><ShieldAlert style={{ color: '#ef4444' }} /> System Administration</h1>
          <p className="page-subtitle">Global user governance, fitness curriculum editing, and system broadcasts</p>
        </div>
        <button className="btn btn-secondary" onClick={loadData} disabled={loading}>
          <RefreshCw size={16} className={loading ? 'spin' : ''} /> Refresh Data
        </button>
      </div>

      {/* Top Metrics Cards */}
      {stats && (
        <div className="stats-grid">
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Total Members</p>
                <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>{stats.totalUsers}</h2>
              </div>
              <Users size={28} style={{ color: 'var(--accent)' }} />
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Workouts Logged</p>
                <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>{stats.totalWorkouts}</h2>
              </div>
              <Dumbbell size={28} style={{ color: 'var(--accent-cyan)' }} />
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Curated Regimens</p>
                <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>{stats.totalPlans}</h2>
              </div>
              <Utensils size={28} style={{ color: '#f59e0b' }} />
            </div>
          </div>
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Video Library</p>
                <h2 style={{ fontSize: '1.75rem', marginTop: '0.25rem' }}>{stats.totalTutorials}</h2>
              </div>
              <Video size={28} style={{ color: '#8b5cf6' }} />
            </div>
          </div>
        </div>
      )}

      {/* Navigation Tabs */}
      <div style={{
        display: 'flex',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0.5rem',
        marginBottom: '1.5rem',
        overflowX: 'auto'
      }}>
        <button
          onClick={() => setActiveTab('users')}
          className={`btn ${activeTab === 'users' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.5rem' }}
        >
          <Users size={16} /> User Registry ({users.length})
        </button>
        <button
          onClick={() => setActiveTab('diet')}
          className={`btn ${activeTab === 'diet' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.5rem' }}
        >
          <Utensils size={16} /> Diet Plans ({dietPlans.length})
        </button>
        <button
          onClick={() => setActiveTab('workouts')}
          className={`btn ${activeTab === 'workouts' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.5rem' }}
        >
          <Dumbbell size={16} /> Workout Routines ({workoutPlans.length})
        </button>
        <button
          onClick={() => setActiveTab('tutorials')}
          className={`btn ${activeTab === 'tutorials' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.5rem' }}
        >
          <Video size={16} /> Video Hub ({tutorials.length})
        </button>
        <button
          onClick={() => setActiveTab('broadcast')}
          className={`btn ${activeTab === 'broadcast' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ gap: '0.5rem' }}
        >
          <Bell size={16} /> Broadcast Notifications
        </button>
      </div>

      {/* TAB 1: USERS */}
      {activeTab === 'users' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ padding: '0', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-tertiary)', color: 'var(--text-secondary)' }}>
                <th style={{ padding: '1rem' }}>User ID</th>
                <th style={{ padding: '1rem' }}>Name</th>
                <th style={{ padding: '1rem' }}>Email</th>
                <th style={{ padding: '1rem' }}>Role</th>
                <th style={{ padding: '1rem' }}>Biometrics</th>
                <th style={{ padding: '1rem' }}>Registered</th>
                <th style={{ padding: '1rem', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} style={{ borderBottom: '1px solid var(--border)' }}>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>#{u.id}</td>
                  <td style={{ padding: '1rem', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className={`badge ${u.role === 'Admin' ? 'badge-danger' : 'badge-success'}`}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {u.height ? `${u.height}cm` : '--'} / {u.weight ? `${u.weight}kg` : '--'}
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                    {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'N/A'}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    {u.role !== 'Admin' && (
                      <button
                        className="btn btn-danger"
                        style={{ padding: '0.35rem 0.65rem', fontSize: '0.8rem' }}
                        onClick={() => setConfirmDelete({ isOpen: true, type: 'user', id: u.id, name: u.name })}
                      >
                        <Trash2 size={14} /> Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </motion.div>
      )}

      {/* TAB 2: DIET PLANS */}
      {activeTab === 'diet' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => setDietModal({
                isOpen: true,
                data: { planName: '', description: '', mealType: 'Lunch', bmiCategory: 'Normal', calories: 2000, isActive: true }
              })}
            >
              <Plus size={16} /> Add Diet Plan
            </button>
          </div>

          <div className="content-grid-3">
            {dietPlans.map(plan => (
              <div key={plan.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="badge badge-cyan">{plan.bmiCategory}</span>
                  <span className="badge badge-purple">{plan.mealType}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{plan.planName}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', flex: 1, marginBottom: '1rem' }}>
                  {plan.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 600, color: '#f59e0b', fontSize: '0.9rem' }}>{plan.calories} kcal</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-icon"
                      onClick={() => setDietModal({ isOpen: true, data: { ...plan } })}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn-icon"
                      style={{ color: '#ef4444' }}
                      onClick={() => setConfirmDelete({ isOpen: true, type: 'diet', id: plan.id, name: plan.planName })}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB 3: WORKOUT PLANS */}
      {activeTab === 'workouts' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => setWorkoutModal({
                isOpen: true,
                data: { planName: '', description: '', intensityLevel: 'Medium', bmiCategory: 'Normal', durationMinutes: 45, isActive: true }
              })}
            >
              <Plus size={16} /> Add Workout Routine
            </button>
          </div>

          <div className="content-grid-3">
            {workoutPlans.map(plan => (
              <div key={plan.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="badge badge-cyan">{plan.bmiCategory}</span>
                  <span className="badge badge-warning">{plan.intensityLevel}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{plan.planName}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', flex: 1, marginBottom: '1rem' }}>
                  {plan.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontWeight: 600, color: 'var(--accent)', fontSize: '0.9rem' }}>{plan.durationMinutes} mins</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-icon"
                      onClick={() => setWorkoutModal({ isOpen: true, data: { ...plan } })}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn-icon"
                      style={{ color: '#ef4444' }}
                      onClick={() => setConfirmDelete({ isOpen: true, type: 'workout', id: plan.id, name: plan.planName })}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB 4: VIDEO TUTORIALS */}
      {activeTab === 'tutorials' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
            <button
              className="btn btn-primary"
              onClick={() => setTutorialModal({
                isOpen: true,
                data: { title: '', description: '', videoUrl: '', thumbnailUrl: '', category: 'Workout', duration: '15 min' }
              })}
            >
              <Plus size={16} /> Add Video Tutorial
            </button>
          </div>

          <div className="content-grid-3">
            {tutorials.map(tut => (
              <div key={tut.id} className="card" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                  <span className="badge badge-purple">{tut.category}</span>
                  <span className="badge" style={{ background: 'var(--bg-tertiary)', color: 'var(--text-muted)' }}>{tut.duration}</span>
                </div>
                <h3 style={{ fontSize: '1.15rem', marginBottom: '0.5rem' }}>{tut.title}</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', flex: 1, marginBottom: '1rem' }}>
                  {tut.description}
                </p>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '160px' }}>
                    {tut.videoUrl}
                  </span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn-icon"
                      onClick={() => setTutorialModal({ isOpen: true, data: { ...tut } })}
                    >
                      <Edit2 size={14} />
                    </button>
                    <button
                      className="btn-icon"
                      style={{ color: '#ef4444' }}
                      onClick={() => setConfirmDelete({ isOpen: true, type: 'tutorial', id: tut.id, name: tut.title })}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* TAB 5: BROADCAST NOTIFICATIONS */}
      {activeTab === 'broadcast' && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="card" style={{ maxWidth: '640px', margin: '0 auto' }}>
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Bell size={20} style={{ color: 'var(--accent)' }} /> System-wide User Announcement
          </h3>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Deliver notifications directly to the in-app notification bell of every registered athlete in the database.
          </p>

          <form onSubmit={handleBroadcast}>
            <div className="form-group">
              <label className="form-label">Notification Title</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Summer Fitness Sprint Challenge!"
                value={broadcastForm.title}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Alert Severity / Type</label>
              <select
                className="form-select"
                value={broadcastForm.type}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, type: e.target.value })}
              >
                <option value="info">Info (Blue)</option>
                <option value="success">Success (Emerald)</option>
                <option value="warning">Warning (Amber)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Broadcast Message Content</label>
              <textarea
                className="form-textarea"
                rows="4"
                placeholder="Write your announcement details here..."
                value={broadcastForm.message}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, message: e.target.value })}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              disabled={sendingBroadcast}
              style={{ width: '100%', marginTop: '0.5rem' }}
            >
              <Send size={16} /> {sendingBroadcast ? 'Broadcasting...' : 'Broadcast to All Members'}
            </button>
          </form>
        </motion.div>
      )}

      {/* Confirmation Modal for Deletions */}
      <ConfirmModal
        isOpen={confirmDelete.isOpen}
        onClose={() => setConfirmDelete({ isOpen: false, type: '', id: null, name: '' })}
        onConfirm={handleDeleteConfirm}
        title={`Delete ${confirmDelete.type}?`}
        message={`Are you sure you want to permanently delete "${confirmDelete.name}"? This action cannot be undone.`}
      />

      {/* Diet Plan Modal */}
      <AnimatePresence>
        {dietModal.isOpen && (
          <div className="modal-overlay" onClick={() => setDietModal({ isOpen: false, data: null })}>
            <motion.div className="modal-content" onClick={(e) => e.stopPropagation()} initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <div className="modal-header">
                <h3>{dietModal.data?.id ? 'Edit Diet Plan' : 'Create Diet Plan'}</h3>
                <button className="modal-close" onClick={() => setDietModal({ isOpen: false, data: null })}><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveDiet}>
                <div className="form-group">
                  <label className="form-label">Plan Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={dietModal.data?.planName || ''}
                    onChange={(e) => setDietModal({ ...dietModal, data: { ...dietModal.data, planName: e.target.value } })}
                    required
                  />
                </div>
                <div className="content-grid-2" style={{ gap: '1rem', marginBottom: '0' }}>
                  <div className="form-group">
                    <label className="form-label">Target BMI Category</label>
                    <select
                      className="form-select"
                      value={dietModal.data?.bmiCategory || 'Normal'}
                      onChange={(e) => setDietModal({ ...dietModal, data: { ...dietModal.data, bmiCategory: e.target.value } })}
                    >
                      <option value="Underweight">Underweight</option>
                      <option value="Normal">Normal</option>
                      <option value="Overweight">Overweight</option>
                      <option value="Obese">Obese</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Meal Type</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Lunch, High-Protein"
                      value={dietModal.data?.mealType || ''}
                      onChange={(e) => setDietModal({ ...dietModal, data: { ...dietModal.data, mealType: e.target.value } })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Target Calories (kcal)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={dietModal.data?.calories || ''}
                    onChange={(e) => setDietModal({ ...dietModal, data: { ...dietModal.data, calories: parseInt(e.target.value, 10) } })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Plan Description & Breakdown</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={dietModal.data?.description || ''}
                    onChange={(e) => setDietModal({ ...dietModal, data: { ...dietModal.data, description: e.target.value } })}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Diet Plan</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Workout Plan Modal */}
      <AnimatePresence>
        {workoutModal.isOpen && (
          <div className="modal-overlay" onClick={() => setWorkoutModal({ isOpen: false, data: null })}>
            <motion.div className="modal-content" onClick={(e) => e.stopPropagation()} initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <div className="modal-header">
                <h3>{workoutModal.data?.id ? 'Edit Workout Routine' : 'Create Workout Routine'}</h3>
                <button className="modal-close" onClick={() => setWorkoutModal({ isOpen: false, data: null })}><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveWorkout}>
                <div className="form-group">
                  <label className="form-label">Routine Name</label>
                  <input
                    type="text"
                    className="form-input"
                    value={workoutModal.data?.planName || ''}
                    onChange={(e) => setWorkoutModal({ ...workoutModal, data: { ...workoutModal.data, planName: e.target.value } })}
                    required
                  />
                </div>
                <div className="content-grid-2" style={{ gap: '1rem', marginBottom: '0' }}>
                  <div className="form-group">
                    <label className="form-label">Target BMI Category</label>
                    <select
                      className="form-select"
                      value={workoutModal.data?.bmiCategory || 'Normal'}
                      onChange={(e) => setWorkoutModal({ ...workoutModal, data: { ...workoutModal.data, bmiCategory: e.target.value } })}
                    >
                      <option value="Underweight">Underweight</option>
                      <option value="Normal">Normal</option>
                      <option value="Overweight">Overweight</option>
                      <option value="Obese">Obese</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Intensity Level</label>
                    <select
                      className="form-select"
                      value={workoutModal.data?.intensityLevel || 'Medium'}
                      onChange={(e) => setWorkoutModal({ ...workoutModal, data: { ...workoutModal.data, intensityLevel: e.target.value } })}
                    >
                      <option value="Low">Low</option>
                      <option value="Medium">Medium</option>
                      <option value="High">High</option>
                    </select>
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Duration (Minutes)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={workoutModal.data?.durationMinutes || ''}
                    onChange={(e) => setWorkoutModal({ ...workoutModal, data: { ...workoutModal.data, durationMinutes: parseInt(e.target.value, 10) } })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Routine Description & Exercises</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={workoutModal.data?.description || ''}
                    onChange={(e) => setWorkoutModal({ ...workoutModal, data: { ...workoutModal.data, description: e.target.value } })}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Workout Plan</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Tutorial Modal */}
      <AnimatePresence>
        {tutorialModal.isOpen && (
          <div className="modal-overlay" onClick={() => setTutorialModal({ isOpen: false, data: null })}>
            <motion.div className="modal-content" onClick={(e) => e.stopPropagation()} initial={{ scale: 0.95 }} animate={{ scale: 1 }} exit={{ scale: 0.95 }}>
              <div className="modal-header">
                <h3>{tutorialModal.data?.id ? 'Edit Video Tutorial' : 'Create Video Tutorial'}</h3>
                <button className="modal-close" onClick={() => setTutorialModal({ isOpen: false, data: null })}><X size={20} /></button>
              </div>
              <form onSubmit={handleSaveTutorial}>
                <div className="form-group">
                  <label className="form-label">Tutorial Title</label>
                  <input
                    type="text"
                    className="form-input"
                    value={tutorialModal.data?.title || ''}
                    onChange={(e) => setTutorialModal({ ...tutorialModal, data: { ...tutorialModal.data, title: e.target.value } })}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Video URL (YouTube or Direct)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={tutorialModal.data?.videoUrl || ''}
                    onChange={(e) => setTutorialModal({ ...tutorialModal, data: { ...tutorialModal.data, videoUrl: e.target.value } })}
                    required
                  />
                </div>
                <div className="content-grid-2" style={{ gap: '1rem', marginBottom: '0' }}>
                  <div className="form-group">
                    <label className="form-label">Category</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Strength, Cardio"
                      value={tutorialModal.data?.category || ''}
                      onChange={(e) => setTutorialModal({ ...tutorialModal, data: { ...tutorialModal.data, category: e.target.value } })}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Estimated Duration</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. 15 min"
                      value={tutorialModal.data?.duration || ''}
                      onChange={(e) => setTutorialModal({ ...tutorialModal, data: { ...tutorialModal.data, duration: e.target.value } })}
                    />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Thumbnail URL (Optional)</label>
                  <input
                    type="url"
                    className="form-input"
                    placeholder="https://..."
                    value={tutorialModal.data?.thumbnailUrl || ''}
                    onChange={(e) => setTutorialModal({ ...tutorialModal, data: { ...tutorialModal.data, thumbnailUrl: e.target.value } })}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-textarea"
                    rows="3"
                    value={tutorialModal.data?.description || ''}
                    onChange={(e) => setTutorialModal({ ...tutorialModal, data: { ...tutorialModal.data, description: e.target.value } })}
                  />
                </div>
                <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Save Tutorial</button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
