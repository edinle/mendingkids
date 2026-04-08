import { useState, useRef, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import {
  PageLayout,
  TopNavigation,
  LeftSidebar,
  Content,
  Main,
} from '@atlaskit/page-layout';
import DynamicTable from '@atlaskit/dynamic-table';
import Button, { IconButton } from '@atlaskit/button/new';
import AddIcon from '@atlaskit/icon/core/add';
import EditIcon from '@atlaskit/icon/core/edit';
import ShowMoreHorizontalIcon from '@atlaskit/icon/core/show-more-horizontal';
import SearchIcon from '@atlaskit/icon/core/search';
import { token } from '@atlaskit/tokens';

import TopNav from './TopNav';
import SideNav from './SideNav';
import ItemPanel from './ItemPanel';
import OverviewPanel from './OverviewPanel';
import AssignToMissionPanel from './AssignToMissionPanel';
import { Section, ButtonItem } from '@atlaskit/menu';
import Popup from '@atlaskit/popup';

// ── Data ────────────────────────────────────────────────────────────
// The data now comes from Supabase via the shipments and inventory tables.

// ── Table Heads ────────────────────────────────────────────────────────────

const AVAILABLE_HEAD = {
  cells: [
    { key: 'description', content: 'Item Description',      isSortable: true, width: 22 },
    { key: 'company',     content: 'Manufacturing Company',  isSortable: true, width: 15 },
    { key: 'reference',   content: 'Reference Number',       isSortable: true, width: 14 },
    { key: 'quantity',    content: 'Quantity',                isSortable: true, width: 8 },
    { key: 'location',    content: 'Location',               isSortable: true, width: 14 },
    { key: 'expiration',  content: 'Expiration Date',        isSortable: true, width: 12 },
    { key: 'actions',     content: 'Actions',                                  width: 10 },
  ],
};

const IN_USE_HEAD = {
  cells: [
    { key: 'description', content: 'Item Description',      isSortable: true, width: 20 },
    { key: 'company',     content: 'Manufacturing Company',  isSortable: true, width: 13 },
    { key: 'reference',   content: 'Reference Number',       isSortable: true, width: 13 },
    { key: 'quantity',    content: 'Quantity',                isSortable: true, width: 7 },
    { key: 'mission',     content: 'Mission',                isSortable: true, width: 14 },
    { key: 'location',    content: 'Location',               isSortable: true, width: 12 },
    { key: 'expiration',  content: 'Expiration Date',        isSortable: true, width: 11 },
    { key: 'actions',     content: 'Actions',                                  width: 10 },
  ],
};

const ARCHIVED_HEAD = {
  cells: [
    { key: 'description', content: 'Item Description',      isSortable: true, width: 22 },
    { key: 'company',     content: 'Manufacturing Company',  isSortable: true, width: 15 },
    { key: 'reference',   content: 'Reference Number',       isSortable: true, width: 14 },
    { key: 'quantity',    content: 'Quantity',                isSortable: true, width: 10 },
    { key: 'location',    content: 'Last Location',          isSortable: true, width: 14 },
    { key: 'expiration',  content: 'Expiration Date',        isSortable: true, width: 14 },
    { key: 'actions',     content: 'Actions',                                  width: 10 },
  ],
};

// ── Sub-components ─────────────────────────────────────────────────────────

function QuantityBadge({ value }) {
  const bgColor =
    value >= 1000 ? '#FFBE33' :
    value >= 100  ? '#F8E6A0' :
    token('color.background.neutral', '#DFE1E6');

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 28, padding: '2px 8px',
      backgroundColor: bgColor,
      borderRadius: 12, fontSize: 12, fontWeight: 600,
      color: token('color.text', '#172B4D'),
    }}>
      {value}
    </span>
  );
}

function MissionBadge({ mission }) {
  if (!mission) return <span style={{ color: '#8590A2' }}>—</span>;

  const colorMap = {
    'Benin Cleft Lip & Palate': { bg: '#F3F0FF', color: '#5E4DB2', border: '#DFD8FD' },
    'Guatemala Orthopedic 2026': { bg: '#E9F2FF', color: '#0055CC', border: '#B3D4FF' },
    'Tanzania Cardiac Relief':   { bg: '#FFF3EB', color: '#974F0C', border: '#FAE1C7' },
  };
  const c = colorMap[mission] || { bg: '#F1F2F4', color: '#44546F', border: '#DFE1E6' };

  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 8px', borderRadius: 3,
      backgroundColor: c.bg, border: `1px solid ${c.border}`,
      fontSize: 11, fontWeight: 600, color: c.color,
      whiteSpace: 'nowrap',
    }}>
      {mission}
    </span>
  );
}

// ── Filter Dropdown ────────────────────────────────────────────────────────

function ActionMenu({ onItemAction }) {
  const [isOpen, setIsOpen] = useState(false);
  return (
    <Popup
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      placement="bottom-end"
      content={() => (
        <div style={{ minWidth: 160 }}>
          <Section>
            {onItemAction && onItemAction.status === 'archived' ? (
              <ButtonItem onClick={() => { setIsOpen(false); onItemAction('restore'); }}>Restore Item</ButtonItem>
            ) : (
              <>
                <ButtonItem onClick={() => { setIsOpen(false); onItemAction('new-entry'); }}>New Entry</ButtonItem>
                <ButtonItem onClick={() => { setIsOpen(false); onItemAction('assign'); }}>Assign to Mission</ButtonItem>
                <ButtonItem onClick={() => { setIsOpen(false); onItemAction('archive'); }}>Archive</ButtonItem>
              </>
            )}
            <ButtonItem 
              onClick={() => { setIsOpen(false); onItemAction('delete'); }}
              style={{ color: '#AE2E24' }}
            >
              Delete
            </ButtonItem>
          </Section>
        </div>
      )}
      trigger={(triggerProps) => (
        <IconButton
          {...triggerProps}
          icon={ShowMoreHorizontalIcon}
          label="More"
          appearance="subtle"
          spacing="compact"
          onClick={() => setIsOpen(!isOpen)}
        />
      )}
    />
  );
}

function FilterOption({ label, isSelected, onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      style={{
        display: 'block', width: '100%', padding: '8px 12px',
        border: 'none', 
        background: isSelected ? '#F3F0FF' : hover ? '#FAFBFC' : 'transparent',
        cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
        color: token('color.text', '#172B4D'), textAlign: 'left',
        fontWeight: isSelected ? 600 : 400,
        transition: 'background-color 0.1s',
      }}
    >
      {label}
    </button>
  );
}

function FilterDropdown({ label, hasIcon, options, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const dropRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div ref={dropRef} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          height: 32, padding: '0 10px',
          border: `1px solid ${(selected || isHovered) ? '#422670' : token('color.border', 'rgba(9,30,66,0.14)')}`,
          borderRadius: 4,
          background: selected ? '#F3F0FF' : isHovered ? '#FAFBFC' : token('elevation.surface', '#fff'),
          cursor: 'pointer', fontSize: 14,
          color: (selected || isHovered) ? '#422670' : token('color.text', '#172B4D'),
          fontFamily: 'inherit', fontWeight: selected ? 500 : 400,
          transition: 'all 0.2s',
        }}
      >
        {hasIcon && (
          <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1.5" y="3.5" width="13" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M5 2v3M11 2v3M1.5 7h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
        {selected || label}
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <path d={open ? "M4 10l4-4 4 4" : "M4 6l4 4 4-4"} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>

      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4,
          minWidth: 200, padding: '4px 0',
          backgroundColor: '#fff', borderRadius: 4,
          boxShadow: '0 4px 16px rgba(9,30,66,0.16), 0 0 1px rgba(9,30,66,0.12)',
          zIndex: 100,
        }}>
          <FilterOption 
            label="All" 
            isSelected={!selected} 
            onClick={() => { onSelect(''); setOpen(false); }} 
          />
          {options.map((opt) => (
            <FilterOption 
              key={opt}
              label={opt} 
              isSelected={selected === opt} 
              onClick={() => { onSelect(opt); setOpen(false); }} 
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ── Expiration categories ──────────────────────────────────────────────────
const EXPIRATION_OPTIONS = ['Expired', 'Within 3 Months', 'Within 6 Months', 'Within 1 Year', '1+ Year'];

function getExpirationCategory(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return '1+ Year';
  const now = new Date();
  const diff = d - now;
  const days = diff / (1000 * 60 * 60 * 24);
  if (days < 0) return 'Expired';
  if (days <= 90) return 'Within 3 Months';
  if (days <= 180) return 'Within 6 Months';
  if (days <= 365) return 'Within 1 Year';
  return '1+ Year';
}

function parseDate(str) {
  if (!str) return null;
  const d = new Date(str);
  return isNaN(d) ? null : d;
}

// ── Main Page ──────────────────────────────────────────────────────────────

const TABS = [
  { key: 'available', label: 'Available' },
  { key: 'in-use',    label: 'In Use' },
  { key: 'archived',  label: 'Archived' },
];

export default function InventoryPage({ onNavigate, user, onSwitchAccount, onLogout }) {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('available');
  const [missionFilter, setMissionFilter] = useState('');
  const [expirationFilter, setExpirationFilter] = useState('');
  const [panel, setPanel] = useState({ isOpen: false, baseItem: null });
  const [overview, setOverview] = useState({ isOpen: false, item: null });
  const [assignOpen, setAssignOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [missions, setMissions] = useState([]);

  useEffect(() => {
    fetchInventory();
    fetchMissionsList();
  }, []);

  const fetchInventory = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('shipments')
      .select(`
        *,
        inventory (
          description,
          company,
          reference_number
        ),
        missions (
          name
        )
      `);
    
    if (data) {
      const mapped = data.map(s => ({
        id: s.id,
        description: s.inventory?.description || 'Unknown',
        company: s.inventory?.company || 'Unknown',
        reference: s.inventory?.reference_number || '—',
        quantity: s.quantity,
        status: s.status,
        mission: s.missions?.name || '',
        location: s.location || '',
        expiration: s.expiration_date || '—'
      }));
      setRows(mapped);
    }
    setLoading(false);
  };

  const fetchMissionsList = async () => {
    const { data } = await supabase.from('missions').select('name');
    if (data) setMissions(data.map(m => m.name));
  };

  const openAdd = (baseItem = null) => setPanel({ isOpen: true, baseItem });
  const closePanel = () => setPanel({ ...panel, isOpen: false });
  const openOverview = (item) => setOverview({ isOpen: true, item });
  const closeOverview = () => setOverview((p) => ({ ...p, isOpen: false }));
  
  const handleItemAction = async (item, action) => {
    setSelectedItem(item);
    if (action === 'assign') {
      setAssignOpen(true);
    } else if (action === 'new-entry' || action === 'add-shipment') {
      openAdd(item);
    } else if (action === 'delete') {
      if (confirm(`Are you sure you want to delete ${item.description}?`)) {
        const { error } = await supabase.from('shipments').delete().eq('id', item.id);
        if (!error) fetchInventory();
      }
    } else if (action === 'archive') {
      const { error } = await supabase.from('shipments').update({ status: 'archived' }).eq('id', item.id);
      if (!error) fetchInventory();
    } else if (action === 'restore') {
      const { error } = await supabase.from('shipments').update({ status: 'available' }).eq('id', item.id);
      if (!error) fetchInventory();
    }
  };

  const handleOverviewEdit = () => {
    closeOverview();
    openAdd();
  };

  const handleSave = (form) => {
    setRows((prev) => [
      ...prev,
      {
        id: Date.now(),
        description: form.description || 'New Item',
        company: form.company || '',
        reference: form.reference || '',
        quantity: form.quantity || 0,
        status: 'available',
        mission: '',
        location: form.location || '',
        expiration: form.expiration || '—',
      },
    ]);
  };

  // Filter pipeline: tab → mission → expiration → search
  const filtered = rows.filter((r) => {
    // Tab filter
    if (r.status !== activeTab) return false;
    // Search filter
    if (search && !r.description.toLowerCase().includes(search.toLowerCase())) return false;
    // Mission filter
    if (missionFilter && r.mission !== missionFilter) return false;
    // Expiration filter
    if (expirationFilter && getExpirationCategory(r.expiration) !== expirationFilter) return false;
    return true;
  });

  const isInUse = activeTab === 'in-use';

  const tableRows = filtered.map((row) => {
    const baseCells = [
      { key: 'description', content: row.description },
      { key: 'company',     content: row.company },
      { key: 'reference',   content: row.reference },
      { key: 'quantity',    content: <QuantityBadge value={row.quantity} /> },
    ];

    if (isInUse) {
      baseCells.push({ key: 'mission', content: <MissionBadge mission={row.mission} /> });
    }

    baseCells.push(
      { key: 'location',   content: row.location },
      { key: 'expiration', content: row.expiration },
      {
        key: 'actions',
        content: (
          <span style={{ display: 'flex', gap: 4 }} onClick={(e) => e.stopPropagation()}>
            <IconButton
              icon={AddIcon}
              label="New Entry"
              appearance="subtle"
              spacing="compact"
              onClick={() => openAdd(row)}
            />
            <IconButton
              icon={EditIcon}
              label="Edit"
              appearance="subtle"
              spacing="compact"
              onClick={() => openOverview(row)}
            />
            <ActionMenu onItemAction={(action) => action === 'status' ? row : handleItemAction(row, action)} />
          </span>
        ),
      },
    );

    return {
      key: String(row.id),
      onClick: () => openOverview(row),
      cells: baseCells,
    };
  });

  // Count items per tab
  const availableCount = rows.filter(r => r.status === 'available').length;
  const inUseCount = rows.filter(r => r.status === 'in-use').length;
  const archivedCount = rows.filter(r => r.status === 'archived').length;

  return (
    <PageLayout>
      <TopNavigation isFixed id="top-navigation" skipLinkTitle="Top Navigation">
        <TopNav onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
      </TopNavigation>

      <Content>
        <LeftSidebar
          id="left-sidebar"
          skipLinkTitle="Project Navigation"
          width={mobileMenuOpen ? '100vw' : 240}
        >
          <div className={mobileMenuOpen ? "" : "sidebar-collapsed"} style={{ height: 'calc(100vh - 56px)' }}>
            <SideNav 
              active="inventory" 
              onNavigate={onNavigate} 
              user={user} 
              onSwitchAccount={onSwitchAccount} 
              onLogout={onLogout} 
              isMobile={mobileMenuOpen}
              onCloseMobile={() => setMobileMenuOpen(false)}
            />
          </div>
        </LeftSidebar>

        <Main id="main-content" skipLinkTitle="Main Content">
          <div className="main-content">

            {/* Page Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 24,
            }}>
              <h1 style={{
                margin: 0, fontSize: 24, fontWeight: 600,
                color: token('color.text', '#172B4D'),
              }}>
                Inventory
              </h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#331D58'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#422670'}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    height: 32, padding: '0 12px',
                    backgroundColor: '#422670', color: '#fff',
                    border: 'none', borderRadius: 3,
                    fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
                    cursor: 'pointer', transition: 'background-color 0.2s',
                  }}
                  onClick={openAdd}
                >
                  <AddIcon label="" size="small" /> Add Item
                </button>
                <IconButton
                  icon={ShowMoreHorizontalIcon}
                  label="More options"
                  appearance="default"
                />
              </div>
            </div>

            {/* Tab bar + right-side filters */}
            <div style={{
              display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between',
              borderBottom: `2px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`,
              marginBottom: 16,
            }}>
              {/* Tabs */}
              <div style={{ display: 'flex' }}>
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  const count = 
                    tab.key === 'available' ? availableCount : 
                    tab.key === 'in-use' ? inUseCount : 
                    archivedCount;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActiveTab(tab.key);
                        setMissionFilter('');
                        setExpirationFilter('');
                      }}
                      style={{
                        position: 'relative',
                        padding: '12px 12px',
                        marginBottom: -2,
                        border: 'none',
                        background: 'transparent',
                        cursor: 'pointer',
                        fontSize: 14,
                        fontWeight: isActive ? 600 : 400,
                        color: isActive ? '#422670' : token('color.text.subtle', '#44546F'),
                        fontFamily: 'inherit',
                      }}
                    >
                      {tab.label}
                      <span style={{
                        marginLeft: 6, padding: '1px 6px',
                        borderRadius: 10, fontSize: 11, fontWeight: 600,
                        backgroundColor: isActive ? '#F3F0FF' : '#F1F2F4',
                        color: isActive ? '#422670' : '#626F86',
                      }}>
                      {tab.key === 'available' ? availableCount : tab.key === 'in-use' ? inUseCount : archivedCount}
                      </span>
                      {isActive && (
                        <span style={{
                          position: 'absolute',
                          bottom: 0,
                          left: 4,
                          right: 4,
                          height: 3,
                          backgroundColor: '#422670',
                          borderRadius: '1px 1px 0 0',
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Filters */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, paddingBottom: 8 }}>
                {isInUse && (
                  <FilterDropdown
                    label="Mission"
                    options={missions}
                    selected={missionFilter}
                    onSelect={setMissionFilter}
                  />
                )}
                <FilterDropdown
                  label="Expiration"
                  hasIcon
                  options={EXPIRATION_OPTIONS}
                  selected={expirationFilter}
                  onSelect={setExpirationFilter}
                />
                <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                  <span style={{
                    position: 'absolute', left: 10, display: 'flex',
                    color: token('color.text.subtlest', '#626F86'), pointerEvents: 'none',
                  }}>
                    <SearchIcon label="" />
                  </span>
                  <input
                    type="text"
                    placeholder="Search"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                      height: 32, width: 220,
                      paddingLeft: 32, paddingRight: 10,
                      border: `1px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`,
                      borderRadius: 4, fontSize: 14,
                      color: token('color.text', '#172B4D'),
                      outline: 'none',
                      backgroundColor: token('elevation.surface', '#fff'),
                      fontFamily: 'inherit',
                    }}
                    aria-label="Search inventory"
                  />
                </div>
              </div>
            </div>

            {/* Table */}
            <DynamicTable
              head={activeTab === 'in-use' ? IN_USE_HEAD : activeTab === 'archived' ? ARCHIVED_HEAD : AVAILABLE_HEAD}
              rows={tableRows}
              rowsPerPage={15}
              defaultPage={1}
              isFixedSize
              defaultSortKey="description"
              defaultSortOrder="ASC"
              emptyView={
                <div style={{
                  padding: '48px 24px', textAlign: 'center',
                  color: token('color.text.subtle', '#44546F'),
                }}>
                  <p style={{ fontSize: 16, fontWeight: 500, margin: '0 0 8px' }}>
                    No items found
                  </p>
                  <p style={{ fontSize: 14, margin: 0, color: '#626F86' }}>
                    {search
                      ? `No results for "${search}". Try a different search.`
                      : isInUse
                      ? 'No items are currently assigned to missions.'
                      : 'Add items to get started.'}
                  </p>
                </div>
              }
            />
          </div>
        </Main>
      </Content>

      <ItemPanel
        isOpen={panel.isOpen}
        onClose={closePanel}
        onSave={handleSave}
        baseItem={panel.baseItem}
      />

      <OverviewPanel
        isOpen={overview.isOpen}
        onClose={closeOverview}
        item={overview.item}
        onEdit={handleOverviewEdit}
        onAssign={() => { setOverview(p => ({ ...p, isOpen: false })); setAssignOpen(true); setSelectedItem(overview.item); }}
        onNewEntry={() => { setOverview(p => ({ ...p, isOpen: false })); openAdd(overview.item); }}
      />

      <AssignToMissionPanel
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        item={selectedItem}
        onAssign={(mission, qty) => {
          alert(`Deploying ${qty} units of ${selectedItem.description} to ${mission.label}`);
          setAssignOpen(false);
        }}
      />
    </PageLayout>
  );
}
