import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.tsx';
import { createAppBridge, AppBridge } from '@jtl-software/cloud-apps-core';

const root = createRoot(document.getElementById('root')!);

const renderApp = (appBridge: AppBridge | null) => {
  root.render(
    <StrictMode>
      <App appBridge={appBridge} />
    </StrictMode>,
  );
};

renderApp(null);

createAppBridge().then(appBridge => {
  renderApp(appBridge);
});
