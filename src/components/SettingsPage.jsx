import { useState } from 'react';
import { PageLayout, TopNavigation, LeftSidebarWithoutResize, Content, Main } from '@atlaskit/page-layout';
import { token } from '@atlaskit/tokens';

import TopNav from './TopNav';

const TABS = ['General Settings', 'User Management', 'Roles & Permissions', 'Integrations', 'Billing & Plans'];

export default function SettingsPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('General Settings');

  return (
    <PageLayout>
      <TopNavigation isFixed><TopNav onNavigate={onNavigate} /></TopNavigation>
      <Content>
        {/* Settings-specific Sidebar */}
        <LeftSidebarWithoutResize width={240}>
          <div style={{ padding: '24px 16px', borderRight: `1px solid ${token('color.border', '#EBECF0')}`, height: '100%', backgroundColor: token('elevation.surface', '#F4F5F7') }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: token('color.text.subtle', '#5E6C84'), textTransform: 'uppercase', marginBottom: 16, paddingLeft: 12 }}>
              Settings
            </h2>
            <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {TABS.map(tab => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  style={{
                    display: 'flex', alignItems: 'center',
                    padding: '8px 12px', border: 'none', borderRadius: 3,
                    backgroundColor: activeTab === tab ? '#E9F2FF' : 'transparent',
                    color: activeTab === tab ? '#0C66E4' : token('color.text', '#172B4D'),
                    fontWeight: activeTab === tab ? 600 : 500,
                    cursor: 'pointer', fontSize: 14, textAlign: 'left', fontFamily: 'inherit'
                  }}
                >
                  {tab}
                </button>
              ))}
            </nav>
            
            <div style={{ marginTop: 32 }}>
              <button 
                onClick={() => onNavigate('dashboard')}
                style={{ background: 'none', border: 'none', color: '#0C66E4', cursor: 'pointer', fontSize: 14, fontWeight: 500, paddingLeft: 12 }}>
                ← Back to App
              </button>
            </div>
          </div>
        </LeftSidebarWithoutResize>

        {/* Main Content */}
        <Main>
          <div style={{ padding: '32px 40px', maxWidth: 800, margin: '0 auto' }}>
            <h1 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 600, color: token('color.text', '#172B4D') }}>
              {activeTab}
            </h1>

            {activeTab === 'General Settings' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
                <section>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: token('color.text', '#172B4D') }}>Organization Profile</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token('color.text.subtle', '#5E6C84'), marginBottom: 4 }}>Organization Name</label>
                      <input type="text" defaultValue="Mending Kids" style={{ width: '100%', maxWidth: 400, padding: '8px', border: '2px solid #DFE1E6', borderRadius: 3, fontSize: 14 }} />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token('color.text.subtle', '#5E6C84'), marginBottom: 4 }}>Contact Email</label>
                      <input type="text" defaultValue="admin@mendingkids.org" style={{ width: '100%', maxWidth: 400, padding: '8px', border: '2px solid #DFE1E6', borderRadius: 3, fontSize: 14 }} />
                    </div>
                  </div>
                  <button style={{ marginTop: 16, padding: '8px 16px', backgroundColor: '#0052CC', color: '#fff', border: 'none', borderRadius: 3, fontWeight: 500, cursor: 'pointer' }}>
                    Save Changes
                  </button>
                </section>
                
                <hr style={{ border: 'none', height: 1, backgroundColor: '#DFE1E6' }} />

                <section>
                  <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 12, color: token('color.text', '#172B4D') }}>Localization</h3>
                  <p style={{ fontSize: 14, color: token('color.text.subtle', '#5E6C84'), marginBottom: 16 }}>Configure default timezones, date formats, and language.</p>
                  <div>
                    <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token('color.text.subtle', '#5E6C84'), marginBottom: 4 }}>Timezone</label>
                    <select style={{ width: '100%', maxWidth: 400, padding: '8px', border: '2px solid #DFE1E6', borderRadius: 3, fontSize: 14 }}>
                      <option>Pacific Time (US & Canada)</option>
                      <option>Eastern Time (US & Canada)</option>
                      <option>UTC</option>
                    </select>
                  </div>
                </section>
              </div>
            )}
            
            {activeTab !== 'General Settings' && (
              <div style={{ backgroundColor: '#F4F5F7', padding: 24, borderRadius: 3, border: '1px solid #DFE1E6' }}>
                <p style={{ margin: 0, color: '#5E6C84' }}>Configuration options for <strong>{activeTab}</strong> will be available soon.</p>
              </div>
            )}

          </div>
        </Main>
      </Content>
    </PageLayout>
  );
}
