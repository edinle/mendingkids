import { useState, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { PageLayout, TopNavigation, LeftSidebar, Content, Main } from '@atlaskit/page-layout';
import DynamicTable from '@atlaskit/dynamic-table';
import { IconButton } from '@atlaskit/button/new';
import EditIcon from '@atlaskit/icon/core/edit';
import ShowMoreHorizontalIcon from '@atlaskit/icon/core/show-more-horizontal';
import SearchIcon from '@atlaskit/icon/core/search';
import { token } from '@atlaskit/tokens';

import TopNav from './TopNav';
import SideNav from './SideNav';
import UserFormPanel from './UserFormPanel';
import UserDetailPanel from './UserDetailPanel';
import Popup from '@atlaskit/popup';
import Button from '@atlaskit/button/new';

function TableConfigPopover({ columns, onWidthChange }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popup
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      placement="bottom-end"
      content={() => (
        <div style={{ padding: '16px', minWidth: 260, backgroundColor: '#fff', borderRadius: 4, boxShadow: '0 4px 16px rgba(9,30,66,0.16)' }}>
          <h4 style={{ margin: '0 0 16px', fontSize: 13, fontWeight: 700, color: '#172B4D', textTransform: 'uppercase' }}>Column Widths (%)</h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {columns.map(col => col.key !== 'actions' && (
              <div key={col.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <label style={{ fontSize: 12, color: '#44546F' }}>{col.label}</label>
                  <span style={{ fontSize: 11, fontWeight: 700, color: '#422670' }}>{col.width}%</span>
                </div>
                <input 
                  type="range" min="5" max="40" value={col.width} 
                  onChange={(e) => onWidthChange(col.key, parseInt(e.target.value))}
                  style={{ width: '100%', accentColor: '#422670', cursor: 'pointer' }}
                />
              </div>
            ))}
          </div>
        </div>
      )}
      trigger={(triggerProps) => (
        <Button
          {...triggerProps}
          iconBefore={<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1Z"/></svg>}
          onClick={() => setIsOpen(!isOpen)}
          appearance="subtle"
        >
          Layout
        </Button>
      )}
    />
  );
}

// Volunteers are fetched from Supabase.

const HEAD = {
  cells: [
    { key: 'name', content: 'Name', isSortable: true, width: 22 },
    { key: 'email', content: 'Email', isSortable: true, width: 20 },
    { key: 'role', content: 'Role', isSortable: true, width: 12 },
    { key: 'organization', content: 'Organization', isSortable: true, width: 18 },
    { key: 'status', content: 'Status', isSortable: true, width: 10 },
    { key: 'lastActive', content: 'Last Active', isSortable: true, width: 13 },
    { key: 'actions', content: 'Actions', width: 5 },
  ],
};

function StatusBadge({ status }) {
  const bg = status === 'Active' ? '#E3FCEF' : '#FFEBE6';
  const text = status === 'Active' ? '#006644' : '#BF2600';
  return (
    <span style={{ backgroundColor: bg, color: text, padding: '2px 6px', borderRadius: 3, fontSize: 12, fontWeight: 600 }}>
      {status}
    </span>
  );
}

export default function VolunteersPage({ onNavigate, user, onSwitchAccount, onLogout }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [colWidths, setColWidths] = useState({
    name: 22, email: 20, role: 12, organization: 18, status: 10, lastActive: 13
  });

  const handleWidthChange = (key, val) => setColWidths(prev => ({ ...prev, [key]: val }));

  useEffect(() => {
    fetchVolunteers();
  }, []);

  const fetchVolunteers = async () => {
    setLoading(true);
    // In a real app, we might filter by a 'type' column. 
    // For now, we fetch from donors table which handles external personnel.
    const { data } = await supabase.from('donors').select('*');
    if (data) setUsers(data);
    setLoading(false);
  };

  const handleAddUserClick = () => {
    setSelectedUser(null);
    setFormOpen(true);
  };

  const handleEditClick = (user, e) => {
    if (e) e.stopPropagation();
    setSelectedUser(user);
    setDetailOpen(false);
    setFormOpen(true);
  };

  const handleRowClick = (user) => {
    setSelectedUser(user);
    setDetailOpen(true);
  };

  const handleSaveUser = async (userData) => {
    const { error } = await supabase.from('donors').upsert(userData);
    if (!error) fetchVolunteers();
  };
  
  const filtered = users.filter(d => 
    d.name.toLowerCase().includes(search.toLowerCase()) || 
    d.email.toLowerCase().includes(search.toLowerCase())
  );

  const rows = filtered.map(row => ({
    key: String(row.id),
    onClick: () => handleRowClick(row),
    cells: [
      { key: 'name', content: <div style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer' }}>
          <div style={{ width: 28, height: 28, backgroundColor: '#422670', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 'bold' }}>
            {row.name.charAt(0)}
          </div>
          <span style={{ fontWeight: 500, color: '#172B4D' }}>{row.name}</span>
        </div> },
      { key: 'email', content: <span style={{ color: '#44546F' }}>{row.email}</span> },
      { key: 'role', content: row.role },
      { key: 'organization', content: row.organization },
      { key: 'status', content: <StatusBadge status={row.status} /> },
      { key: 'lastActive', content: <span style={{ color: '#626F86', fontSize: 13 }}>{row.lastActive}</span> },
      { key: 'actions', content: (
          <span style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
            <IconButton icon={EditIcon} label="Edit" appearance="subtle" spacing="compact" onClick={(e) => handleEditClick(row, e)} />
            <IconButton icon={ShowMoreHorizontalIcon} label="More" appearance="subtle" spacing="compact" />
          </span>
        ) 
      },
    ]
  }));

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
    <PageLayout>
      <TopNavigation isFixed><TopNav onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} /></TopNavigation>
      <Content>
        <LeftSidebar width={mobileMenuOpen ? '100vw' : 240}>
          <div className={mobileMenuOpen ? "" : "sidebar-collapsed"} style={{ height: 'calc(100vh - 48px)' }}>
            <SideNav 
              active="volunteers" 
              onNavigate={onNavigate} 
              user={user} 
              onSwitchAccount={onSwitchAccount} 
              onLogout={onLogout}
              isMobile={mobileMenuOpen}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </LeftSidebar>
        <Main>
          <div className="main-content">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: token('color.text', '#172B4D') }}>Volunteers</h1>
              <button onClick={handleAddUserClick} style={{ height: 32, padding: '0 16px', backgroundColor: '#422670', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                Add Volunteer
              </button>
            </div>
            
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingBottom: 16, borderBottom: `2px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`, marginBottom: 20 
            }}>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: 10, color: token('color.text.subtlest', '#626F86') }}>
                  <SearchIcon label="" />
                </span>
                <input
                  type="text"
                  placeholder="Search volunteers by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ height: 34, width: 260, paddingLeft: 36, paddingRight: 10, border: `1px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`, borderRadius: 4, fontSize: 14, color: token('color.text', '#172B4D'), outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
              <TableConfigPopover 
                columns={[
                  { key: 'name', label: 'Name', width: colWidths.name },
                  { key: 'email', label: 'Email', width: colWidths.email },
                  { key: 'role', label: 'Role', width: colWidths.role },
                  { key: 'organization', label: 'Organization', width: colWidths.organization },
                  { key: 'status', label: 'Status', width: colWidths.status },
                  { key: 'lastActive', label: 'Last Active', width: colWidths.lastActive },
                ]}
                onWidthChange={handleWidthChange}
              />
            </div>

            <div className="mobile-stack-table">
              <DynamicTable 
                head={{
                  cells: [
                    { key: 'name', content: 'Name', isSortable: true, width: colWidths.name },
                    { key: 'email', content: 'Email', isSortable: true, width: colWidths.email },
                    { key: 'role', content: 'Role', isSortable: true, width: colWidths.role },
                    { key: 'organization', content: 'Organization', isSortable: true, width: colWidths.organization },
                    { key: 'status', content: 'Status', isSortable: true, width: colWidths.status },
                    { key: 'lastActive', content: 'Last Active', isSortable: true, width: colWidths.lastActive },
                    { key: 'actions', content: 'Actions', width: 5 },
                  ]
                }} 
                rows={rows} 
                rowsPerPage={10} 
                defaultPage={1} 
                isFixedSize 
              />
            </div>
          </div>
        </Main>
      </Content>
      <UserFormPanel isOpen={formOpen} onClose={() => setFormOpen(false)} user={selectedUser} onSave={handleSaveUser} />
      <UserDetailPanel isOpen={detailOpen} onClose={() => setDetailOpen(false)} user={selectedUser} onEdit={handleEditClick} />
    </PageLayout>
    </div>
  );
}
