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
          <div style={{
            padding: '40px', maxWidth: 1280, margin: '0 auto', 
            backgroundColor: '#F4F5F7', minHeight: '100vh',
            fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 36 }}>
              <div>
                <h1 style={{ margin: '0 0 4px', fontSize: 28, color: '#172B4D', fontWeight: 700, letterSpacing: '-0.02em' }}>
                  Overview Dashboard
                </h1>
                <p style={{ margin: 0, fontSize: 14, color: '#6B778C' }}>Manage your inventory scale and missions effectively.</p>
              </div>
              <button style={{
                  padding: '10px 16px', backgroundColor: '#fff', border: '1px solid #DFE1E6', 
                  borderRadius: 6, color: '#422670', fontWeight: 600, fontSize: 14,
                  display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(9,30,66,0.05)', transition: 'background-color 0.2s, box-shadow 0.2s'
                }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = '#FDFDFF'; e.currentTarget.style.boxShadow = '0 2px 4px rgba(9,30,66,0.1)'; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = '#fff'; e.currentTarget.style.boxShadow = '0 1px 2px rgba(9,30,66,0.05)'; }}
              >
                <RefreshIcon size="small" /> Refresh Data
              </button>
            </div>

            {/* Premium Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24, marginBottom: 40 }}>
              {stats.map((stat, i) => (
                <div key={stat.label} style={{
                  backgroundColor: '#fff', padding: '24px', borderRadius: 12,
                  boxShadow: '0 4px 12px rgba(9,30,66,0.05), 0 1px 2px rgba(9,30,66,0.03)',
                  borderTop: `4px solid ${stat.color}`,
                  display: 'flex', flexDirection: 'column', gap: 12,
                  transition: 'transform 0.25s cubic-bezier(0.2, 0.8, 0.2, 1), box-shadow 0.25s',
                  cursor: 'pointer'
                }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = '0 8px 16px rgba(9,30,66,0.08), 0 2px 4px rgba(9,30,66,0.04)'; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 12px rgba(9,30,66,0.05), 0 1px 2px rgba(9,30,66,0.03)'; }}
                >
                  <p style={{ margin: 0, fontSize: 14, color: '#505F79', fontWeight: 600 }}>{stat.label}</p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: i === 0 ? 36 : 30, fontWeight: 800, color: '#172B4D', letterSpacing: '-0.03em' }}>{stat.value}</span>
                    {stat.alert && <Lozenge appearance="removed" isBold>URGENT</Lozenge>}
                  </div>
                </div>
              ))}
            </div>

            {/* Main Interactive Panels */}
            <div style={{ display: 'grid', gridTemplateColumns: '1.8fr 1fr', gap: 32 }}>
              
              {/* Complex Action Board */}
              <div style={{
                backgroundColor: '#fff', borderRadius: 12, padding: 28,
                boxShadow: '0 2px 8px rgba(9,30,66,0.04), 0 1px 2px rgba(9,30,66,0.02)'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#172B4D' }}>Priority Item Tracking</h2>
                  <span style={{ fontSize: 13, color: '#0C66E4', cursor: 'pointer', fontWeight: 500 }}>View Registry</span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20 }}>
                  {[
                    { title: 'Flagged (Expiring)', count: 4, bg: '#FFF7D6', fg: '#172B4D', topBorder: '#F5CD47', items: [
                      { sub: '08 AUG 2026', title: 'Sterile Gauze Pads' },
                      { sub: '15 SEP 2026', title: 'Infusion Set w/ Flow' }
                    ]},
                    { title: 'In Review Queue', count: 2, bg: '#EAE6FF', fg: '#403294', topBorder: '#8F7EE7', items: [
                      { sub: 'Awaiting checks', title: 'IV Cannula 20G' }
                    ]},
                    { title: 'Recently Disposed', count: 12, bg: '#E3FCEF', fg: '#006644', topBorder: '#4BCE97', items: [
                      { sub: 'Cleared properly', title: 'Lidocaine Expired' }
                    ]}
                  ].map(col => (
                    <div key={col.title} style={{ 
                      backgroundColor: col.bg, borderRadius: 8, padding: 16, 
                      borderTop: `3px solid ${col.topBorder}`
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                        <h3 style={{ margin: 0, fontSize: 13, fontWeight: 700, color: col.fg, textTransform: 'uppercase' }}>{col.title}</h3>
                        <span style={{ backgroundColor: 'rgba(255,255,255,0.6)', color: col.fg, padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700 }}>{col.count}</span>
                      </div>
                      
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        {col.items.map(item => (
                          <div key={item.title} style={{ 
                            backgroundColor: '#fff', padding: '14px 16px', borderRadius: 6, 
                            boxShadow: '0 1px 3px rgba(9,30,66,0.08)', cursor: 'pointer',
                            borderLeft: `2px solid ${col.topBorder}`,
                            transition: 'transform 0.15s'
                          }}
                          onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                          onMouseLeave={e => e.currentTarget.style.transform = 'translateX(0)'}
                          >
                            <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#172B4D' }}>{item.title}</h4>
                            <span style={{ fontSize: 12, color: '#6B778C', fontWeight: 500 }}>{item.sub}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Enhanced Activity Logs */}
              <div style={{
                backgroundColor: '#fff', borderRadius: 12, padding: 28,
                boxShadow: '0 2px 8px rgba(9,30,66,0.04), 0 1px 2px rgba(9,30,66,0.02)',
                display: 'flex', flexDirection: 'column'
              }}>
                <h2 style={{ margin: '0 0 24px', fontSize: 18, fontWeight: 700, color: '#172B4D' }}>Latest Events</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 20, flex: 1 }}>
                  {recentActivity.map(item => (
                    <div key={item.id} style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                      <div style={{ 
                        width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                        backgroundColor: item.type === 'alert' ? '#FFEBE6' : item.type === 'restock' ? '#E3FCEF' : '#DEEBFF',
                        color: item.type === 'alert' ? '#BF2600' : item.type === 'restock' ? '#006644' : '#0747A6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        {item.type === 'alert' ? <WarningIcon size="small" /> : item.type === 'restock' ? <CheckCircleIcon size="small" /> : <RefreshIcon size="small" />}
                      </div>
                      <div style={{ borderBottom: '1px solid #F4F5F7', paddingBottom: 16, width: '100%' }}>
                        <p style={{ margin: 0, fontSize: 14, color: '#172B4D', lineHeight: '1.4' }}>
                          <strong style={{ color: '#091E42' }}>{item.action}</strong> {item.item}
                        </p>
                        <p style={{ margin: '4px 0 0', fontSize: 13, color: '#6B778C' }}>
                          {item.type === 'alert' ? 'Expires ' : 'To '}{item.target}
                          <span style={{ 
                            display: 'inline-block', marginLeft: 8, padding: '2px 6px',
                            backgroundColor: '#F4F5F7', borderRadius: 3, fontSize: 11
                           }}>{item.time}</span>
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <button style={{ 
                  marginTop: 16, width: '100%', padding: '12px', borderRadius: 6,
                  backgroundColor: '#F4F5F7', border: 'none', 
                  color: '#422670', cursor: 'pointer', fontSize: 14, fontWeight: 600,
                  transition: 'background-color 0.2s'
                 }}
                 onMouseEnter={e => e.currentTarget.style.backgroundColor = '#EAE6FF'}
                 onMouseLeave={e => e.currentTarget.style.backgroundColor = '#F4F5F7'}
                 >
                  Load All Activity
                </button>
              </div>

            </div>
          </div>
        </Main>
      </Content>
    </PageLayout>
  );
}
