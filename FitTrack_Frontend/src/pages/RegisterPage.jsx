import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Mail, Lock, User, Calendar, Ruler, Weight, ArrowRight } from 'lucide-react';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    age: 26,
    gender: 'Male',
    height: 175,
    weight: 70
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'age' || name === 'height' || name === 'weight' ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.password) {
      toast.error('Name, email, and password are required.');
      return;
    }

    if (formData.password.length < 6) {
      toast.error('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      toast.success('Account created successfully! Welcome to FitTrack.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '2rem 1.5rem',
      background: 'radial-gradient(circle at 50% 10%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), var(--bg-primary)'
    }}>
      <div className="card" style={{ maxWidth: '520px', width: '100%', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
            <div className="brand-icon-wrapper" style={{ width: '42px', height: '42px' }}>
              <Activity size={24} />
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>FITTRACK</span>
          </Link>
          <h2>Create Your Account</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            Join FitTrack to start tracking biometrics, meals, workouts, and health goals.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="text" 
                name="name"
                className="form-input" 
                placeholder="Alex Mercer"
                value={formData.name}
                onChange={handleChange}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <User size={16} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                name="email"
                className="form-input" 
                placeholder="alex@example.com"
                value={formData.email}
                onChange={handleChange}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Mail size={16} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password (Min 6 Characters)</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                name="password"
                className="form-input" 
                placeholder="••••••••"
                value={formData.password}
                onChange={handleChange}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={16} />
              </div>
            </div>
          </div>

          {/* Biometrics Row */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Age</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  name="age"
                  className="form-input" 
                  min="12"
                  max="120"
                  value={formData.age}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Calendar size={16} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Gender</label>
              <select 
                name="gender" 
                className="form-select" 
                value={formData.gender} 
                onChange={handleChange}
              >
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Height (cm)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  name="height"
                  className="form-input" 
                  min="50"
                  max="250"
                  value={formData.height}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Ruler size={16} />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Weight (kg)</label>
              <div style={{ position: 'relative' }}>
                <input 
                  type="number" 
                  name="weight"
                  className="form-input" 
                  min="30"
                  max="300"
                  value={formData.weight}
                  onChange={handleChange}
                  style={{ paddingLeft: '2.5rem' }}
                />
                <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                  <Weight size={16} />
                </div>
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem' }}
            disabled={loading}
          >
            {loading ? 'Creating Account...' : 'Complete Registration'} <ArrowRight size={16} />
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
