import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';

class AppErrorBoundary extends React.Component {
  state = { error: null };
  static getDerivedStateFromError(error) { return { error }; }
  render() {
    if (this.state.error) return <main style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', padding: 24, color: '#fff', background: '#090909', fontFamily: 'system-ui' }}><div><h1>BeautyBook</h1><p>Le site a rencontré un problème d’affichage.</p><pre style={{ color: '#ff9a79', whiteSpace: 'pre-wrap' }}>{this.state.error.message}</pre></div></main>;
    return this.props.children;
  }
}

createRoot(document.getElementById('root')).render(<AppErrorBoundary><React.StrictMode><App /></React.StrictMode></AppErrorBoundary>);
