import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { setGlobalTheme } from '@atlaskit/tokens';
import '@atlaskit/css-reset';
import './index.css';
import App from './App.jsx';

setGlobalTheme({ colorMode: 'light', spacing: 'spacing', typography: 'typography-adg3' });

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
