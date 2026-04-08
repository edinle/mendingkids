import { useState } from 'react';
import VolunteersPage   from './components/VolunteersPage';
import InventoryPage     from './components/InventoryPage';
import MissionsPage      from './components/MissionsPage';
import MissionDetailPage from './components/MissionDetailPage';
import AddItemsPage      from './components/AddItemsPage';
import DashboardPage     from './components/DashboardPage';
import DonorsPage        from './components/DonorsPage';
import ItemRequestsPage  from './components/ItemRequestsPage';
import SettingsPage      from './components/SettingsPage';
import ReportsPage       from './components/ReportsPage';

import { PageLayout, Content, Main, LeftSidebar, TopNavigation } from '@atlaskit/page-layout';
import TopNav  from './components/TopNav';
import SideNav from './components/SideNav';
import LoginPage from './components/LoginPage';
import SlidePanel from './components/SlidePanel';

const PlaceholderPage = ({ title, onNavigate, id, user, onSwitchAccount, onLogout }) => (
  <PageLayout>
    <TopNavigation isFixed>
      <TopNav 
        onNavigate={onNavigate} 
        user={user} 
        onSwitchAccount={onSwitchAccount} 
        onLogout={onLogout} 
      />
    </TopNavigation>
    <Content>
      <LeftSidebar width={240} id="app-sidebar" isFixed={false}>
        <SideNav active={id} onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />
      </LeftSidebar>
      <Main>
        <div style={{ padding: 40, textAlign: 'center', marginTop: 100 }}>
          <h1 style={{ color: '#172B4D', fontSize: 32 }}>{title}</h1>
          <p style={{ color: '#6B778C', fontSize: 16 }}>This section is coming soon.</p>
          <button
            style={{ marginTop: 24, padding: '10px 20px', backgroundColor: '#422670', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
            onClick={() => onNavigate('dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </Main>
    </Content>
  </PageLayout>
);

export default function App() {
  const [user, setUser] = useState(null);
  const [nav, setNav] = useState({ page: 'missions' });
  const [showInternRestricted, setShowInternRestricted] = useState(false);

  const onNavigate = (page, params) => setNav({ page, params });
  
  const onLogin = (userData) => {
    setUser(userData);
    setNav({ page: 'dashboard' });
  };

  const onLogout = () => {
    setUser(null);
  };

  const onSwitchAccount = (role) => {
    if (role === 'Intern') {
      setUser({ ...user, name: 'Intern User', role: 'Intern', email: 'intern@mendingkids.org' });
      setShowInternRestricted(true);
    } else {
      setUser({ ...user, name: 'Admin User', role: 'Administrator', email: 'admin@mendingkids.org' });
      setShowInternRestricted(false);
    }
  };

  if (!user) {
    return <LoginPage onLogin={onLogin} />;
  }

  return (
    <>
      {user.role === 'Intern' && showInternRestricted && (
        <SlidePanel isOpen={showInternRestricted} onClose={() => setShowInternRestricted(false)}>
          <div style={{ padding: 32 }}>
            <div style={{ padding: 20, backgroundColor: '#DEEBFF', borderRadius: 4, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
              <span style={{ fontSize: 20 }}>ℹ️</span>
              <div>
                <h4 style={{ margin: '0 0 4px', color: '#0747A6' }}>Intern Account Mode</h4>
                <p style={{ margin: 0, fontSize: 13, color: '#0747A6', lineHeight: 1.5 }}>
                  You are now viewing the system as an <strong>Intern</strong>. 
                  Some actions will require approval and your data access is restricted to assigned missions.
                </p>
              </div>
            </div>
            <button 
              onClick={() => setShowInternRestricted(false)}
              style={{ marginTop: 24, padding: '8px 16px', backgroundColor: '#422670', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontWeight: 600 }}
            >
              Continue as Intern
            </button>
          </div>
        </SlidePanel>
      )}

      {nav.page === 'dashboard'      && <DashboardPage      onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
      {nav.page === 'inventory'      && <InventoryPage      onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
      {nav.page === 'missions'       && <MissionsPage       onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
      {nav.page === 'mission-detail' && <MissionDetailPage  mission={nav.params}  onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
      {nav.page === 'add-items'      && <AddItemsPage       mission={nav.params}  onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
      {nav.page === 'donors'         && <DonorsPage         onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
      {nav.page === 'requests'       && <ItemRequestsPage   onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
      {nav.page === 'volunteers'     && <VolunteersPage     onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
      {nav.page === 'reports'        && <ReportsPage        onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
      {nav.page === 'settings'       && <SettingsPage       onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
    </>
  );
}
