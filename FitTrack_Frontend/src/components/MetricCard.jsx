import React from 'react';

export default function MetricCard({ 
  title, 
  value, 
  unit = '', 
  subtitle = '', 
  icon: Icon, 
  color = 'var(--accent)',
  progress = null,
  trend = null 
}) {
  return (
    <div className="card card-hover" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
          {title}
        </span>
        {Icon && (
          <div style={{
            width: '36px',
            height: '36px',
            borderRadius: 'var(--radius-md)',
            background: `rgba(${color.startsWith('#') ? '16, 185, 129' : '16, 185, 129'}, 0.15)`,
            color: color,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Icon size={18} />
          </div>
        )}
      </div>

      <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.35rem' }}>
        <span style={{ fontSize: '2rem', fontWeight: 800, color: 'var(--text-primary)', letterSpacing: '-0.02em' }}>
          {value}
        </span>
        {unit && (
          <span style={{ fontSize: '0.95rem', fontWeight: 500, color: 'var(--text-muted)' }}>
            {unit}
          </span>
        )}
      </div>

      {progress !== null && (
        <div style={{ width: '100%', height: '6px', background: 'var(--border)', borderRadius: 'var(--radius-full)', overflow: 'hidden' }}>
          <div 
            style={{ 
              width: `${Math.min(100, Math.max(0, progress))}%`, 
              height: '100%', 
              background: color,
              borderRadius: 'var(--radius-full)',
              transition: 'width 0.4s ease'
            }} 
          />
        </div>
      )}

      {(subtitle || trend) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
          <span>{subtitle}</span>
          {trend && (
            <span style={{ color: trend.startsWith('+') || trend.includes('up') ? 'var(--accent)' : 'var(--accent-rose)', fontWeight: 600 }}>
              {trend}
            </span>
          )}
        </div>
      )}
    </div>
  );
}
