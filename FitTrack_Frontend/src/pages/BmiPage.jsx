import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import bmiService from '../services/bmiService';
import BmiGauge from '../components/BmiGauge';
import MetricCard from '../components/MetricCard';
import { Activity, Calculator, History, ArrowRight, CheckCircle2, Calendar, Scale, Ruler } from 'lucide-react';
import toast from 'react-hot-toast';

export default function BmiPage() {
  const navigate = useNavigate();

  const [latestBmi, setLatestBmi] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const [height, setHeight] = useState(175);
  const [weight, setWeight] = useState(70);
  const [calculating, setCalculating] = useState(false);

  const fetchBmiData = async () => {
    try {
      const [latest, hist] = await Promise.all([
        bmiService.getLatest(),
        bmiService.getHistory()
      ]);
      setLatestBmi(latest);
      setHistory(hist || []);
      if (latest) {
        if (latest.height) setHeight(latest.height);
        if (latest.weight) setWeight(latest.weight);
      }
    } catch {
      toast.error('Unable to fetch BMI records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBmiData();
  }, []);

  const handleCalculate = async (e) => {
    e.preventDefault();
    if (height <= 0 || weight <= 0) {
      toast.error('Please enter positive height and weight values');
      return;
    }

    setCalculating(true);
    try {
      const res = await bmiService.calculateAndSave(height, weight);
      setLatestBmi(res);
      toast.success(`BMI updated: ${res.bmiScore} (${res.category})`);
      fetchBmiData();
    } catch (err) {
      toast.error(err.message || 'Calculation failed');
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      {/* Header */}
      <div className="page-header">
        <div className="page-title-group">
          <h1><Activity size={28} color="var(--accent)" /> Body Mass Index (BMI) & Biometrics</h1>
          <p className="page-subtitle">Track your body composition, category classification, and personalized guidance.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button className="btn btn-secondary" onClick={() => navigate('/diet-plans')}>
            Recommended Diet <ArrowRight size={16} />
          </button>
          <button className="btn btn-primary" onClick={() => navigate('/workout-plans')}>
            Recommended Workouts <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {/* Main Grid: Calculator & Gauge */}
      <div className="content-grid-2">
        {/* Calculator Form */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: 'var(--radius-md)', background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Calculator size={20} />
            </div>
            <div>
              <h3>BMI Calculator</h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Enter height and weight to recalculate</p>
            </div>
          </div>

          <form onSubmit={handleCalculate}>
            <div className="form-group">
              <label className="form-label">Height (in Centimeters)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  className="form-input" 
                  min="50" 
                  max="250"
                  step="0.5"
                  value={height}
                  onChange={e => setHeight(Number(e.target.value))}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Ruler size={16} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Weight (in Kilograms)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  className="form-input" 
                  min="30" 
                  max="300"
                  step="0.5"
                  value={weight}
                  onChange={e => setWeight(Number(e.target.value))}
                  required
                  style={{ paddingLeft: '2.5rem' }}
                />
                <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Scale size={16} />
                </div>
              </div>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary" 
              style={{ width: '100%', marginTop: '1rem', padding: '0.8rem' }}
              disabled={calculating}
            >
              {calculating ? 'Calculating...' : 'Calculate & Record BMI'}
            </button>
          </form>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            <strong style={{ color: 'var(--text-primary)', display: 'block', marginBottom: '0.25rem' }}>Scientific Standard Formula:</strong>
            BMI = weight (kg) ÷ [height (m)]²
          </div>
        </div>

        {/* BMI Gauge & Category Card */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3>Current Health Status</h3>
              {latestBmi && (
                <span className="badge badge-success">
                  {latestBmi.category || 'Evaluated'}
                </span>
              )}
            </div>

            <BmiGauge 
              bmiScore={latestBmi ? latestBmi.bmiScore : 22.0} 
              category={latestBmi ? latestBmi.category : 'Normal'}
              color={latestBmi ? latestBmi.color : '#10b981'}
            />

            <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              <strong style={{ display: 'block', color: 'var(--text-primary)', marginBottom: '0.35rem' }}>Clinical Advice:</strong>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', lineHeight: 1.5 }}>
                {latestBmi?.healthStatus || 'Keep your weight in the optimal normal range through daily activity and balanced macronutrient nutrition.'}
              </p>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '1rem', marginTop: '1.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <span>Last Calculated:</span>
            <span>{latestBmi?.date ? new Date(latestBmi.date).toLocaleDateString() : 'Today'}</span>
          </div>
        </div>
      </div>

      {/* History Table */}
      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1.5rem' }}>
          <History size={20} color="var(--accent-cyan)" />
          <h3>BMI Progress Timeline</h3>
        </div>

        {history.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
            No previous BMI records found. Calculate your first score above.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)', color: 'var(--text-muted)', textTransform: 'uppercase', fontSize: '0.75rem', letterSpacing: '0.05em' }}>
                  <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Height</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Weight</th>
                  <th style={{ padding: '0.75rem 1rem' }}>BMI Score</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Category</th>
                  <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {history.map(item => (
                  <tr key={item.id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-muted)' }}>
                      {new Date(item.date).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>{item.height} cm</td>
                    <td style={{ padding: '0.85rem 1rem', fontWeight: 600 }}>{item.weight} kg</td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <strong style={{ color: item.color, fontSize: '1rem' }}>{item.bmiScore}</strong>
                    </td>
                    <td style={{ padding: '0.85rem 1rem' }}>
                      <span className="badge" style={{ background: `${item.color}20`, color: item.color }}>
                        {item.category}
                      </span>
                    </td>
                    <td style={{ padding: '0.85rem 1rem', color: 'var(--text-secondary)', maxWidth: '300px' }}>
                      {item.healthStatus}
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
