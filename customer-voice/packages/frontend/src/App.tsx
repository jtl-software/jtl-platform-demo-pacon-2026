import { BrowserRouter, Routes, Route } from 'react-router-dom';
import type { AppBridge } from '@jtl-software/cloud-apps-core';
import './App.css';
import ConfigWarningBanner from './common/ConfigWarningBanner';
import { AppBridgeContext } from './common/AppBridgeContext';
import {
  LoginPage,
  DashboardPage,
  ConfigPage,
  ArticlePanelPage,
  CustomerPanelPage,
  WidgetPage,
  HubPage,
  SetupPage,
  ErpPage,
  PanePage,
  GraphqlDemoPage,
  WelcomePage,
} from './pages';

const App: React.FC<{ appBridge: AppBridge | null }> = ({ appBridge }) => (
  <AppBridgeContext.Provider value={appBridge}>
    <ConfigWarningBanner />
    <BrowserRouter>
      <Routes>
        {/* Public — no AppBridge required */}
        <Route path="/widget/:articleId" element={<WidgetPage />} />
        <Route path="/hub" element={<HubPage />} />

        {/* Setup / tenant linking */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/setup" element={appBridge ? <SetupPage appBridge={appBridge} /> : <WelcomePage />} />

        {/* CustomerVoice ERP views */}
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/config" element={<ConfigPage />} />

        {/* Side-panels — with and without URL param (param = direct test URL) */}
        <Route path="/panel/article/:id" element={<ArticlePanelPage />} />
        <Route path="/panel/article" element={<ArticlePanelPage />} />
        <Route path="/panel/customer/:id" element={<CustomerPanelPage />} />
        <Route path="/panel/customer" element={<CustomerPanelPage />} />

        {/* Legacy scaffold routes kept for reference */}
        <Route path="/erp" element={appBridge ? <ErpPage appBridge={appBridge} /> : <WelcomePage />} />
        <Route path="/pane" element={appBridge ? <PanePage appBridge={appBridge} /> : <WelcomePage />} />
        <Route path="/graphql-demo" element={appBridge ? <GraphqlDemoPage appBridge={appBridge} /> : <WelcomePage />} />

        {/* Default */}
        <Route path="/" element={<WelcomePage connected={!!appBridge} />} />
      </Routes>
    </BrowserRouter>
  </AppBridgeContext.Provider>
);

export default App;
