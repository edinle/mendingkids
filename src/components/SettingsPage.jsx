import { useState } from 'react';
import { PageLayout, TopNavigation, LeftSidebarWithoutResize, Content, Main } from '@atlaskit/page-layout';
import TextField from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import { Checkbox } from '@atlaskit/checkbox';
import Button from '@atlaskit/button/new';
import { token } from '@atlaskit/tokens';

import TopNav from './TopNav';

// Mimics Jira's admin sidebar structure
const SETTINGS_SECTIONS = [
  {
    title: 'System',
    items: ['General configuration', 'Global permissions', 'Audit log']
  },
  {
    title: 'User Management',
    items: ['Users', 'Groups', 'Authentication']
  },
  {
    title: 'Inventory Settings',
    items: ['Categories & Tags', 'Warehouses & Locations', 'Automation rules']
  },
  {
    title: 'Billing & Plans',
    items: ['Subscription', 'Invoices']
  }
];

export default function SettingsPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('General configuration');

  return (
    <PageLayout>
      <TopNavigation isFixed><TopNav onNavigate={onNavigate} /></TopNavigation>
      <Content>
        {/* Jira-style Settings Sidebar */}
        <LeftSidebarWithoutResize width={260}>
          <div style={{ 
            height: '100%', 
            backgroundColor: token('elevation.surface.sunken', '#F4F5F7'),
            borderRight: `1px solid ${token('color.border', '#EBECF0')}`,
            display: 'flex',
            flexDirection: 'column'
          }}>
            <div style={{ padding: '24px 16px 16px', borderBottom: `1px solid ${token('color.border', '#EBECF0')}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                <div style={{ width: 32, height: 32, backgroundColor: '#0052CC', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                    <path d="M14 2H2v12h12V2zM8 12.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-2.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                  </svg>
                </div>
                <h2 style={{ fontSize: 16, fontWeight: 600, color: token('color.text', '#172B4D'), margin: 0 }}>
                  Settings
                </h2>
              </div>
              <button 
                onClick={() => onNavigate('dashboard')}
                style={{ 
                  background: 'none', border: 'none', color: '#0052CC', cursor: 'pointer', 
                  fontSize: 14, fontWeight: 500, padding: 0, display: 'flex', alignItems: 'center', gap: 4
                }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Back to project
              </button>
            </div>

            <div style={{ padding: '16px 8px', flex: 1, overflowY: 'auto' }}>
              {SETTINGS_SECTIONS.map((section, sIdx) => (
                <div key={sIdx} style={{ marginBottom: 24 }}>
                  <h3 style={{ 
                    fontSize: 11, fontWeight: 700, color: token('color.text.subtlest', '#626F86'), 
                    textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8, paddingLeft: 12 
                  }}>
                    {section.title}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {section.items.map(item => {
                      const isActive = activeTab === item;
                      return (
                        <button
                          key={item}
                          onClick={() => setActiveTab(item)}
                          style={{
                            display: 'flex', alignItems: 'center', padding: '8px 12px',
                            border: 'none', borderRadius: 3, cursor: 'pointer', fontSize: 14, textAlign: 'left', fontFamily: 'inherit',
                            backgroundColor: isActive ? token('color.background.selected', '#E9F2FF') : 'transparent',
                            color: isActive ? token('color.text.selected', '#0C66E4') : token('color.text', '#172B4D'),
                            fontWeight: isActive ? 500 : 400,
                            transition: 'background-color 0.15s ease'
                          }}
                          onMouseEnter={(e) => !isActive && (e.currentTarget.style.backgroundColor = token('color.background.neutral.hovered', '#EBECF0'))}
                          onMouseLeave={(e) => !isActive && (e.currentTarget.style.backgroundColor = 'transparent')}
                        >
                          {item}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </LeftSidebarWithoutResize>

        {/* Main Content */}
        <Main>
          <div style={{ padding: '32px 40px', maxWidth: 800, margin: '0 auto', paddingBottom: 100 }}>
            <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 500, color: token('color.text', '#172B4D') }}>
              {activeTab}
            </h1>

            {activeTab === 'General configuration' && (
              <>
                <p style={{ color: token('color.text.subtle', '#5E6C84'), fontSize: 14, marginBottom: 32 }}>
                  Manage your organization details, localization defaults, and main operational settings.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
                  <section>
                    <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16, color: token('color.text', '#172B4D') }}>Organization Profile</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <div style={{ maxWidth: 440 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: token('color.text.subtle', '#5E6C84'), marginBottom: 6 }}>Organization Name</label>
                        <TextField defaultValue="Mending Kids" />
                      </div>
                      <div style={{ maxWidth: 440 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: token('color.text.subtle', '#5E6C84'), marginBottom: 6 }}>Support Email</label>
                        <TextField defaultValue="support@mendingkids.org" />
                      </div>
                      <div style={{ maxWidth: 440 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: token('color.text.subtle', '#5E6C84'), marginBottom: 6 }}>Base URL</label>
                        <TextField defaultValue="https://inventory.mendingkids.org" isReadOnly />
                        <span style={{ fontSize: 12, color: token('color.text.subtlest', '#626F86'), marginTop: 4, display: 'block' }}>This is your site's permanent address.</span>
                      </div>
                    </div>
                  </section>
                  
                  <hr style={{ border: 'none', height: 1, backgroundColor: token('color.border', '#DFE1E6') }} />

                  <section>
                    <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16, color: token('color.text', '#172B4D') }}>Internationalization</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                      <div style={{ maxWidth: 440 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: token('color.text.subtle', '#5E6C84'), marginBottom: 6 }}>Default Timezone</label>
                        <Select 
                          options={[
                            { label: '(GMT-08:00) Pacific Time (US & Canada)', value: 'pt' },
                            { label: '(GMT-05:00) Eastern Time (US & Canada)', value: 'et' },
                            { label: '(GMT+00:00) UTC', value: 'utc' }
                          ]}
                          defaultValue={{ label: '(GMT-08:00) Pacific Time (US & Canada)', value: 'pt' }}
                        />
                      </div>
                      <div style={{ maxWidth: 440 }}>
                        <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: token('color.text.subtle', '#5E6C84'), marginBottom: 6 }}>Default Language</label>
                        <Select 
                          options={[{ label: 'English (United States)', value: 'en-US' }, { label: 'Spanish', value: 'es' }]}
                          defaultValue={{ label: 'English (United States)', value: 'en-US' }}
                        />
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 style={{ fontSize: 18, fontWeight: 500, marginBottom: 16, color: token('color.text', '#172B4D') }}>Options</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      <Checkbox label="Allow users to vote on item requests" defaultChecked />
                      <Checkbox label="Enable public API access for integrations" />
                      <Checkbox label="Show contact support floating widget" defaultChecked />
                    </div>
                  </section>

                  <div style={{ paddingTop: 16 }}>
                    <Button appearance="primary" onClick={() => alert('Settings saved successfully.')}>
                      Save configuration
                    </Button>
                    <Button appearance="subtle" style={{ marginLeft: 8 }}>
                      Cancel
                    </Button>
                  </div>
                </div>
              </>
            )}
            
            {activeTab !== 'General configuration' && (
              <div style={{ 
                marginTop: 32, padding: 32, borderRadius: 3, 
                border: `1px solid ${token('color.border', '#DFE1E6')}`,
                display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                backgroundColor: token('elevation.surface', '#fff')
              }}>
                <img src="https://jira.atlassian.com/images/default-avatar-project.png" alt="Placeholder" style={{ width: 80, opacity: 0.5, marginBottom: 16 }} />
                <h3 style={{ fontSize: 18, fontWeight: 500, color: token('color.text', '#172B4D'), marginBottom: 8 }}>Nothing here yet</h3>
                <p style={{ margin: 0, color: token('color.text.subtle', '#5E6C84'), textAlign: 'center', maxWidth: 400 }}>
                  The <strong>{activeTab}</strong> settings page is not yet implemented in this demo.
                </p>
              </div>
            )}

          </div>
        </Main>
      </Content>
    </PageLayout>
  );
}
