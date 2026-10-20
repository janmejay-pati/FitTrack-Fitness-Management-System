import React, { useState, useEffect } from 'react';
import mealService from '../services/mealService';
import MetricCard from '../components/MetricCard';
import EmptyState from '../components/EmptyState';
import ConfirmModal from '../components/ConfirmModal';
import { Utensils, Plus, Search, Edit2, Trash2, X, Coffee, Sun, Moon, Apple, Calendar } from 'lucide-react';
import toast from 'react-hot-toast';

export default function MealsPage() {
  const [meals, setMeals] = useState([]);
  const [summary, setSummary] = useState({ totalToday: 0, breakfast: 0, lunch: 0, dinner: 0, snacks: 0 });
  const [loading, setLoading] = useState(true);
  const [mealType, setMealType] = useState('All');
  const [search, setSearch] = useState('');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMeal, setEditingMeal] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);

  const [form, setForm] = useState({
    foodItems: '',
    calories: 450,
    mealType: 'Lunch',
    date: new Date().toISOString().split('T')[0]
  });

  const fetchMeals = async () => {
    try {
      const data = await mealService.getMyMeals(mealType, search);
      setMeals(data.meals || []);
      setSummary(data.summary || { totalToday: 0, breakfast: 0, lunch: 0, dinner: 0, snacks: 0 });
    } catch {
      toast.error('Failed to load meals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMeals();
  }, [mealType, search]);

  const openCreateModal = () => {
    setEditingMeal(null);
    setForm({
      foodItems: '',
      calories: 450,
      mealType: 'Lunch',
      date: new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const openEditModal = (m) => {
    setEditingMeal(m);
    setForm({
      foodItems: m.foodItems,
      calories: m.calories,
      mealType: m.mealType,
      date: m.date ? m.date.split('T')[0] : new Date().toISOString().split('T')[0]
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.foodItems.trim()) {
      toast.error('Food item is required');
      return;
    }

    try {
      if (editingMeal) {
        await mealService.update({ ...form, id: editingMeal.id });
        toast.success('Meal entry updated!');
      } else {
        await mealService.create(form);
        toast.success('Meal logged successfully!');
      }
      setIsModalOpen(false);
      fetchMeals();
    } catch (err) {
      toast.error(err.message || 'Error saving meal');
    }
  };

  const handleDelete = async () => {
    if (!deleteTargetId) return;
    try {
      await mealService.delete(deleteTargetId);
      toast.success('Meal log deleted');
      fetchMeals();
    } catch (err) {
      toast.error(err.message || 'Error deleting meal');
    }
  };

  const getMealIcon = (type) => {
    switch (type?.toLowerCase()) {
      case 'breakfast': return Coffee;
      case 'lunch': return Sun;
      case 'dinner': return Moon;
      case 'snacks': return Apple;
      default: return Utensils;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1><Utensils size={28} color="var(--accent-cyan)" /> Meals & Nutrition</h1>
          <p className="page-subtitle">Track dietary intake, meal timing, and daily calorie totals.</p>
        </div>

        <button className="btn btn-primary" onClick={openCreateModal}>
          <Plus size={18} /> Log Meal
        </button>
      </div>

      {/* 4 Summary Cards */}
      <div className="stats-grid">
        <MetricCard 
          title="TODAY'S TOTAL"
          value={summary.totalToday}
          unit="kcal"
          subtitle="All logged meals today"
          icon={Utensils}
          color="var(--accent)"
        />
        <MetricCard 
          title="BREAKFAST"
          value={summary.breakfast}
          unit="kcal"
          icon={Coffee}
          color="var(--accent-amber)"
        />
        <MetricCard 
          title="LUNCH"
          value={summary.lunch}
          unit="kcal"
          icon={Sun}
          color="var(--accent-cyan)"
        />
        <MetricCard 
          title="DINNER"
          value={summary.dinner}
          unit="kcal"
          icon={Moon}
          color="var(--accent-purple)"
        />
      </div>

      {/* Filter & Search */}
      <div className="card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '1rem 1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-muted)' }}>Meal Type:</span>
          {['All', 'Breakfast', 'Lunch', 'Dinner', 'Snacks'].map(t => (
            <button
              key={t}
              className={`btn ${mealType === t ? 'btn-primary' : 'btn-secondary'}`}
              style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
              onClick={() => setMealType(t)}
            >
              {t}
            </button>
          ))}
        </div>

        <div style={{ position: 'relative', width: '260px' }}>
          <input 
            type="text"
            className="form-input"
            placeholder="Search food items..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ paddingLeft: '2.4rem', fontSize: '0.875rem' }}
          />
          <div style={{ position: 'absolute', left: '0.8rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
            <Search size={15} />
          </div>
        </div>
      </div>

      {/* Meals List */}
      {loading ? (
        <div className="stats-grid">
          {[1, 2, 3, 4].map(i => <div key={i} className="card" style={{ height: '160px' }} />)}
        </div>
      ) : meals.length === 0 ? (
        <EmptyState 
          icon={Utensils}
          title="No meals logged"
          description="Log what you eat to keep track of your daily calories and nutritional balance."
          actionLabel="Log a Meal"
          onAction={openCreateModal}
        />
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
          {meals.map(m => {
            const MealIcon = getMealIcon(m.mealType);
            return (
              <div key={m.id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                    <span className="badge badge-cyan" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <MealIcon size={12} /> {m.mealType}
                    </span>
                    <strong style={{ fontSize: '1.25rem', color: 'var(--accent-cyan)' }}>
                      +{m.calories} kcal
                    </strong>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', marginTop: '0.5rem', lineHeight: 1.4 }}>
                    {m.foodItems}
                  </h3>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border)', paddingTop: '0.85rem', marginTop: '1.25rem' }}>
                  <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={13} /> {new Date(m.date).toLocaleDateString()}
                  </span>
                  <div style={{ display: 'flex', gap: '0.4rem' }}>
                    <button className="btn-icon" onClick={() => openEditModal(m)} title="Edit meal">
                      <Edit2 size={15} />
                    </button>
                    <button className="btn-icon" onClick={() => setDeleteTargetId(m.id)} style={{ color: 'var(--accent-rose)' }} title="Delete meal">
                      <Trash2 size={15} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editingMeal ? 'Edit Meal Log' : 'Log Food & Nutrition'}</h3>
              <button className="modal-close" onClick={() => setIsModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave}>
              <div className="form-group">
                <label className="form-label">Food Items & Description</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="e.g. Oatmeal with blueberries, whey protein shake"
                  value={form.foodItems}
                  onChange={e => setForm({ ...form, foodItems: e.target.value })}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                <div className="form-group">
                  <label className="form-label">Meal Type</label>
                  <select 
                    className="form-select"
                    value={form.mealType}
                    onChange={e => setForm({ ...form, mealType: e.target.value })}
                  >
                    <option value="Breakfast">Breakfast</option>
                    <option value="Lunch">Lunch</option>
                    <option value="Dinner">Dinner</option>
                    <option value="Snacks">Snacks</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">Calories (kcal)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    min="1"
                    max="10000"
                    value={form.calories}
                    onChange={e => setForm({ ...form, calories: Number(e.target.value) })}
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
                  {editingMeal ? 'Save Changes' : 'Record Meal'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmModal 
        isOpen={Boolean(deleteTargetId)}
        title="Delete Meal Log"
        message="Are you sure you want to delete this meal record? It will be removed from your daily calorie balance."
        confirmLabel="Delete Meal"
        confirmVariant="danger"
        onConfirm={handleDelete}
        onClose={() => setDeleteTargetId(null)}
      />
    </div>
  );
}
