import React from 'react';
import { Plus } from 'lucide-react';

export default function EmptyState({ 
  icon: Icon, 
  title = 'No items found', 
  description = 'Get started by creating your first entry.',
  actionLabel = null,
  onAction = null
}) {
  return (
    <div className="empty-state">
      {Icon && (
        <div className="empty-icon" style={{ display: 'inline-flex' }}>
          <Icon size={44} strokeWidth={1.5} />
        </div>
      )}
      <h3 style={{ marginBottom: '0.4rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto 1.5rem', fontSize: '0.925rem' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button className="btn btn-primary" onClick={onAction}>
          <Plus size={18} /> {actionLabel}
        </button>
      )}
    </div>
  );
}
