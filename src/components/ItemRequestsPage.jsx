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
import RequestDetailPanel from './RequestDetailPanel';
import RequestFormPanel from './RequestFormPanel';
import FilterDropdown from './FilterDropdown';

// Requests are fetched from Supabase.

const HEAD = {
  cells: [
    { key: 'id', content: 'Request ID', isSortable: true, width: 12 },
    { key: 'requester', content: 'Requester', isSortable: true, width: 22 },
    { key: 'mission', content: 'Mission', isSortable: true, width: 22 },
    { key: 'status', content: 'Status', isSortable: true, width: 12 },
    { key: 'priority', content: 'Priority', isSortable: true, width: 12 },
    { key: 'date', content: 'Date Created', isSortable: true, width: 15 },
    { key: 'actions', content: 'Actions', width: 5 },
  ],
};

function StatusBadge({ status }) {
  let bg = '#DFE1E6', text = '#42526E';
  if (status === 'Approved') { bg = '#E3FCEF'; text = '#006644'; }
  else if (status === 'Pending') { bg = '#FFFAE6'; text = '#FF8B00'; }
  else if (status === 'In Progress') { bg = '#DEEBFF'; text = '#0747A6'; }
  else if (status === 'Declined') { bg = '#FFEBE6'; text = '#BF2600'; }
  return (
    <span style={{ backgroundColor: bg, color: text, padding: '2px 8px', borderRadius: 3, fontSize: 12, fontWeight: 600 }}>
      {status}
    </span>
  );
}

function PriorityBadge({ priority }) {
  let color = '#FF5630';
  if (priority === 'Medium') color = '#FFAB00';
  if (priority === 'Low') color = '#36B37E';
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 500, fontSize: 13, color: '#172B4D' }}>
      <div style={{ width: 12, height: 12, backgroundColor: color, borderRadius: 2 }} />
      {priority}
    </div>
  );
}

export default function ItemRequestsPage({ user, onSwitchAccount, onLogout }) {
  const [search, setSearch] = useState('');
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const [statusFilter, setStatusFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [missionFilter, setMissionFilter] = useState('');
  
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    setLoading(true);
    const { data } = await supabase
      .from('requests')
      .select(`
        *,
        profiles ( name ),
        missions ( name )
      `);
    
    if (data) {
      const mapped = data.map(r => ({
        id: r.id,
        requester: r.profiles?.name || 'Unknown',
        mission: r.missions?.name || 'General',
        status: r.status,
        priority: r.priority,
        date: new Date(r.date_created).toLocaleDateString()
      }));
      setRequests(mapped);
    }
    setLoading(false);
  };

  const handleRowClick = (req) => {
    setSelectedRequest(req);
    setDetailOpen(true);
  };

  const handleUpdateStatus = async (id, newStatus) => {
    const { error } = await supabase.from('requests').update({ status: newStatus }).eq('id', id);
    if (!error) fetchRequests();
  };

  const handleSaveNewRequest = async (reqData) => {
    const { error } = await supabase.from('requests').insert(reqData);
    if (!error) fetchRequests();
  };
  
  const filtered = requests.filter(r => {
    if (statusFilter && r.status !== statusFilter) return false;
    if (priorityFilter && r.priority !== priorityFilter) return false;
    if (missionFilter && r.mission !== missionFilter) return false;
    if (search && !r.id.toLowerCase().includes(search.toLowerCase()) && !r.requester.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const allMissions = [...new Set(requests.map(r => r.mission))];

  const rows = filtered.map(row => ({
    key: row.id,
    onClick: () => handleRowClick(row),
    cells: [
      { key: 'id', content: <span style={{ color: 'var(--ds-link)', fontWeight: 500, cursor: 'pointer' }}>{row.id}</span> },
      { key: 'requester', content: <span style={{ fontWeight: 500, color: '#172B4D' }}>{row.requester}</span> },
      { key: 'mission', content: row.mission },
      { key: 'status', content: <StatusBadge status={row.status} /> },
      { key: 'priority', content: <PriorityBadge priority={row.priority} /> },
      { key: 'date', content: <span style={{ color: '#626F86', fontSize: 13 }}>{row.date}</span> },
      { key: 'actions', content: (
          <span style={{ display: 'flex', gap: 4 }} onClick={e => e.stopPropagation()}>
            <IconButton icon={EditIcon} label="Edit" appearance="subtle" spacing="compact" />
          </span>
        ) 
      },
    ]
  }));

  return (
    <PageLayout>
      <TopNavigation isFixed><TopNav user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} /></TopNavigation>
      <Content>
        <LeftSidebar width={mobileMenuOpen ? '100vw' : 240}>
          <div className={mobileMenuOpen ? "" : "sidebar-collapsed"} style={{ height: 'calc(100vh - 56px)' }}>
            <SideNav 
              active="requests" 
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
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: token('color.text', '#172B4D') }}>Item Requests</h1>
              <button 
                onClick={() => setFormOpen(true)}
                style={{ height: 32, padding: '0 16px', backgroundColor: '#422670', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                New Request
              </button>
            </div>
            
            <div style={{ 
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              paddingBottom: 16, borderBottom: `2px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`, marginBottom: 20 
            }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <FilterDropdown label="Mission" options={allMissions} selected={missionFilter} onSelect={setMissionFilter} />
                <FilterDropdown label="Status" options={['Pending', 'Approved', 'In Progress', 'Declined']} selected={statusFilter} onSelect={setStatusFilter} />
                <FilterDropdown label="Priority" options={['High', 'Medium', 'Low']} selected={priorityFilter} onSelect={setPriorityFilter} />
              </div>
              <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: 10, color: token('color.text.subtlest', '#626F86') }}>
                  <SearchIcon label="" />
                </span>
                <input
                  type="text"
                  placeholder="Search requests"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ height: 32, width: 260, paddingLeft: 36, paddingRight: 10, border: `1px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`, borderRadius: 4, fontSize: 14, color: token('color.text', '#172B4D'), outline: 'none', fontFamily: 'inherit', backgroundColor: token('elevation.surface.sunken', '#F4F5F7') }}
                />
              </div>
            </div>

            <div className="mobile-stack-table">
              <DynamicTable head={HEAD} rows={rows} rowsPerPage={10} defaultPage={1} isFixedSize />
            </div>
          </div>
        </Main>
      </Content>
      <RequestDetailPanel isOpen={detailOpen} onClose={() => setDetailOpen(false)} request={selectedRequest} onUpdateStatus={handleUpdateStatus} />
      <RequestFormPanel isOpen={formOpen} onClose={() => setFormOpen(false)} onSave={handleSaveNewRequest} />
    </PageLayout>
  );
}
