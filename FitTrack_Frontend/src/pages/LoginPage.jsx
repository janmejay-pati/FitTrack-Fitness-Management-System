import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Activity, Lock, Mail, Shield, ArrowRight, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const { login, adminLogin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [isAdminTab, setIsAdminTab] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const from = location.state?.from?.pathname || '/dashboard';

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all credentials');
      return;
    }

    setLoading(true);
    try {
      if (isAdminTab) {
        await adminLogin(email, password);
        toast.success('Administrator access granted');
        navigate('/admin');
      } else {
        await login(email, password);
        toast.success('Welcome back to FitTrack!');
        navigate(from, { replace: true });
      }
    } catch (err) {
      toast.error(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (role) => {
    if (role === 'admin') {
      setIsAdminTab(true);
      setEmail('admin@fittrack.com');
      setPassword('Admin@123');
    } else {
      setIsAdminTab(false);
      setEmail('alex@fittrack.com');
      setPassword('User@123');
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(circle at 50% 10%, rgba(16, 185, 129, 0.1) 0%, transparent 50%), var(--bg-primary)'
    }}>
      <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem 2rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
            <div className="brand-icon-wrapper" style={{ width: '42px', height: '42px' }}>
              <Activity size={24} />
            </div>
            <span style={{ fontSize: '1.4rem', fontWeight: 800 }}>FITTRACK</span>
          </Link>
          <h2>{isAdminTab ? 'Admin Console' : 'Welcome Back'}</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.35rem' }}>
            {isAdminTab ? 'Sign in with administrative privileges' : 'Sign in to access your personal dashboard'}
          </p>
        </div>

        {/* Tab switch */}
        <div style={{ display: 'flex', background: 'var(--bg-tertiary)', padding: '4px', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
          <button 
            type="button"
            className="btn" 
            style={{ 
              flex: 1, 
              padding: '0.45rem', 
              fontSize: '0.85rem',
              background: !isAdminTab ? 'var(--surface-solid)' : 'transparent',
              color: !isAdminTab ? 'var(--accent)' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)'
            }}
            onClick={() => setIsAdminTab(false)}
          >
            <User size={15} /> Member
          </button>
          <button 
            type="button"
            className="btn" 
            style={{ 
              flex: 1, 
              padding: '0.45rem', 
              fontSize: '0.85rem',
              background: isAdminTab ? 'var(--surface-solid)' : 'transparent',
              color: isAdminTab ? 'var(--accent)' : 'var(--text-secondary)',
              borderRadius: 'var(--radius-sm)'
            }}
            onClick={() => setIsAdminTab(true)}
          >
            <Shield size={15} /> Administrator
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="email" 
                className="form-input" 
                placeholder="name@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Mail size={16} />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <input 
                type="password" 
                className="form-input" 
                placeholder="••••••••"
                value={password}
                onChange={e => setPassword(e.target.value)}
                required
                style={{ paddingLeft: '2.5rem' }}
              />
              <div style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }}>
                <Lock size={16} />
              </div>
            </div>
          </div>

          <button 
            type="submit" 
            className="btn btn-primary" 
            style={{ width: '100%', marginTop: '0.75rem', padding: '0.8rem' }}
            disabled={loading}
          >
            {loading ? 'Authenticating...' : isAdminTab ? 'Sign In as Admin' : 'Sign In'} <ArrowRight size={16} />
          </button>
        </form>

        {/* Quick Fill Credentials Helper */}
        <div style={{ marginTop: '1.5rem', padding: '0.85rem', background: 'rgba(255,255,255,0.02)', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)', fontSize: '0.8rem' }}>
          <div style={{ fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '0.4rem' }}>Demo Accounts:</div>
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              onClick={() => fillDemo('member')}
            >
              Fill Member
            </button>
            <button 
              type="button" 
              className="btn btn-secondary" 
              style={{ fontSize: '0.75rem', padding: '0.3rem 0.6rem' }}
              onClick={() => fillDemo('admin')}
            >
              Fill Admin
            </button>
          </div>
        </div>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
          Don't have an account yet?{' '}
          <Link to="/register" style={{ color: 'var(--accent)', fontWeight: 600 }}>
            Create one free
          </Link>
        </p>
      </div>
    </div>
  );
}
