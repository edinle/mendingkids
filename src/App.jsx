import { useState } from 'react';
import InventoryPage from "./components/InventoryPage";
import MissionsPage from "./components/MissionsPage";
import DashboardPage from "./components/DashboardPage";

import { PageLayout, Content, Main, LeftSidebarWithoutResize, TopNavigation } from '@atlaskit/page-layout';
import TopNav from './components/TopNav';
import SideNav from './components/SideNav';

const PlaceholderPage = ({ title, onNavigate, id }) => (
  <PageLayout>
    <TopNavigation isFixed>
      <TopNav />
    </TopNavigation>
    <Content>
      <LeftSidebarWithoutResize width={240}>
        <SideNav active={id} onNavigate={onNavigate} />
      </LeftSidebarWithoutResize>
      <Main>
        <div style={{ padding: 40, textAlign: 'center', marginTop: 100 }}>
          <h1 style={{ color: '#172B4D', fontSize: 32 }}>{title}</h1>
          <p style={{ color: '#6B778C', fontSize: 16 }}>This section is currently under development to match the Figma design spec.</p>
          <button 
            style={{ 
              marginTop: 24, padding: '10px 20px', backgroundColor: '#422670', color: '#fff', 
              border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 
            }}
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
  const [currentPage, setCurrentPage] = useState('inventory');

  return (
    <>
      {currentPage === 'inventory'  && <InventoryPage onNavigate={setCurrentPage} />}
      {currentPage === 'missions'   && <MissionsPage onNavigate={setCurrentPage} />}
      {currentPage === 'dashboard'  && <DashboardPage onNavigate={setCurrentPage} />}
      {currentPage === 'donors'     && <PlaceholderPage title="Donors & Partners" onNavigate={setCurrentPage} id="donors" />}
      {currentPage === 'requests'   && <PlaceholderPage title="Item Requests" onNavigate={setCurrentPage} id="requests" />}
      {currentPage === 'volunteers' && <PlaceholderPage title="Volunteers" onNavigate={setCurrentPage} id="volunteers" />}
      {currentPage === 'reports'    && <PlaceholderPage title="Reports" onNavigate={setCurrentPage} id="reports" />}
    </>
  );
}
