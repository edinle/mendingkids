import React from 'react';

export default class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[AppErrorBoundary] Unhandled render error:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
          backgroundColor: '#F4F5F7',
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: 520,
            backgroundColor: '#FFFFFF',
            borderRadius: 8,
            boxShadow: '0 8px 24px rgba(9, 30, 66, 0.15)',
            padding: 24,
            color: '#172B4D',
          }}
        >
          <h1 style={{ margin: '0 0 12px', fontSize: 24 }}>Something went wrong</h1>
          <p style={{ margin: '0 0 16px', color: '#44546F' }}>
            The app hit an unexpected error. Please reload and try again.
          </p>
          <button
            type="button"
            onClick={this.handleReload}
            style={{
              border: 'none',
              borderRadius: 4,
              backgroundColor: '#0747A6',
              color: '#FFFFFF',
              padding: '10px 16px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            Reload Application
          </button>
          {this.state.error?.message && (
            <pre
              style={{
                marginTop: 16,
                padding: 12,
                fontSize: 12,
                whiteSpace: 'pre-wrap',
                backgroundColor: '#F7F8F9',
                borderRadius: 4,
                color: '#5E6C84',
              }}
            >
              {this.state.error.message}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
