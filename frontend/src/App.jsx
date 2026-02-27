import { useState } from 'react';
import Dashboard from './components/Dashboard';
import SettingsForm from './components/SettingsForm';
import './styles/Dashboard.css';
import './index.css';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  // Simula o Tenant logado. Em um app real, isso viria de Auth/Context
  const [tenantId, setTenantId] = useState(null);

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <span style={{ fontSize: '1.4rem' }}>✨</span> Automkt SaaS
        </div>
        <nav className="sidebar-nav">
          <div
            className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            🏢 Empresa
          </div>
          <div
            className={`nav-item ${activeTab === 'integrations' ? 'active' : ''}`}
            onClick={() => setActiveTab('integrations')}
          >
            🔑 Integrações (APIs)
          </div>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {activeTab === 'dashboard' && (
          <Dashboard tenantId={tenantId} setTenantId={setTenantId} />
        )}
        {activeTab === 'integrations' && (
          <SettingsForm tenantId={tenantId} />
        )}
      </main>
    </div>
  );
}

export default App;
