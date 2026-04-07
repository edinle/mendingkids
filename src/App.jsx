import { useState } from 'react';
import InventoryPage     from './components/InventoryPage';
import MissionsPage      from './components/MissionsPage';
import MissionDetailPage from './components/MissionDetailPage';
import AddItemsPage      from './components/AddItemsPage';
import DashboardPage     from './components/DashboardPage';
import DonorsPage        from './components/DonorsPage';
import ItemRequestsPage  from './components/ItemRequestsPage';

import { PageLayout, Content, Main, LeftSidebarWithoutResize, TopNavigation } from '@atlaskit/page-layout';
import TopNav  from './components/TopNav';
import SideNav from './components/SideNav';

const PlaceholderPage = ({ title, onNavigate, id }) => (
  <PageLayout>
    <TopNavigation isFixed><TopNav /></TopNavigation>
    <Content>
      <LeftSidebarWithoutResize width={240}>
        <SideNav active={id} onNavigate={onNavigate} />
      </LeftSidebarWithoutResize>
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
  // nav = { page: string, params?: any }
  const [nav, setNav] = useState({ page: 'missions' });

  // onNavigate(page, params?) — params carries mission object etc.
  const onNavigate = (page, params) => setNav({ page, params });

  return (
    <>
      {nav.page === 'dashboard'      && <DashboardPage      onNavigate={onNavigate} />}
      {nav.page === 'inventory'      && <InventoryPage      onNavigate={onNavigate} />}
      {nav.page === 'missions'       && <MissionsPage       onNavigate={onNavigate} />}
      {nav.page === 'mission-detail' && <MissionDetailPage  mission={nav.params}  onNavigate={onNavigate} />}
      {nav.page === 'add-items'      && <AddItemsPage       mission={nav.params}  onNavigate={onNavigate} />}
      {nav.page === 'donors'         && <DonorsPage         onNavigate={onNavigate} />}
      {nav.page === 'requests'       && <ItemRequestsPage   onNavigate={onNavigate} />}
      {nav.page === 'volunteers'     && <PlaceholderPage title="Volunteers"        onNavigate={onNavigate} id="volunteers" />}
      {nav.page === 'reports'        && <PlaceholderPage title="Reports"           onNavigate={onNavigate} id="reports"    />}
    </>
  );
}
