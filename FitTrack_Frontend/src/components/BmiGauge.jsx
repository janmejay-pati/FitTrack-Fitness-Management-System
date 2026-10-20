import React from 'react';

export default function BmiGauge({ bmiScore = 22.5, category = 'Normal', color = '#10b981' }) {
  // BMI scale typically visually ranges from 15 to 35
  const minBmi = 15;
  const maxBmi = 35;
  const normalized = Math.max(minBmi, Math.min(maxBmi, bmiScore));
  const percentage = ((normalized - minBmi) / (maxBmi - minBmi)) * 100;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', padding: '1rem 0' }}>
      {/* Visual Bar with Colored Ranges */}
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '380px',
        height: '14px',
        borderRadius: 'var(--radius-full)',
        background: 'linear-gradient(to right, #3b82f6 0%, #3b82f6 20%, #10b981 20%, #10b981 50%, #f59e0b 50%, #f59e0b 75%, #ef4444 75%, #ef4444 100%)',
        marginBottom: '1rem',
        boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.3)'
      }}>
        {/* Needle indicator */}
        <div style={{
          position: 'absolute',
          top: '-6px',
          left: `${percentage}%`,
          transform: 'translateX(-50%)',
          width: '8px',
          height: '26px',
          background: '#ffffff',
          borderRadius: '4px',
          boxShadow: '0 0 8px rgba(0,0,0,0.6)',
          border: '2px solid var(--bg-primary)'
        }} />
      </div>

      {/* Range Labels */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        maxWidth: '380px',
        fontSize: '0.725rem',
        color: 'var(--text-muted)',
        marginBottom: '1.25rem'
      }}>
        <span>&lt; 18.5<br />Under</span>
        <span>18.5 – 24.9<br />Normal</span>
        <span>25 – 29.9<br />Over</span>
        <span>&ge; 30<br />Obese</span>
      </div>

      {/* Central Score Card */}
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: color, letterSpacing: '-0.02em', lineHeight: 1 }}>
          {bmiScore > 0 ? bmiScore.toFixed(1) : '--'}
        </div>
        <div style={{
          display: 'inline-block',
          marginTop: '0.5rem',
          padding: '0.35rem 1rem',
          borderRadius: 'var(--radius-full)',
          background: `${color}20`,
          color: color,
          fontWeight: 700,
          fontSize: '0.9rem'
        }}>
          {category}
        </div>
      </div>
    </div>
  );
}
