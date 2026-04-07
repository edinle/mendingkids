import { useState } from 'react';
import { PageLayout, TopNavigation, LeftSidebar, Content, Main } from '@atlaskit/page-layout';
import TextField from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import { Checkbox } from '@atlaskit/checkbox';
import DynamicTable from '@atlaskit/dynamic-table';
import { token } from '@atlaskit/tokens';

import TopNav from './TopNav';

// ─── Constants ─────────────────────────────────────────────────────────────

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
    items: ['Categories & Tags', 'Locations', 'Automation rules']
  }
];

// Reusable MK Purple Button
function PrimaryButton({ children, onClick, style }) {
  return (
    <button 
      onClick={onClick}
      style={{
        height: 32, padding: '0 16px', backgroundColor: '#422670', color: '#fff',
        border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500,
        cursor: 'pointer', fontFamily: 'inherit',
        ...style
      }}
    >
      {children}
    </button>
  );
}

function SubtleButton({ children, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <button 
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        height: 32, padding: '0 16px', backgroundColor: hovered ? 'rgba(9, 30, 66, 0.04)' : 'transparent', 
        color: '#172B4D', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500,
        cursor: 'pointer', fontFamily: 'inherit', transition: 'background 0.1s'
      }}
    >
      {children}
    </button>
  );
}

// ─── Settings Views ────────────────────────────────────────────────────────

function GeneralConfig() {
  return (
    <>
      <p style={{ color: token('color.text.subtle', '#5E6C84'), fontSize: 14, marginBottom: 32 }}>
        Manage your organization details, localization defaults, and main operational settings.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        <section>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: token('color.text', '#172B4D') }}>Organization Profile</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ maxWidth: 440 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token('color.text.subtle', '#5E6C84'), marginBottom: 6 }}>Organization Name</label>
              <TextField defaultValue="Mending Kids" />
            </div>
            <div style={{ maxWidth: 440 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token('color.text.subtle', '#5E6C84'), marginBottom: 6 }}>Support Email</label>
              <TextField defaultValue="support@mendingkids.org" />
            </div>
            <div style={{ maxWidth: 440 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token('color.text.subtle', '#5E6C84'), marginBottom: 6 }}>Base URL</label>
              <TextField defaultValue="https://inventory.mendingkids.org" isReadOnly />
              <span style={{ fontSize: 12, color: token('color.text.subtlest', '#626F86'), marginTop: 4, display: 'block' }}>This is your site's permanent address.</span>
            </div>
          </div>
        </section>
        
        <hr style={{ border: 'none', height: 1, backgroundColor: token('color.border', '#DFE1E6') }} />

        <section>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: token('color.text', '#172B4D') }}>Internationalization</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ maxWidth: 440 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token('color.text.subtle', '#5E6C84'), marginBottom: 6 }}>Default Timezone</label>
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
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token('color.text.subtle', '#5E6C84'), marginBottom: 6 }}>Default Language</label>
              <Select 
                options={[{ label: 'English (United States)', value: 'en-US' }, { label: 'Spanish', value: 'es' }]}
                defaultValue={{ label: 'English (United States)', value: 'en-US' }}
              />
            </div>
          </div>
        </section>

        <section>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: token('color.text', '#172B4D') }}>Options</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Checkbox label="Allow users to vote on item requests" defaultChecked theme={(t) => ({ ...t, color: '#422670' })} />
            <Checkbox label="Enable public API access for integrations" />
            <Checkbox label="Show contact support floating widget" defaultChecked />
          </div>
        </section>

        <div style={{ paddingTop: 16, display: 'flex', gap: 8 }}>
          <PrimaryButton onClick={() => alert('Settings saved successfully.')}>Save configuration</PrimaryButton>
          <SubtleButton>Cancel</SubtleButton>
        </div>
      </div>
    </>
  );
}

function GlobalPermissions() {
  const head = {
    cells: [
      { key: 'permission', content: 'Permission', isSortable: false },
      { key: 'groups', content: 'Groups', isSortable: false },
      { key: 'actions', content: '', isSortable: false },
    ],
  };
  const rows = [
    { key: 'admin', cells: [{ content: <strong>Administer System</strong> }, { content: 'site-admins, system-administrators' }, { content: <a href="#" style={{color:'var(--ds-link)'}}>Edit</a> }] },
    { key: 'create', cells: [{ content: <strong>Create Missions</strong> }, { content: 'coordinators, site-admins' }, { content: <a href="#" style={{color:'var(--ds-link)'}}>Edit</a> }] },
    { key: 'manage', cells: [{ content: <strong>Manage Inventory</strong> }, { content: 'inventory-managers, site-admins' }, { content: <a href="#" style={{color:'var(--ds-link)'}}>Edit</a> }] },
    { key: 'view', cells: [{ content: <strong>View Reports</strong> }, { content: 'site-admins, external-partners' }, { content: <a href="#" style={{color:'var(--ds-link)'}}>Edit</a> }] },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <p style={{ color: token('color.text.subtle', '#5E6C84'), fontSize: 14 }}>
          Global permissions apply to the entire system, regardless of mission scope.
        </p>
        <PrimaryButton>Grant permission</PrimaryButton>
      </div>
      <DynamicTable head={head} rows={rows} rowsPerPage={10} defaultPage={1} loadingSpinnerSize="large" />
    </>
  );
}

function AuditLog() {
  const head = {
    cells: [
      { key: 'date', content: 'Date', isSortable: true },
      { key: 'user', content: 'User', isSortable: false },
      { key: 'category', content: 'Category', isSortable: false },
      { key: 'summary', content: 'Summary', isSortable: false },
    ],
  };
  const rows = [
    { key: '1', cells: [{ content: 'Today 10:14 AM' }, { content: 'Sarah Johnson' }, { content: 'Permissions' }, { content: 'Granted View Reports to external-partners' }] },
    { key: '2', cells: [{ content: 'Yesterday 04:30 PM' }, { content: 'Mark Patel' }, { content: 'General' }, { content: 'Changed Default Timezone to pt' }] },
    { key: '3', cells: [{ content: '14 Dec, 2025' }, { content: 'System' }, { content: 'Automation' }, { content: 'Rule triggered: Low stock alert' }] },
  ];

  return (
    <>
      <p style={{ color: token('color.text.subtle', '#5E6C84'), fontSize: 14, marginBottom: 20 }}>
        The audit log records all configuration changes made in your organization.
      </p>
      <DynamicTable head={head} rows={rows} rowsPerPage={10} defaultPage={1} />
    </>
  );
}

function Users() {
  const head = {
    cells: [
      { key: 'name', content: 'Name', isSortable: true },
      { key: 'email', content: 'Email', isSortable: true },
      { key: 'group', content: 'Group', isSortable: true },
      { key: 'last_active', content: 'Last active', isSortable: true },
      { key: 'status', content: 'Status', isSortable: false },
    ],
  };
  const rows = [
    { key: '1', cells: [{ content: <strong>Sarah Johnson</strong> }, { content: 's.johnson@mendingkids.org' }, { content: 'site-admins' }, { content: 'Just now' }, { content: <span style={{color: '#1a7f37', fontWeight: 600, fontSize: 12}}>Active</span> }] },
    { key: '2', cells: [{ content: <strong>Mark Patel</strong> }, { content: 'm.patel@mendingkids.org' }, { content: 'inventory-managers' }, { content: 'Yesterday' }, { content: <span style={{color: '#1a7f37', fontWeight: 600, fontSize: 12}}>Active</span> }] },
    { key: '3', cells: [{ content: <strong>Elena Torres</strong> }, { content: 'elena.t@mendingkids.org' }, { content: 'external-partners' }, { content: '12 Dec, 2025' }, { content: <span style={{color: '#1a7f37', fontWeight: 600, fontSize: 12}}>Active</span> }] },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <p style={{ color: token('color.text.subtle', '#5E6C84'), fontSize: 14 }}>
          Manage access and see everyone working in your workspace.
        </p>
        <PrimaryButton>Invite users</PrimaryButton>
      </div>
      <DynamicTable head={head} rows={rows} rowsPerPage={10} defaultPage={1} />
    </>
  );
}

function Groups() {
  const head = {
    cells: [
      { key: 'group', content: 'Group name', isSortable: true },
      { key: 'members', content: 'Members', isSortable: false },
      { key: 'type', content: 'Type', isSortable: false },
      { key: 'actions', content: '', isSortable: false },
    ],
  };
  const rows = [
    { key: '1', cells: [{ content: <strong>site-admins</strong> }, { content: '3 users' }, { content: 'System defined' }, { content: <a href="#" style={{color:'var(--ds-link)'}}>Edit</a> }] },
    { key: '2', cells: [{ content: <strong>inventory-managers</strong> }, { content: '12 users' }, { content: 'Custom group' }, { content: <a href="#" style={{color:'var(--ds-link)'}}>Edit</a> }] },
    { key: '3', cells: [{ content: <strong>external-partners</strong> }, { content: '45 users' }, { content: 'Custom group' }, { content: <a href="#" style={{color:'var(--ds-link)'}}>Edit</a> }] },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <p style={{ color: token('color.text.subtle', '#5E6C84'), fontSize: 14 }}>
          Groups let you assign access and permissions to multiple users at once.
        </p>
        <PrimaryButton>Create group</PrimaryButton>
      </div>
      <DynamicTable head={head} rows={rows} rowsPerPage={10} defaultPage={1} />
    </>
  );
}

function Authentication() {
  return (
    <>
      <p style={{ color: token('color.text.subtle', '#5E6C84'), fontSize: 14, marginBottom: 32 }}>
        Manage security policies, single sign-on (SSO), and login methods for your personnel.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 40 }}>
        <section>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 8, color: token('color.text', '#172B4D') }}>Single sign-on (SSO)</h3>
              <p style={{ color: token('color.text.subtlest', '#626F86'), fontSize: 14, margin: '0 0 16px', maxWidth: 500 }}>
                Allow users to authenticate using your organization's identity provider (e.g. Okta, Azure AD).
              </p>
            </div>
            <PrimaryButton>Setup SAML</PrimaryButton>
          </div>
          <div style={{ padding: 16, backgroundColor: '#F4F5F7', borderRadius: 4, display: 'inline-block' }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: '#44546F' }}>Status: Not configured</span>
          </div>
        </section>

        <hr style={{ border: 'none', height: 1, backgroundColor: token('color.border', '#DFE1E6') }} />

        <section>
          <h3 style={{ fontSize: 16, fontWeight: 600, marginBottom: 16, color: token('color.text', '#172B4D') }}>Password policy</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <Checkbox label="Require minimum 12 characters" defaultChecked />
            <Checkbox label="Require special characters and numbers" defaultChecked />
            <Checkbox label="Enforce 90-day password rotation" />
          </div>
          <div style={{ marginTop: 24 }}>
            <PrimaryButton>Save policy</PrimaryButton>
          </div>
        </section>
      </div>
    </>
  );
}

function CategoriesTags() {
  const head = {
    cells: [
      { key: 'name', content: 'Category name', isSortable: true },
      { key: 'color', content: 'Color code', isSortable: false },
      { key: 'usage', content: 'Used by', isSortable: false },
      { key: 'actions', content: '', isSortable: false },
    ],
  };
  const rows = [
    { key: '1', cells: [{ content: <strong>Cardiac</strong> }, { content: <span style={{display: 'flex', gap: 8}}><div style={{width: 16, height: 16, backgroundColor: '#1561cc', borderRadius: '50%'}}></div> Blue</span> }, { content: '124 items' }, { content: <a href="#" style={{color:'var(--ds-link)'}}>Edit</a> }] },
    { key: '2', cells: [{ content: <strong>Infections</strong> }, { content: <span style={{display: 'flex', gap: 8}}><div style={{width: 16, height: 16, backgroundColor: '#d63c8a', borderRadius: '50%'}}></div> Pink</span> }, { content: '19 items' }, { content: <a href="#" style={{color:'var(--ds-link)'}}>Edit</a> }] },
    { key: '3', cells: [{ content: <strong>ENT</strong> }, { content: <span style={{display: 'flex', gap: 8}}><div style={{width: 16, height: 16, backgroundColor: '#1a7f37', borderRadius: '50%'}}></div> Green</span> }, { content: '43 items' }, { content: <a href="#" style={{color:'var(--ds-link)'}}>Edit</a> }] },
    { key: '4', cells: [{ content: <strong>General</strong> }, { content: <span style={{display: 'flex', gap: 8}}><div style={{width: 16, height: 16, backgroundColor: '#cf4f27', borderRadius: '50%'}}></div> Orange</span> }, { content: '312 items' }, { content: <a href="#" style={{color:'var(--ds-link)'}}>Edit</a> }] },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <p style={{ color: token('color.text.subtle', '#5E6C84'), fontSize: 14 }}>
          Define the organizational tags and categories applied to inventory items and missions.
        </p>
        <PrimaryButton>Add category</PrimaryButton>
      </div>
      <DynamicTable head={head} rows={rows} rowsPerPage={10} defaultPage={1} />
    </>
  );
}

function Locations() {
  const head = {
    cells: [
      { key: 'name', content: 'Location name', isSortable: true },
      { key: 'type', content: 'Type', isSortable: true },
      { key: 'items', content: 'Stored Items', isSortable: false },
      { key: 'actions', content: '', isSortable: false },
    ],
  };
  const rows = [
    { key: '1', cells: [{ content: <strong>Main Warehouse Los Angeles</strong> }, { content: 'Facility' }, { content: '4,520' }, { content: <a href="#" style={{color:'var(--ds-link)'}}>Edit</a> }] },
    { key: '2', cells: [{ content: <strong>Cabinet 3B</strong> }, { content: 'Sub-location' }, { content: '142' }, { content: <a href="#" style={{color:'var(--ds-link)'}}>Edit</a> }] },
    { key: '3', cells: [{ content: <strong>Storage A</strong> }, { content: 'Sub-location' }, { content: '93' }, { content: <a href="#" style={{color:'var(--ds-link)'}}>Edit</a> }] },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <p style={{ color: token('color.text.subtle', '#5E6C84'), fontSize: 14 }}>
          Manage your physical warehouses and logical sub-locations (cabinets, shelves).
        </p>
        <PrimaryButton>Add location</PrimaryButton>
      </div>
      <DynamicTable head={head} rows={rows} rowsPerPage={10} defaultPage={1} />
    </>
  );
}

function AutomationRules() {
  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <p style={{ color: token('color.text.subtle', '#5E6C84'), fontSize: 14 }}>
          Automatically trigger actions, alerts, and workflows based on specific events.
        </p>
        <PrimaryButton>Create rule</PrimaryButton>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {[
          { name: 'Low Stock Alert', desc: 'When item quantity drops below threshold, notify Inventory Managers.', status: true },
          { name: 'Expiration Warning', desc: 'If item expires in < 90 days, add warning flag and assign task.', status: true },
          { name: 'Mission Completion Protocol', desc: 'When mission is marked Completed, automatically return un-used stock to Main Warehouse.', status: false },
        ].map((rule, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', border: '1px solid #DFE1E6', borderRadius: 4, backgroundColor: '#fff' }}>
            <div>
              <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#172B4D' }}>{rule.name}</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#5E6C84' }}>{rule.desc}</p>
            </div>
            <div>
              <span style={{ 
                padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700, 
                backgroundColor: rule.status ? '#E3FCEF' : '#DFE1E6', 
                color: rule.status ? '#006644' : '#42526E' 
              }}>
                {rule.status ? 'ENABLED' : 'DISABLED'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}


// ─── Main Component ────────────────────────────────────────────────────────

export default function SettingsPage({ onNavigate }) {
  const [activeTab, setActiveTab] = useState('General configuration');

  const renderContent = () => {
    switch (activeTab) {
      case 'General configuration': return <GeneralConfig />;
      case 'Global permissions':    return <GlobalPermissions />;
      case 'Audit log':             return <AuditLog />;
      case 'Users':                 return <Users />;
      case 'Groups':                return <Groups />;
      case 'Authentication':        return <Authentication />;
      case 'Categories & Tags':     return <CategoriesTags />;
      case 'Locations':             return <Locations />;
      case 'Automation rules':      return <AutomationRules />;
      default: return null;
    }
  };

  return (
    <PageLayout>
      <TopNavigation isFixed><TopNav onNavigate={onNavigate} /></TopNavigation>
      <Content>
        <div style={{ height: '100%' }}>
          <LeftSidebar width={260} id="settings-sidebar" isFixed={true}>
            <div style={{ 
              height: '100%', 
              backgroundColor: token('elevation.surface.sunken', '#F4F5F7'),
              borderRight: `1px solid ${token('color.border', '#EBECF0')}`,
              display: 'flex',
              flexDirection: 'column'
            }}>
              <div style={{ padding: '24px 16px 16px', borderBottom: `1px solid ${token('color.border', '#EBECF0')}` }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  {/* MK Purple icon background */}
                  <div style={{ width: 32, height: 32, backgroundColor: '#422670', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
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
                    background: 'none', border: 'none', color: 'var(--ds-text-selected)', cursor: 'pointer', 
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
                              backgroundColor: isActive ? 'var(--ds-background-selected)' : 'transparent',
                              color: isActive ? 'var(--ds-text-selected)' : token('color.text', '#172B4D'),
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
          </LeftSidebar>
        </div>

        {/* Main Content */}
        <Main>
          <div style={{ height: 'calc(100vh - 56px)', overflowY: 'auto' }}>
            <div style={{ padding: '32px 40px', maxWidth: 900, margin: '0 auto', paddingBottom: 100 }}>
            <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 500, color: token('color.text', '#172B4D') }}>
              {activeTab}
            </h1>
            {renderContent()}
            </div>
          </div>
        </Main>
      </Content>
    </PageLayout>
  );
}
