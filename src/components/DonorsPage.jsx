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

// Donors are fetched from Supabase.

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

export default function DonorsPage({ onNavigate, user, onSwitchAccount, onLogout }) {
  const [search, setSearch] = useState('');
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [formOpen, setFormOpen] = useState(false);
  const [detailOpen, setDetailOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    fetchDonors();
  }, []);

  const fetchDonors = async () => {
    setLoading(true);
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
    if (!error) fetchDonors();
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
    <PageLayout>
      <TopNavigation isFixed><TopNav onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} /></TopNavigation>
      <Content>
        <LeftSidebar width={mobileMenuOpen ? '100vw' : 240}>
          <div className={mobileMenuOpen ? "" : "sidebar-collapsed"} style={{ height: 'calc(100vh - 48px)' }}>
            <SideNav 
              active="donors" 
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
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: token('color.text', '#172B4D') }}>Donors & Partners</h1>
              <button onClick={handleAddUserClick} style={{ height: 32, padding: '0 16px', backgroundColor: '#422670', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                Add User
              </button>
            </div>
            
            <div style={{ paddingBottom: 16, borderBottom: `2px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`, marginBottom: 20 }}>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: 10, color: token('color.text.subtlest', '#626F86') }}>
                  <SearchIcon label="" />
                </span>
                <input
                  type="text"
                  placeholder="Search users by name or email"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ height: 34, width: 260, paddingLeft: 36, paddingRight: 10, border: `1px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`, borderRadius: 4, fontSize: 14, color: token('color.text', '#172B4D'), outline: 'none', fontFamily: 'inherit' }}
                />
              </div>
            </div>

            <div className="mobile-stack-table">
              <DynamicTable head={HEAD} rows={rows} rowsPerPage={10} defaultPage={1} isFixedSize />
            </div>
          </div>
        </Main>
      </Content>
      <UserFormPanel isOpen={formOpen} onClose={() => setFormOpen(false)} user={selectedUser} onSave={handleSaveUser} />
      <UserDetailPanel isOpen={detailOpen} onClose={() => setDetailOpen(false)} user={selectedUser} onEdit={handleEditClick} />
    </PageLayout>
  );
}
