import React from 'react';
import { PageLayout, Content, Main, LeftSidebarWithoutResize, TopNavigation } from '@atlaskit/page-layout';
import TopNav from './TopNav';
import SideNav from './SideNav';
import { token } from '@atlaskit/tokens';
import Lozenge from '@atlaskit/lozenge';
import WarningIcon from '@atlaskit/icon/core/warning';
import CheckCircleIcon from '@atlaskit/icon/core/check-circle';
import RefreshIcon from '@atlaskit/icon/core/refresh';

export default function DashboardPage({ onNavigate }) {
  // Mock data for dashboard
  const stats = [
    { label: 'Total Inventory Items', value: '4,285', color: '#0C66E4' },
    { label: 'Items In Use / Reserved', value: '1,432', color: '#6554C0' },
    { label: 'Low Stock Alerts', value: '14', color: '#AE2E24', alert: true },
    { label: 'Upcoming Missions', value: '3', color: '#22A06B' },
  ];

  const recentActivity = [
    { id: 1, action: 'Assigned', item: 'Absorbable Sutures 4-0', target: 'Uganda Cardiac 2026', time: '10 mins ago', type: 'assign' },
    { id: 2, action: 'Restocked', item: 'Lidocaine 1% 20ml', target: 'Cabinet 14 Shelf 3A', time: '1 hour ago', type: 'restock' },
    { id: 3, action: 'Flagged Expiring', item: 'Sterile Gauze Pads 4x4', target: 'within 3 months', time: '3 hours ago', type: 'alert' },
    { id: 4, action: 'Assigned', item: 'Portable Pulse Oximeter', target: 'Peru General Surgery', time: '5 hours ago', type: 'assign' },
  ];

  return (
    <PageLayout>
      <TopNavigation isFixed>
        <TopNav />
      </TopNavigation>
      <Content>
        <LeftSidebarWithoutResize width={240}>
          <SideNav active="dashboard" onNavigate={onNavigate} />
        </LeftSidebarWithoutResize>
        <Main>
          <div style={{ padding: '32px', maxWidth: 1200, margin: '0 auto', backgroundColor: '#FAFBFC', minHeight: '100vh' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
              <h1 style={{ margin: 0, fontSize: 24, color: token('color.text', '#172B4D') }}>Dashboard Overview</h1>
              <span style={{ fontSize: 13, color: '#6B778C' }}>Last updated: Just now</span>
            </div>

            {/* Quick Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: 24, marginBottom: 32 }}>
              {stats.map(stat => (
                <div key={stat.label} style={{
                  backgroundColor: '#fff', padding: 24, borderRadius: 8,
                  boxShadow: '0 1px 2px rgba(9,30,66,0.1), 0 0 1px rgba(9,30,66,0.13)',
                  borderTop: `4px solid ${stat.color}`
                }}>
                  <p style={{ margin: '0 0 8px', fontSize: 14, color: '#6B778C', fontWeight: 500 }}>{stat.label}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 32, fontWeight: 700, color: '#172B4D' }}>{stat.value}</span>
                    {stat.alert && <Lozenge appearance="removed" isBold>Requires Action</Lozenge>}
                  </div>
                </div>
              ))}
            </div>

            {/* Main Dashboard Content */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
              
              {/* Left Column: Kanban style quick-status */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{
                  backgroundColor: '#fff', borderRadius: 8, padding: 24,
                  boxShadow: '0 1px 2px rgba(9,30,66,0.1), 0 0 1px rgba(9,30,66,0.13)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
                    <h2 style={{ margin: 0, fontSize: 18, color: '#172B4D' }}>Expiring Items Action Board</h2>
                    <a href="#" style={{ color: '#0C66E4', fontSize: 14, textDecoration: 'none' }}>View All</a>
                  </div>
                  
                  {/* Mini Kanban */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                    <div style={{ backgroundColor: '#FFF0B3', padding: 12, borderRadius: 6 }}>
                      <h3 style={{ margin: '0 0 12px', fontSize: 12, textTransform: 'uppercase', color: '#172B4D' }}>Within 3 Months (4)</h3>
                      <div style={{ backgroundColor: '#fff', padding: 12, borderRadius: 4, boxShadow: '0 1px 1px rgba(0,0,0,0.1)', marginBottom: 8, fontSize: 13 }}>
                        <strong>Sterile Gauze Pads</strong><br/>
                        <span style={{ color: '#AE2E24' }}>EXP 08 AUG 2026</span>
                      </div>
                      <div style={{ backgroundColor: '#fff', padding: 12, borderRadius: 4, boxShadow: '0 1px 1px rgba(0,0,0,0.1)', fontSize: 13 }}>
                        <strong>Infusion Set w/ Flow</strong><br/>
                        <span style={{ color: '#AE2E24' }}>EXP 15 SEP 2026</span>
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#EAE6FF', padding: 12, borderRadius: 6 }}>
                      <h3 style={{ margin: '0 0 12px', fontSize: 12, textTransform: 'uppercase', color: '#172B4D' }}>Reviewing (2)</h3>
                      <div style={{ backgroundColor: '#fff', padding: 12, borderRadius: 4, boxShadow: '0 1px 1px rgba(0,0,0,0.1)', fontSize: 13 }}>
                        <strong>IV Cannula 20G</strong><br/>
                        <span style={{ color: '#44546F' }}>Awaiting extension cert</span>
                      </div>
                    </div>
                    <div style={{ backgroundColor: '#E3FCEF', padding: 12, borderRadius: 6 }}>
                      <h3 style={{ margin: '0 0 12px', fontSize: 12, textTransform: 'uppercase', color: '#172B4D' }}>Safely Disposed (12)</h3>
                      <div style={{ backgroundColor: '#fff', padding: 12, borderRadius: 4, boxShadow: '0 1px 1px rgba(0,0,0,0.1)', fontSize: 13 }}>
                        <strong>Lidocaine Expired</strong><br/>
                        <span style={{ color: '#22A06B' }}>Cleared</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Recent Activity */}
              <div style={{
                backgroundColor: '#fff', borderRadius: 8, padding: 24,
                boxShadow: '0 1px 2px rgba(9,30,66,0.1), 0 0 1px rgba(9,30,66,0.13)'
              }}>
                <h2 style={{ margin: '0 0 20px', fontSize: 18, color: '#172B4D' }}>Recent Activity</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {recentActivity.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ color: item.type === 'alert' ? '#AE2E24' : item.type === 'restock' ? '#22A06B' : '#0C66E4', marginTop: 2 }}>
                        {item.type === 'alert' ? <WarningIcon size="small" label="" /> : item.type === 'restock' ? <CheckCircleIcon size="small" label="" /> : <RefreshIcon size="small" label="" />}
                      </div>
                      <div>
                        <p style={{ margin: 0, fontSize: 14, color: '#172B4D' }}>
                          <strong>{item.action}</strong> {item.item}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: 12, color: '#6B778C' }}>
                          {item.type === 'alert' ? 'Expires ' : 'To '}{item.target} • {item.time}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button style={{ 
                  marginTop: 24, width: '100%', padding: '8px', 
                  backgroundColor: 'transparent', border: 'none', 
                  color: '#0C66E4', cursor: 'pointer', fontSize: 14, fontWeight: 500
                 }}>
                  View All Activity
                </button>
              </div>

            </div>
          </div>
        </Main>
      </Content>
    </PageLayout>
  );
}
