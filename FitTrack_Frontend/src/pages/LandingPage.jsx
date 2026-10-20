import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Hero3D from '../components/Hero3D';
import { 
  Activity, ArrowRight, ShieldCheck, Flame, Utensils, 
  Droplets, Award, PlaySquare, CheckCircle2 
} from 'lucide-react';
import '../styles/landing.css';

export default function LandingPage() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="landing-page">
      {/* Navigation */}
      <header className="landing-nav">
        <div className="brand-container">
          <div className="brand-icon-wrapper">
            <Activity size={22} />
          </div>
          <span>FITTRACK</span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {isAuthenticated ? (
            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
              Open Dashboard <ArrowRight size={16} />
            </button>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                Sign In
              </Link>
              <Link to="/register" className="btn btn-primary">
                Get Started <ArrowRight size={16} />
              </Link>
            </>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">
            <Flame size={15} /> Next-Gen Health Intelligence
          </div>

          <h1 className="hero-title">
            YOUR FITNESS.<br />
            YOUR DATA.<br />
            <span>YOUR PROGRESS.</span>
          </h1>

          <p className="hero-description">
            Experience complete control over your health. FitTrack brings real-time 
            biometrics, calorie tracking, hydration goals, and BMI-driven fitness plans 
            together in a secure, full-stack architecture.
          </p>

          <div className="hero-actions">
            <Link to="/register" className="btn btn-primary" style={{ padding: '0.85rem 1.75rem', fontSize: '1.05rem' }}>
              Start Tracking Now <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '0.85rem 1.5rem' }}>
              Sign In to Account
            </Link>
          </div>

          <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="var(--accent)" /> Entity Framework 6 & MySQL
            </span>
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} color="var(--accent)" /> Session-based Security
            </span>
          </div>
        </div>

        {/* 3D Scene Container */}
        <div className="hero-canvas-wrapper">
          <Hero3D />

          {/* Floating Stat Card 1 */}
          <div className="floating-card card-top">
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.2)', color: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Flame size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Burn</div>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>640 kcal</strong>
            </div>
          </div>

          {/* Floating Stat Card 2 */}
          <div className="floating-card card-bottom">
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.2)', color: 'var(--accent-cyan)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Droplets size={20} />
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Hydration Goal</div>
              <strong style={{ fontSize: '1.1rem', color: 'var(--text-primary)' }}>2,500 ml</strong>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="features-section">
        <div className="section-tagline">
          <p className="badge badge-success" style={{ marginBottom: '1rem' }}>ARCHITECTURE & CAPABILITIES</p>
          <h2>Precision Tools For Your Health Journey</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Engineered from database to user interface for optimal performance, strict user isolation, and intuitive tracking.
          </p>
        </div>

        <div className="feature-cards-grid">
          <div className="feature-card">
            <div className="feature-icon-box">
              <Utensils size={26} />
            </div>
            <h3>Macro & Meal Logging</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.6 }}>
              Log breakfast, lunch, dinner, and snacks with accurate calorie breakdowns and daily macro targets.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box" style={{ background: 'rgba(6, 182, 212, 0.15)', color: 'var(--accent-cyan)' }}>
              <Activity size={26} />
            </div>
            <h3>BMI Analytics & Gauge</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.6 }}>
              Calculate body mass index, view color-coded category scales, and track your weight history over time.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box" style={{ background: 'rgba(59, 130, 246, 0.15)', color: 'var(--accent-blue)' }}>
              <Droplets size={26} />
            </div>
            <h3>Hydration Milestones</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.6 }}>
              Quick-add preset water amounts with one tap and monitor your daily hydration progress ring.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box" style={{ background: 'rgba(245, 158, 11, 0.15)', color: 'var(--accent-amber)' }}>
              <Award size={26} />
            </div>
            <h3>Gamified Milestones</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.6 }}>
              Unlock achievement badges from real logged workouts, daily streaks, and target completions.
            </p>
          </div>

          <div className="feature-card">
            <div className="feature-icon-box" style={{ background: 'rgba(139, 92, 246, 0.15)', color: 'var(--accent-purple)' }}>
              <Flame size={26} />
            </div>
            <h3>BMI-Tailored Plans</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.6 }}>
              Receive personalized diet and workout recommendations engineered specifically for your BMI category.
            </p>
          </div>

          <div className="feature-card" style={{ gridColumn: 'span 2' }}>
            <div className="feature-icon-box" style={{ background: 'rgba(16, 185, 129, 0.15)', color: 'var(--accent)' }}>
              <Flame size={26} />
            </div>
            <h3>3D Kinetic Fitness Intelligence</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', lineHeight: 1.6 }}>
              Experience your health through interactive 3D energy cores, orbital progress globes, 
              milestone runway journeys, anatomical muscle distribution mannequins, and an adaptive 
              7-day schedule computed deterministically from your verified database activity.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '3rem 4rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
        <p>© {new Date().getFullYear()} FitTrack System. Full-Stack React.js + ASP.NET MVC + MySQL Architecture.</p>
      </footer>
    </div>
  );
}
