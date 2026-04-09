import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setGlobalTheme } from '@atlaskit/tokens';
import '@atlaskit/css-reset';
import './index.css';
import App from './App.jsx';

import { HashRouter } from 'react-router-dom';

try {
  setGlobalTheme({ colorMode: 'light', spacing: 'spacing', typography: 'typography-adg3' });
} catch (e) {
  console.error('Theme initialization failed:', e);
}

createRoot(document.getElementById('root')).render(
  <HashRouter>
    <App />
  </HashRouter>,
);
