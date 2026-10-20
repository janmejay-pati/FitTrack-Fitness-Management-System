import React, { useState, useEffect } from 'react';
import waterService from '../services/waterService';
import MetricCard from '../components/MetricCard';
import { Droplets, Plus, Trash2, CheckCircle2, Flame, Award, Clock } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import toast from 'react-hot-toast';

export default function WaterPage() {
  const [todayData, setTodayData] = useState({ totalToday: 0, goal: 2500, progressPercentage: 0, logs: [] });
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [customAmount, setCustomAmount] = useState('');

  const fetchWater = async () => {
    try {
      const [today, hist] = await Promise.all([
        waterService.getToday(),
        waterService.getHistory()
      ]);
      setTodayData(today);
      setHistory(hist || []);
    } catch {
      toast.error('Failed to load hydration data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWater();
  }, []);

  const handleAddWater = async (amount) => {
    if (amount <= 0) return;
    try {
      await waterService.addWater(amount);
      toast.success(`+${amount}ml water logged!`);
      setCustomAmount('');
      fetchWater();
    } catch (err) {
      toast.error(err.message || 'Error logging water');
    }
  };

  const handleDelete = async (id) => {
    try {
      await waterService.deleteWater(id);
      toast.success('Water log removed');
      fetchWater();
    } catch (err) {
      toast.error(err.message || 'Error deleting log');
    }
  };

  const { totalToday, goal, progressPercentage, logs } = todayData;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1><Droplets size={28} color="var(--accent-blue)" /> Daily Hydration Tracker</h1>
          <p className="page-subtitle">Log your fluid intake, maintain hydration milestones, and support metabolic recovery.</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div className="stats-grid">
        <MetricCard 
          title="TODAY'S INTAKE"
          value={totalToday}
          unit="ml"
          subtitle={`${Math.round(totalToday / 250)} standard cups`}
          icon={Droplets}
          color="var(--accent-blue)"
          progress={progressPercentage}
        />
        <MetricCard 
          title="DAILY TARGET"
          value={goal}
          unit="ml"
          subtitle="Recommended baseline"
          icon={CheckCircle2}
          color="var(--accent-cyan)"
        />
        <MetricCard 
          title="COMPLETION RATE"
          value={`${progressPercentage}%`}
          subtitle={progressPercentage >= 100 ? 'Goal achieved today! 🎉' : 'Keep hydrating!'}
          icon={Award}
          color="var(--accent)"
        />
        <MetricCard 
          title="REMAINING TO GOAL"
          value={Math.max(0, goal - totalToday)}
          unit="ml"
          subtitle="Stay on track"
          icon={Flame}
          color="var(--accent-purple)"
        />
      </div>

      {/* Quick Add & Visual Ring Section */}
      <div className="content-grid-2">
        {/* Quick Add Card */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Plus size={20} />
            </div>
            <div>
              <h3>Log Water Intake</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Select preset amount or enter custom volume</p>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
            {[250, 500, 750, 1000].map(amount => (
              <button
                key={amount}
                className="btn btn-secondary"
                style={{ padding: '1rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.35rem' }}
                onClick={() => handleAddWater(amount)}
              >
                <Droplets size={22} color="var(--accent-blue)" />
                <strong style={{ fontSize: '1.05rem' }}>+{amount} ml</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {amount === 250 ? 'Small Glass' : amount === 500 ? 'Water Bottle' : amount === 750 ? 'Sports Bottle' : 'Large Flask'}
                </span>
              </button>
            ))}
          </div>

          <form onSubmit={e => { e.preventDefault(); handleAddWater(Number(customAmount)); }} style={{ display: 'flex', gap: '0.75rem' }}>
            <input 
              type="number"
              className="form-input"
              placeholder="Custom amount (ml)..."
              min="50"
              max="3000"
              value={customAmount}
              onChange={e => setCustomAmount(e.target.value)}
              required
            />
            <button type="submit" className="btn btn-primary" style={{ flexShrink: 0 }}>
              <Plus size={16} /> Add
            </button>
          </form>
        </div>

        {/* 7-Day History Chart */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
            <div>
              <h3>7-Day Intake Trend</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Daily consumption in milliliters</p>
            </div>
            <span className="badge badge-info">Hydration</span>
          </div>

          <div style={{ width: '100%', height: '240px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                <XAxis dataKey="day" stroke="var(--text-muted)" fontSize={12} />
                <YAxis stroke="var(--text-muted)" fontSize={12} />
                <Tooltip 
                  contentStyle={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: '8px' }} 
                  labelStyle={{ color: 'var(--text-primary)', fontWeight: 600 }}
                />
                <Bar dataKey="amount" name="Water (ml)" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Today's Individual Logs */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
          <h3>Today's Hydration Entries</h3>
          <span className="badge badge-cyan">{logs.length} logged entries</span>
        </div>

        {logs.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            No water logged yet today. Click one of the quick buttons above to record your first glass!
          </p>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
            {logs.map(log => (
              <div key={log.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.85rem 1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                  <Droplets size={18} color="var(--accent-blue)" />
                  <div>
                    <strong style={{ fontSize: '1rem', display: 'block' }}>{log.amount} ml</strong>
                    <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{log.time}</span>
                  </div>
                </div>
                <button 
                  className="btn-icon" 
                  onClick={() => handleDelete(log.id)} 
                  style={{ color: 'var(--accent-rose)' }} 
                  title="Delete entry"
                >
                  <Trash2 size={15} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
