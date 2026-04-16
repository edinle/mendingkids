import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PageLayout, TopNavigation, LeftSidebar, Content, Main } from '@atlaskit/page-layout';
import TextField from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import { Checkbox } from '@atlaskit/checkbox';
import DynamicTable from '@atlaskit/dynamic-table';
import Modal, { ModalTransition, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button';
import { IconButton } from '@atlaskit/button/new';
import SlidePanel from './SlidePanel';
import { token } from '@atlaskit/tokens';
import { supabase } from '../utils/supabase';

import TopNav from './TopNav';
import SideNav from './SideNav';
import FilterDropdown from './FilterDropdown';
import SearchIcon from '@atlaskit/icon/core/search';

// ─── Constants ─────────────────────────────────────────────────────────────

const SETTINGS_SECTIONS = [
  {
    title: 'System',
    items: ['General configuration', 'Global permissions', 'Audit log']
  },
  {
    title: 'User Management',
    items: ['Users', 'Access Requests', 'Groups', 'Authentication']
  },
  {
    title: 'Inventory Settings',
    items: ['Categories & Tags', 'Locations', 'Automation rules']
  }
];

const MOCK_GROUPS = [
  { id: '1', name: 'site-admins', members: '3 users', type: 'System defined' },
  { id: '2', name: 'inventory-managers', members: '12 users', type: 'Custom group' },
  { id: '3', name: 'external-partners', members: '45 users', type: 'Custom group' },
  { id: '4', name: 'interns', members: '8 users', type: 'Limited access' },
];

const FIXED_LOCATIONS = [
  { id: 'storage-a', name: 'Storage A', type: 'Facility' },
  { id: 'storage-b', name: 'Storage B', type: 'Facility' },
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
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchConfig();
  }, []);

  const DEFAULT_CONFIG = {
    name: 'Mending Kids',
    support_email: 'support@mendingkids.org',
    base_url: 'https://inventory.mendingkids.org',
    timezone: 'pt',
    language: 'en-US',
  };

  const fetchConfig = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('organization_settings').select('*').limit(1).maybeSingle();
    if (data) {
      setConfig(data);
    } else {
      // No row exists — insert defaults then use them
      const { data: inserted } = await supabase
        .from('organization_settings')
        .insert(DEFAULT_CONFIG)
        .select()
        .single();
      setConfig(inserted || DEFAULT_CONFIG);
    }
    setLoading(false);
  };

  const handleSave = async () => {
    setSaving(true);
    let error;
    if (config.id) {
      ({ error } = await supabase.from('organization_settings').update(config).eq('id', config.id));
    } else {
      ({ error } = await supabase.from('organization_settings').upsert(config));
    }
    setSaving(false);
    if (!error) {
      alert('Settings saved successfully.');
    }
  };

  if (loading) return <p>Loading configuration...</p>;
  if (!config) return <p>Unable to load settings. Please reload.</p>;

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
              <TextField value={config.name} onChange={(e) => setConfig({ ...config, name: e.target.value })} />
            </div>
            <div style={{ maxWidth: 440 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token('color.text.subtle', '#5E6C84'), marginBottom: 6 }}>Support Email</label>
              <TextField value={config.support_email} onChange={(e) => setConfig({ ...config, support_email: e.target.value })} />
            </div>
            <div style={{ maxWidth: 440 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token('color.text.subtle', '#5E6C84'), marginBottom: 6 }}>Base URL</label>
              <TextField value={config.base_url} isReadOnly />
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
                value={{ label: config.timezone === 'pt' ? '(GMT-08:00) Pacific Time (US & Canada)' : config.timezone, value: config.timezone }}
                onChange={(v) => setConfig({ ...config, timezone: v.value })}
              />
            </div>
            <div style={{ maxWidth: 440 }}>
              <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: token('color.text.subtle', '#5E6C84'), marginBottom: 6 }}>Default Language</label>
              <Select 
                options={[{ label: 'English (United States)', value: 'en-US' }, { label: 'Spanish', value: 'es' }]}
                value={{ label: config.language === 'en-US' ? 'English (United States)' : 'Spanish', value: config.language }}
                onChange={(v) => setConfig({ ...config, language: v.value })}
              />
            </div>
          </div>
        </section>

        <div style={{ paddingTop: 16, display: 'flex', gap: 8 }}>
          <PrimaryButton onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save configuration'}</PrimaryButton>
          <SubtleButton>Cancel</SubtleButton>
        </div>
      </div>
    </>
  );
}

function GlobalPermissions({ onAdd, onEdit }) {
  const [search, setSearch] = useState('');
  
  const head = {
    cells: [
      { key: 'permission', content: 'Permission', isSortable: false },
      { key: 'groups', content: 'Groups', isSortable: false },
      { key: 'actions', content: '', isSortable: false, width: 10 },
    ],
  };
  const rows = [
    { key: 'admin', cells: [{ content: <strong>Administer System</strong> }, { content: 'site-admins, system-administrators' }, { content: <a href="#" onClick={(e) => { e.preventDefault(); onEdit({ id: 'admin', name: 'Administer System' }); }} style={{color:'var(--ds-link)'}}>Edit</a> }] },
    { key: 'create', cells: [{ content: <strong>Create Missions</strong> }, { content: 'coordinators, site-admins' }, { content: <a href="#" onClick={(e) => { e.preventDefault(); onEdit({ id: 'create', name: 'Create Missions' }); }} style={{color:'var(--ds-link)'}}>Edit</a> }] },
    { key: 'manage', cells: [{ content: <strong>Manage Inventory</strong> }, { content: 'inventory-managers, site-admins' }, { content: <a href="#" onClick={(e) => { e.preventDefault(); onEdit({ id: 'manage', name: 'Manage Inventory' }); }} style={{color:'var(--ds-link)'}}>Edit</a> }] },
    { key: 'view', cells: [{ content: <strong>View Reports</strong> }, { content: 'site-admins, external-partners' }, { content: <a href="#" onClick={(e) => { e.preventDefault(); onEdit({ id: 'view', name: 'View Reports' }); }} style={{color:'var(--ds-link)'}}>Edit</a> }] },
  ].filter(r => r.cells[0].content.props.children.toLowerCase().includes(search.toLowerCase()));

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'flex-start' }}>
        <p style={{ color: token('color.text.subtle', '#5E6C84'), fontSize: 14, margin: 0, maxWidth: 500 }}>
          Global permissions apply to the entire system, regardless of mission scope.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <PrimaryButton onClick={onAdd}>Grant permission</PrimaryButton>
        </div>
      </div>

      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: 16, borderBottom: `2px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`, marginBottom: 20 
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Permissions don't need many filters */}
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', width: 220 }}>
          <TextField
            placeholder="Search permissions"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            elemBeforeInput={
              <span style={{ paddingLeft: 10, display: 'flex', color: token('color.text.subtlest', '#626F86') }}>
                <SearchIcon label="" size="small" />
              </span>
            }
          />
        </div>
      </div>

      <DynamicTable head={head} rows={rows} rowsPerPage={10} defaultPage={1} loadingSpinnerSize="large" />
    </>
  );
}

function AuditLog() {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('activity_log')
      .select('*, profiles(name)')
      .order('created_at', { ascending: false });
    
    if (data) {
      setLogs(data.map(l => ({
        key: l.id,
        cells: [
          { content: new Date(l.created_at).toLocaleString() },
          { content: l.profiles?.name || 'System' },
          { content: l.category || 'General' },
          { content: l.action_text }
        ]
      })));
    }
    setLoading(false);
  };

  const head = {
    cells: [
      { key: 'date', content: 'Date', isSortable: true },
      { key: 'user', content: 'User', isSortable: false },
      { key: 'category', content: 'Category', isSortable: false },
      { key: 'summary', content: 'Summary', isSortable: false },
    ],
  };

  return (
    <>
      <p style={{ color: token('color.text.subtle', '#5E6C84'), fontSize: 14, marginBottom: 20 }}>
        The audit log records all configuration changes and system events in your organization.
      </p>
      <DynamicTable head={head} rows={logs} rowsPerPage={10} defaultPage={1} isLoading={loading} />
    </>
  );
}

function Users({ onInvite, onEdit }) {
  const [search, setSearch] = useState('');
  const [groupFilter, setGroupFilter] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select(`
        *,
        user_groups (
          groups (
            name
          )
        )
      `);
    
    if (error) {
      console.error('Error fetching users:', error);
    } else {
      const mapped = data.map(u => ({
        id: u.id,
        name: u.name,
        email: u.email,
        initials: u.initials,
        role: u.role,
        lastActive: u.last_active ? new Date(u.last_active).toLocaleString() : 'Never',
        status: u.status || 'Active',
        groups: u.user_groups?.map(ug => ug.groups.name) || []
      }));
      setUsers(mapped);
    }
    setLoading(false);
  };

  const head = {
    cells: [
      { key: 'name', content: 'Name', isSortable: true },
      { key: 'email', content: 'Email', isSortable: true },
      { key: 'group', content: 'Groups', isSortable: true },
      { key: 'last_active', content: 'Last active', isSortable: true },
      { key: 'status', content: 'Status', isSortable: false },
      { key: 'actions', content: '', isSortable: false, width: 10 },
    ],
  };

  const filtered = users.filter(u => {
    if (groupFilter && !u.groups.includes(groupFilter)) return false;
    if (search && !u.name.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const rows = filtered.map(u => ({
    key: u.id,
    cells: [
      { content: (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 24, height: 24, borderRadius: '50%', backgroundColor: '#422670', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700 }}>
            {u.initials || u.name[0]}
          </div>
          <strong>{u.name}</strong>
        </div>
      ) },
      { content: u.email },
      { content: u.groups.join(', ') || <span style={{color: '#626F86'}}>No groups</span> },
      { content: u.lastActive },
      { content: (
        <span style={{
          backgroundColor: u.status === 'Active' ? '#E3FCEF' : u.status === 'Pending' ? '#FFF0B3' : '#FFEBE6',
          color: u.status === 'Active' ? '#006644' : u.status === 'Pending' ? '#856606' : '#BF2600',
          padding: '2px 8px', borderRadius: 3, fontSize: 12, fontWeight: 600
        }}>
          {u.status}
        </span>
      ) },
      { content: <a href="#" onClick={(e) => { e.preventDefault(); onEdit(u); }} style={{color:'var(--ds-link)'}}>Edit</a> }
    ],
  }));

  const allGroups = [...new Set(users.flatMap(u => u.groups))];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'flex-start' }}>
        <p style={{ color: token('color.text.subtle', '#5E6C84'), fontSize: 14, margin: 0, maxWidth: 500 }}>
          Manage access, set security credentials, and see everyone working in your workspace.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <PrimaryButton onClick={onInvite}>Set up new user</PrimaryButton>
        </div>
      </div>

      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: 16, borderBottom: `2px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`, marginBottom: 20 
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <FilterDropdown label="Group" options={allGroups} selected={groupFilter} onSelect={setGroupFilter} />
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', width: 220 }}>
          <TextField
            placeholder="Search users"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            elemBeforeInput={
              <span style={{ paddingLeft: 10, display: 'flex', color: token('color.text.subtlest', '#626F86') }}>
                <SearchIcon label="" size="small" />
              </span>
            }
          />
        </div>
      </div>

      <DynamicTable head={head} rows={rows} rowsPerPage={10} defaultPage={1} isLoading={loading} />
    </>
  );
}

function Groups({ onCreate, onEdit }) {
  const [search, setSearch] = useState('');
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('groups')
      .select(`
        *,
        user_groups (count)
      `);
    
    if (error) {
      console.error('Error fetching groups:', error);
    } else {
      setGroups(data.map(g => ({
        id: g.id,
        name: g.name,
        description: g.description,
        type: g.type,
        members: `${g.user_groups[0].count} users`
      })));
    }
    setLoading(false);
  };

  const head = {
    cells: [
      { key: 'group', content: 'Group name', isSortable: true },
      { key: 'members', content: 'Members', isSortable: false },
      { key: 'type', content: 'Type', isSortable: false },
      { key: 'actions', content: '', isSortable: false, width: 10 },
    ],
  };
  const filtered = groups.filter(g => g.name.toLowerCase().includes(search.toLowerCase()));
  
  const rows = filtered.map(g => ({
    key: g.id,
    cells: [
      { content: (
        <div>
          <strong style={{ display: 'block' }}>{g.name}</strong>
          <span style={{ fontSize: 12, color: '#626F86' }}>{g.description}</span>
        </div>
      ) },
      { content: g.members },
      { content: g.type },
      { content: <a href="#" onClick={(e) => { e.preventDefault(); onEdit(g); }} style={{color:'var(--ds-link)'}}>Edit</a> }
    ],
  }));

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20, alignItems: 'flex-start' }}>
        <p style={{ color: token('color.text.subtle', '#5E6C84'), fontSize: 14, margin: 0, maxWidth: 500 }}>
          Groups let you assign access and permissions to multiple users at once.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <PrimaryButton onClick={onCreate}>Create group</PrimaryButton>
        </div>
      </div>

      <div style={{ 
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        paddingBottom: 16, borderBottom: `2px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`, marginBottom: 20 
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          {/* Group filters could go here */}
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', width: 220 }}>
          <TextField
            placeholder="Search groups"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            elemBeforeInput={
              <span style={{ paddingLeft: 10, display: 'flex', color: token('color.text.subtlest', '#626F86') }}>
                <SearchIcon label="" size="small" />
              </span>
            }
          />
        </div>
      </div>

      <DynamicTable head={head} rows={rows} rowsPerPage={10} defaultPage={1} isLoading={loading} />
    </>
  );
}

function AccessRequests() {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorModal, setErrorModal] = useState({ isOpen: false, message: '' });

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('status', 'Pending');
    
    if (error) console.error(error);
    else setRequests(data);
    setLoading(false);
  };

  const handleAction = async (id, newStatus) => {
    const { error } = await supabase
      .from('profiles')
      .update({ status: newStatus })
      .eq('id', id);
    
    if (error) {
      setErrorModal({ isOpen: true, message: error.message });
    } else {
      fetchRequests();
    }
  };

  const head = {
    cells: [
      { key: 'name', content: 'Name' },
      { key: 'email', content: 'Email' },
      { key: 'date', content: 'Requested' },
      { key: 'actions', content: '' },
    ],
  };

  const rows = requests.map(r => ({
    key: r.id,
    cells: [
      { content: <strong>{r.name}</strong> },
      { content: r.email },
      { content: new Date(r.created_at).toLocaleDateString() },
      { content: (
        <div style={{ display: 'flex', gap: 8 }}>
          <button 
            onClick={() => handleAction(r.id, 'Active')}
            style={{ padding: '4px 12px', backgroundColor: '#E3FCEF', color: '#006644', border: '1px solid #006644', borderRadius: 3, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
          >
            Approve
          </button>
          <button 
            onClick={() => handleAction(r.id, 'Denied')}
            style={{ padding: '4px 12px', backgroundColor: '#FFEBE6', color: '#BF2600', border: '1px solid #BF2600', borderRadius: 3, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}
          >
            Deny
          </button>
        </div>
      ) }
    ]
  }));

  return (
    <>
      <p style={{ color: token('color.text.subtle', '#5E6C84'), fontSize: 14, marginBottom: 20 }}>
        Review and approve access requests from new personnel.
      </p>
      <DynamicTable head={head} rows={rows} isLoading={loading} />

      <ModalTransition>
        {errorModal.isOpen && (
          <Modal onClose={() => setErrorModal({ ...errorModal, isOpen: false })}>
            <ModalHeader>
              <ModalTitle>Action Failed</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p>{errorModal.message}</p>
            </ModalBody>
            <ModalFooter>
              <Button appearance="danger" onClick={() => setErrorModal({ ...errorModal, isOpen: false })}>
                Close
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
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

function CategoriesTags({ onAdd, onEdit }) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*');
    if (data) setCategories(data);
    setLoading(false);
  };

  const head = {
    cells: [
      { key: 'name', content: 'Category name', isSortable: true },
      { key: 'color', content: 'Color code', isSortable: false },
      { key: 'usage', content: 'Description', isSortable: false },
      { key: 'actions', content: '', isSortable: false },
    ],
  };

  const rows = categories.map(c => ({
    key: c.id,
    cells: [
      { content: <strong>{c.name}</strong> },
      { content: <span style={{display: 'flex', gap: 8}}><div style={{width: 16, height: 16, backgroundColor: c.color, borderRadius: '50%'}}></div> {c.color}</span> },
      { content: c.description || '—' },
      { content: <a href="#" onClick={(e) => { e.preventDefault(); onEdit(c); }} style={{color:'var(--ds-link)'}}>Edit</a> }
    ]
  }));

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <p style={{ color: token('color.text.subtle', '#5E6C84'), fontSize: 14 }}>
          Define the organizational tags and categories applied to inventory items and missions.
        </p>
        <PrimaryButton onClick={onAdd}>Add category</PrimaryButton>
      </div>
      <DynamicTable head={head} rows={rows} rowsPerPage={10} defaultPage={1} isLoading={loading} />
    </>
  );
}

function Locations({ onAdd, onEdit }) {
  const head = {
    cells: [
      { key: 'name', content: 'Location name', isSortable: true },
      { key: 'type', content: 'Type', isSortable: true },
    ],
  };

  const rows = FIXED_LOCATIONS.map(l => ({
    key: l.id,
    cells: [
      { content: <strong>{l.name}</strong> },
      { content: l.type },
    ]
  }));

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <p style={{ color: token('color.text.subtle', '#5E6C84'), fontSize: 14 }}>
          Locations are fixed for this workspace and currently limited to Storage A and Storage B.
        </p>
      </div>
      <DynamicTable head={head} rows={rows} rowsPerPage={10} defaultPage={1} isLoading={false} />
    </>
  );
}

function AutomationRules({ onAdd, onEdit }) {
  const rules = [
    { id: 'ar1', name: 'Low Stock Alert', desc: 'When item quantity drops below threshold, notify Inventory Managers.', status: true, trigger: 'qty', condition: 'lt', action: 'notify' },
    { id: 'ar2', name: 'Expiration Warning', desc: 'If item expires in < 90 days, add warning flag and assign task.', status: true, trigger: 'expiry', condition: 'loc', action: 'flag' },
    { id: 'ar3', name: 'Mission Completion Protocol', desc: 'When mission is marked Completed, automatically return un-used stock to Main Warehouse.', status: false, trigger: 'mission', condition: 'loc', action: 'task' },
  ];

  return (
    <>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 20 }}>
        <p style={{ color: token('color.text.subtle', '#5E6C84'), fontSize: 14 }}>
          Automatically trigger actions, alerts, and workflows based on specific events.
        </p>
        <PrimaryButton onClick={onAdd}>Create rule</PrimaryButton>
      </div>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {rules.map((rule, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 20px', border: '1px solid #DFE1E6', borderRadius: 4, backgroundColor: '#fff' }}>
            <div style={{ flex: 1 }}>
              <h4 style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#172B4D' }}>{rule.name}</h4>
              <p style={{ margin: 0, fontSize: 13, color: '#5E6C84' }}>{rule.desc}</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
              <span style={{ 
                padding: '2px 8px', borderRadius: 12, fontSize: 12, fontWeight: 700, 
                backgroundColor: rule.status ? '#E3FCEF' : '#DFE1E6', 
                color: rule.status ? '#006644' : '#42526E' 
              }}>
                {rule.status ? 'ENABLED' : 'DISABLED'}
              </span>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); onEdit(rule); }} 
                style={{ color: 'var(--ds-link)', fontSize: 14, fontWeight: 500 }}
              >
                Edit
              </a>
            </div>
          </div>
        ))}
      </div>
    </>
  );
}


// ─── Main Component ────────────────────────────────────────────────────────

export default function SettingsPage({ user, onSwitchAccount, onLogout }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('General configuration');
  const [isModalOpen, setIsModalOpen] = useState(null);
  const [groups, setGroups] = useState([]);
  const [editingItem, setEditingItem] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const [isAlertModalOpen, setIsAlertModalOpen] = useState(false);
  const [alertModalContent, setAlertModalContent] = useState({ title: '', body: '' });

  useEffect(() => {
    fetchGroups();
  }, []);

  const fetchGroups = async () => {
    const { data } = await supabase.from('groups').select('*');
    if (data) setGroups(data.map(g => g.name));
  };

  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    groups: [],
    passcode: '',
    role: 'Intern'
  });

  const openModal = (type, item = null) => {
    setEditingItem(item);
    if (type === 'invite' && item) {
      setFormData({
        name: item.name || '',
        email: item.email || '',
        groups: item.groups?.map(g => ({ label: g, value: g })) || [],
        passcode: '',
        role: item.role || 'Intern'
      });
    } else if (type === 'category') {
      setFormData({
        name: item?.name || '',
        color: item?.color || '#1561cc',
        description: item?.description || ''
      });
    } else if (type === 'location') {
      setFormData({
        name: item?.name || '',
        type: item?.type || 'Facility'
      });
    } else {
      setFormData({ name: '', email: '', groups: [], passcode: '', role: 'Intern' });
    }
    setIsModalOpen(type);
  };

  const handleSaveUser = async () => {
    if (editingItem && !showWarning) {
      setShowWarning(true);
      return;
    }

    try {
      console.log('Saving user data:', formData, 'Editing:', editingItem);
      
      const payload = {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        initials: formData.name ? formData.name.split(' ').map(n => n[0]).join('').toUpperCase() : '??'
      };

      let result;
      if (editingItem) {
        // Update existing profile
        result = await supabase
          .from('profiles')
          .update(payload)
          .eq('id', editingItem.id)
          .select();
      } else {
        // Create new profile
        result = await supabase
          .from('profiles')
          .insert(payload)
          .select();
      }

      const { data, error } = result;

      if (error) {
        console.error('Supabase error saving profile:', error);
        throw error;
      }

      if (data?.[0]) {
        const userId = data[0].id;
        console.log('Profile saved successfully, ID:', userId);

        // Handle group assignments
        // 1. Delete old groups
        await supabase.from('user_groups').delete().eq('user_id', userId);
        
        // 2. Add new groups
        if (formData.groups && formData.groups.length > 0) {
          const groupNames = formData.groups.map(g => g.label);
          console.log('Assigning groups:', groupNames);
          
          const { data: groupsData, error: groupFetchError } = await supabase
            .from('groups')
            .select('id, name')
            .in('name', groupNames);

          if (groupFetchError) throw groupFetchError;

          if (groupsData && groupsData.length > 0) {
            const inserts = groupsData.map(g => ({ user_id: userId, group_id: g.id }));
            const { error: groupInsertError } = await supabase.from('user_groups').insert(inserts);
            if (groupInsertError) throw groupInsertError;
          }
        }
      }

      closeModal();
      setShowWarning(false);
      // Refresh user list
      if (typeof window !== 'undefined') {
        window.location.reload(); 
      }
    } catch (err) {
      console.error('Failed to save user (internal catch):', err);
      setAlertModalContent({ 
        title: 'Error', 
        body: `Failed to save user: ${err.message || 'Unknown error'}. Check console for details.` 
      });
      setIsAlertModalOpen(true);
    }
  };
  const handleSaveCategory = async () => {
    const payload = {
      name: formData.name,
      color: formData.color,
      description: formData.description
    };
    const { error } = editingItem 
      ? await supabase.from('categories').update(payload).eq('id', editingItem.id)
      : await supabase.from('categories').insert(payload);
    
    if (error) alert(error.message);
    else { closeModal(); window.location.reload(); }
  };

  const closeModal = () => {
    setIsModalOpen(null);
    setEditingItem(null);
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'General configuration': return <GeneralConfig />;
      case 'Global permissions':    return <GlobalPermissions onAdd={() => openModal('permission')} onEdit={(item) => openModal('permission', item)} />;
      case 'Audit log':             return <AuditLog />;
      case 'Users':                 return <Users onInvite={() => openModal('invite')} onEdit={(item) => openModal('invite', item)} />;
      case 'Access Requests':       return <AccessRequests />;
      case 'Groups':                return <Groups onCreate={() => openModal('group')} onEdit={(item) => openModal('group', item)} />;
      case 'Authentication':        return <Authentication />;
      case 'Categories & Tags':     return <CategoriesTags onAdd={() => openModal('category')} onEdit={(item) => openModal('category', item)} />;
      case 'Locations':             return <Locations />;
      case 'Automation rules':      return <AutomationRules onAdd={() => openModal('automation')} onEdit={(item) => openModal('automation', item)} />;
      default: return null;
    }
  };

  return (
    <PageLayout>
      <TopNavigation isFixed>
        <TopNav user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
      </TopNavigation>
      <Content>
        <LeftSidebar width={mobileMenuOpen ? '100vw' : 240}>
          <div className={mobileMenuOpen ? "" : "sidebar-collapsed"} style={{ display: 'flex', flexDirection: 'column', height: '100%', borderRight: '1px solid #DFE1E6', backgroundColor: '#F4F5F7' }}>
            <div style={{ flex: 1, padding: '24px 16px', overflowY: 'auto' }}>
              <div style={{ padding: '0 8px 16px', borderBottom: '1px solid #DFE1E6', marginBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
                  <div style={{ width: 32, height: 32, backgroundColor: '#422670', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="white">
                      <path d="M14 2H2v12h12V2zM8 12.5a4.5 4.5 0 1 1 0-9 4.5 4.5 0 0 1 0 9zm0-2.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4z" />
                    </svg>
                  </div>
                  <h2 style={{ fontSize: 16, fontWeight: 600, color: '#172B4D', margin: 0 }}>
                    Settings
                  </h2>
                </div>
                <button 
                  onClick={() => navigate('/dashboard')}
                  style={{ 
                    background: 'none', border: 'none', color: 'var(--ds-link)', cursor: 'pointer', 
                    fontSize: 14, fontWeight: 500, padding: 0, display: 'flex', alignItems: 'center', gap: 4
                  }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M9 11L5 7l4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  Back to project
                </button>
              </div>

              {SETTINGS_SECTIONS.map((section, idx) => (
                <div key={idx} style={{ marginBottom: 24 }}>
                  <h3 style={{ margin: '0 8px 8px', fontSize: 11, fontWeight: 700, color: '#626F86', textTransform: 'uppercase' }}>{section.title}</h3>
                  {section.items.map(item => (
                    <div 
                      key={item}
                      onClick={() => { setActiveTab(item); if (mobileMenuOpen) setMobileMenuOpen(false); }}
                      style={{
                        padding: '8px 12px', borderRadius: 4, fontSize: 14, cursor: 'pointer',
                        backgroundColor: activeTab === item ? 'rgba(66, 38, 112, 0.08)' : 'transparent',
                        color: activeTab === item ? '#422670' : '#44546F',
                        fontWeight: activeTab === item ? 600 : 400,
                        marginBottom: 2
                      }}
                    >
                      {item}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            <div style={{ padding: '16px', borderTop: '1px solid #DFE1E6' }}>
               <SideNav 
                 accountOnly 
                 user={user} 
                 onSwitchAccount={onSwitchAccount} 
                 onLogout={onLogout} 
                 isMobile={mobileMenuOpen}
               />
            </div>
          </div>
        </LeftSidebar>

        {/* Main Content */}
        <Main>
          <div className="main-content">
            <div style={{ height: 'calc(100vh - 56px)', overflowY: 'auto' }}>
              <div style={{ padding: '32px 40px', maxWidth: 900, margin: '0 auto', paddingBottom: 100 }}>
              <h1 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 500, color: token('color.text', '#172B4D') }}>
                {activeTab}
              </h1>
              {renderContent()}
              </div>
            </div>
          </div>
        </Main>
      </Content>

      <ModalTransition>
        {isAlertModalOpen && (
          <Modal onClose={() => setIsAlertModalOpen(false)}>
            <ModalHeader>
              <ModalTitle>{alertModalContent.title}</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p>{alertModalContent.body}</p>
            </ModalBody>
            <ModalFooter>
              <Button appearance="primary" onClick={() => setIsAlertModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>

      <SlidePanel isOpen={!!isModalOpen} onClose={closeModal} width={540}>
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
          <div style={{ padding: '32px 32px 16px', borderBottom: '1px solid #DFE1E6' }}>
            <h2 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#172B4D' }}>
              {isModalOpen === 'category' && (editingItem ? 'Edit Category' : 'Add Category')}
              {isModalOpen === 'automation' && 'Create automation rule'}
              {isModalOpen === 'permission' && (editingItem ? 'Edit Permission' : 'Grant Permission')}
              {isModalOpen === 'invite' && 'Setup New User'}
              {isModalOpen === 'group' && (editingItem ? 'Edit Group' : 'Create Group')}
            </h2>
          </div>

          <div style={{ padding: 32, flex: 1, overflowY: 'auto' }}>
            {isModalOpen === 'category' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5E6C84', marginBottom: 6 }}>Category Name</label>
                  <TextField 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="e.g. Surgical Supplies" 
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5E6C84', marginBottom: 6 }}>Tag Color</label>
                  <Select 
                    options={[{label: 'Blue', value: '#1561cc'}, {label: 'Pink', value: '#d63c8a'}, {label: 'Green', value: '#1a7f37'}, {label: 'Orange', value: '#cf4f27'}]} 
                    value={{ label: 'Color', value: formData.color }}
                    onChange={(v) => setFormData({ ...formData, color: v.value })}
                  />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5E6C84', marginBottom: 6 }}>Description</label>
                  <TextField 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    placeholder="What's in this category?" 
                  />
                </div>
              </div>
            )}

            {isModalOpen === 'automation' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5E6C84', marginBottom: 6 }}>Rule Name</label>
                  <TextField defaultValue={editingItem?.name || ''} placeholder="e.g. Low Stock Alert" />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 12px', fontSize: 14 }}>Trigger</h4>
                  <Select 
                    placeholder="When..." 
                    options={[{label: 'Item quantity drops', value: 'qty'}, {label: 'Mission is completed', value: 'mission'}, {label: 'Item expires', value: 'expiry'}]} 
                    defaultValue={editingItem ? { label: ({ qty: 'Item quantity drops', mission: 'Mission is completed', expiry: 'Item expires' })[editingItem.trigger], value: editingItem.trigger } : null}
                  />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 12px', fontSize: 14 }}>Condition</h4>
                  <Select 
                    placeholder="If..." 
                    options={[{label: 'Quantity is less than', value: 'lt'}, {label: 'Location is', value: 'loc'}]} 
                    defaultValue={editingItem ? { label: ({ lt: 'Quantity is less than', loc: 'Location is' })[editingItem.condition], value: editingItem.condition } : null}
                  />
                </div>
                <div>
                  <h4 style={{ margin: '0 0 12px', fontSize: 14 }}>Action</h4>
                  <Select 
                    placeholder="Then..." 
                    options={[{label: 'Send notification to', value: 'notify'}, {label: 'Assign task to', value: 'task'}, {label: 'Flag as low stock', value: 'flag'}]} 
                    defaultValue={editingItem ? { label: ({ notify: 'Send notification to', task: 'Assign task to', flag: 'Flag as low stock' })[editingItem.action], value: editingItem.action } : null}
                  />
                </div>
              </div>
            )}

            {isModalOpen === 'permission' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5E6C84', marginBottom: 6 }}>Permission</label>
                  <Select isDisabled={!!editingItem} defaultValue={editingItem ? {label: editingItem.name, value: editingItem.id} : null} placeholder="Select permission..." options={[{label: 'Administer System', value: 'admin'}, {label: 'Create Missions', value: 'create'}]} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5E6C84', marginBottom: 6 }}>Grant to Groups</label>
                  <Select isMulti placeholder="Select groups..." options={[{label: 'site-admins', value: 'sa'}, {label: 'inventory-managers', value: 'im'}]} />
                </div>
              </div>
            )}

            {isModalOpen === 'invite' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div style={{ padding: '16px', backgroundColor: '#E9F2FF', borderRadius: 6, border: '1px solid #B3D4FF', marginBottom: 8 }}>
                   <p style={{ margin: 0, fontSize: 13, color: '#0055CC', lineHeight: 1.5 }}>
                     <strong>Flow:</strong> {editingItem ? 'Updating existing user profile' : 'Creating new workspace account'}. {formData.role === 'Intern' && 'Interns will have restricted access by default.'}
                   </p>
                </div>

                <section>
                  <h4 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: '#626F86' }}>User Details</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5E6C84', marginBottom: 6 }}>Full Name</label>
                      <TextField 
                        value={formData.name} 
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        placeholder="e.g. John Doe" 
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5E6C84', marginBottom: 6 }}>Email Address</label>
                      <TextField 
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        placeholder="e.g. john@mendingkids.org" 
                      />
                    </div>
                  </div>
                </section>

                <hr style={{ border: 'none', height: 1, backgroundColor: '#DFE1E6' }} />

                <section>
                  <h4 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: '#626F86' }}>Access & Groups</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5E6C84', marginBottom: 6 }}>Primary Role</label>
                      <Select 
                        options={[{label: 'Admin', value: 'Admin'}, {label: 'Coordinator', value: 'Coordinator'}, {label: 'Intern', value: 'Intern'}]}
                        value={{ label: formData.role, value: formData.role }}
                        onChange={(opt) => setFormData({ ...formData, role: opt.value })}
                      />
                    </div>
                    <div>
                      <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5E6C84', marginBottom: 6 }}>Assign to Groups</label>
                      <Select 
                        isMulti 
                        placeholder="Select groups..." 
                        options={groups.map(g => ({ label: g, value: g }))} 
                        value={formData.groups}
                        onChange={(opts) => setFormData({ ...formData, groups: opts })}
                      />
                    </div>
                  </div>
                </section>

                <hr style={{ border: 'none', height: 1, backgroundColor: '#DFE1E6' }} />

                <section style={{ padding: '20px', backgroundColor: '#F4F5F7', borderRadius: 8, border: '1px solid #DFE1E6' }}>
                  <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 700, color: '#172B4D', textTransform: 'uppercase' }}>Security Passcode</h4>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#626F86', marginBottom: 4 }}>Access Passcode</label>
                      <TextField 
                        type="password" 
                        placeholder="••••••" 
                        value={formData.passcode}
                        onChange={(e) => setFormData({ ...formData, passcode: e.target.value })}
                      />
                    </div>
                    <div style={{ flex: 1 }}>
                      <label style={{ display: 'block', fontSize: 11, fontWeight: 600, color: '#626F86', marginBottom: 4 }}>Confirm Passcode</label>
                      <TextField type="password" placeholder="••••••" />
                    </div>
                  </div>
                  <span style={{ fontSize: 11, color: '#626F86', marginTop: 8, display: 'block' }}>
                    {editingItem ? 'Leave blank to keep current passcode.' : 'Passcode must be at least 6 digits for mission security.'}
                  </span>
                </section>
              </div>
            )}

            {isModalOpen === 'group' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5E6C84', marginBottom: 6 }}>Group Name</label>
                  <TextField defaultValue={editingItem?.name || ''} placeholder="e.g. mission-coordinators" />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#5E6C84', marginBottom: 6 }}>Description</label>
                  <TextField placeholder="Who is in this group?" />
                </div>

                <div style={{ borderTop: '1px solid #DFE1E6', paddingTop: 24 }}>
                  <h4 style={{ margin: '0 0 16px', fontSize: 14, fontWeight: 600 }}>Assign Permissions to this Group</h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {[
                      { id: 'p1', name: 'Administer System', desc: 'Can manage all settings, users, and organization data.' },
                      { id: 'p2', name: 'Create Missions', desc: 'Can create new missions and assign personnel.' },
                      { id: 'p3', name: 'Manage Inventory', desc: 'Full access to items, shipments, and warehouses.' },
                      { id: 'p4', name: 'View Reports', desc: 'Can view audit logs and financial mission reports.' },
                    ].map(p => (
                      <div key={p.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px', borderRadius: 6, border: '1px solid #f0f0f0' }}>
                        <Checkbox theme={(t) => ({ ...t, color: '#422670' })} />
                        <div>
                          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#172B4D' }}>{p.name}</label>
                          <span style={{ fontSize: 12, color: '#626F86' }}>{p.desc}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {editingItem?.name === 'interns' && (
                  <div style={{ padding: 16, backgroundColor: '#FFF7E6', border: '1px solid #FFD591', borderRadius: 4 }}>
                    <h4 style={{ margin: '0 0 8px', color: '#874D00', fontSize: 13 }}>Intern Group Policy</h4>
                    <p style={{ margin: 0, fontSize: 12, color: '#874D00', lineHeight: 1.5 }}>
                      Users in this group are <strong>restricted</strong>. All item requests and inventory audits performerd by interns require manual approval by a <code>site-admin</code> before being finalized.
                    </p>
                    <div style={{ marginTop: 12 }}>
                      <Checkbox label="Require admin approval for all requests" defaultChecked isDisabled />
                      <Checkbox label="Restrict access to mission financial data" defaultChecked />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          <div style={{ padding: '24px 32px', borderTop: '1px solid #DFE1E6', display: 'flex', gap: 12 }}>
            <PrimaryButton onClick={
              isModalOpen === 'invite' ? handleSaveUser : 
              isModalOpen === 'category' ? handleSaveCategory :
              closeModal
            }>
              {editingItem ? 'Save changes' : 'Create'}
            </PrimaryButton>
            <SubtleButton onClick={closeModal}>Cancel</SubtleButton>
          </div>
        </div>
      </SlidePanel>

      <ModalTransition>
        {showWarning && (
          <Modal onClose={() => setShowWarning(false)}>
            <ModalHeader>
              <ModalTitle appearance="warning">Review profile changes</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p>You are about to update <strong>{editingItem.name}</strong>'s profile and permissions. This may change their access levels across missions and inventory items.</p>
              <p>Are you sure you want to proceed with these changes?</p>
            </ModalBody>
            <ModalFooter>
              <Button appearance="subtle" onClick={() => setShowWarning(false)}>Cancel</Button>
              <Button appearance="warning" onClick={handleSaveUser}>Confirm changes</Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
    </PageLayout>
  );
}
