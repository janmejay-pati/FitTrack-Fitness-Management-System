import React from 'react';

export class CanvasErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.warn('Canvas 3D ErrorBoundary caught error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '200px',
          padding: '1.5rem',
          background: 'rgba(15, 23, 42, 0.6)',
          border: '1px dashed rgba(255, 255, 255, 0.15)',
          borderRadius: '12px',
          color: 'var(--text-muted, #94a3b8)',
          textAlign: 'center'
        }}>
          <p style={{ fontWeight: 600, color: 'var(--text-primary, #f8fafc)', marginBottom: '0.5rem' }}>
            3D Canvas in 2D Fallback Mode
          </p>
          <span style={{ fontSize: '0.85rem' }}>
            WebGL acceleration is temporarily resting or unsupported on this display.
          </span>
        </div>
      );
    }

    return this.props.children;
  }
}

export default CanvasErrorBoundary;
