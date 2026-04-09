import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setGlobalTheme } from '@atlaskit/tokens';
import '@atlaskit/css-reset';
import './index.css';
import App from './App.jsx';
import AppErrorBoundary from './components/AppErrorBoundary.jsx';

import { HashRouter } from 'react-router-dom';

try {
  setGlobalTheme({ colorMode: 'light', spacing: 'spacing', typography: 'typography-adg3' });
} catch (e) {
  console.error('Theme initialization failed:', e);
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Root element #root was not found in index.html');
}

createRoot(rootElement).render(
  <AppErrorBoundary>
    <HashRouter>
      <App />
    </HashRouter>
  </AppErrorBoundary>,
);
