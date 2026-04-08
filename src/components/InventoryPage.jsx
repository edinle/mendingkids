import { useState, useRef, useEffect } from 'react';
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

// ── Sample Data ────────────────────────────────────────────────────────────
// Each item now has: status ('available' or 'in-use'), mission, and realistic locations

const INITIAL_ROWS = [
  { id: 1,  description: 'Adult Anesthesia Circuit 60in',        company: 'Teleflex',      reference: 'RC-1065',             quantity: 45,   status: 'available', mission: '',                      location: 'Cabinet 14 Shelf 2B',  expiration: '10 Nov 2028' },
  { id: 2,  description: 'Prolene 4-0 Blue Monofilament',        company: 'Ethicon',       reference: '8681H',               quantity: 240,  status: 'available', mission: '',                      location: 'Cabinet 12 Shelf 1A',  expiration: '22 Dec 2025' },
  { id: 3,  description: 'Pigtail Infusion Set 20 drops/ml',      company: 'Nipro',         reference: 'IS-20-60',            quantity: 500,  status: 'available', mission: '',                      location: 'Warehouse Box 4',      expiration: '15 Jan 2027' },
  { id: 4,  description: 'ChloraPrep Open 3ml Applicator',       company: 'BD',            reference: '260400',              quantity: 120,  status: 'available', mission: '',                      location: 'Sterile Supply A',      expiration: '05 May 2026' },
  { id: 5,  description: 'Surgical Cautery Tip (Stnd)',          company: 'Medtronic',     reference: 'E1450',               quantity: 85,   status: 'available', mission: '',                      location: 'Cabinet 15 Shelf 3C',  expiration: '18 Aug 2029' },
  { id: 16, description: 'ECG Monitoring Lead Set (3-Lead)',     company: '3M',            reference: '2268-3',              quantity: 100,  status: 'in-use',    mission: 'Benin Cleft Lip & Palate', location: 'Benin Kit #1',       expiration: '08 Aug 2027' },
  { id: 17, description: 'Micro-Aire Drill Saw Blade',           company: 'Stryker',       reference: 'SR-2102',             quantity: 15,   status: 'in-use',    mission: 'Guatemala Orthopedic 2026', location: 'Mission Crate B',    expiration: '12 Jan 2028' },
  { id: 18, description: 'Pediatric Endotracheal Tube 4.0',      company: 'Covidien',      reference: '85743',               quantity: 30,   status: 'in-use',    mission: 'Tanzania Cardiac Relief', location: 'Cardiac Case #4',    expiration: '30 Sep 2026' },
];

// Mission list extracted from data
const MISSIONS = [...new Set(INITIAL_ROWS.filter(r => r.mission).map(r => r.mission))];

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
];

export default function InventoryPage({ onNavigate, user, onSwitchAccount, onLogout }) {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [activeTab, setActiveTab] = useState('available');
  const [missionFilter, setMissionFilter] = useState('');
  const [expirationFilter, setExpirationFilter] = useState('');
  const [panel, setPanel] = useState({ isOpen: false });
  const [overview, setOverview] = useState({ isOpen: false, item: null });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const openAdd = () => setPanel({ isOpen: true });
  const closePanel = () => setPanel({ isOpen: false });
  const openOverview = (item) => setOverview({ isOpen: true, item });
  const closeOverview = () => setOverview((p) => ({ ...p, isOpen: false }));
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
              label="Add"
              appearance="subtle"
              spacing="compact"
              onClick={() => openAdd()}
            />
            <IconButton
              icon={EditIcon}
              label="Edit"
              appearance="subtle"
              spacing="compact"
              onClick={() => openOverview(row)}
            />
            <IconButton
              icon={ShowMoreHorizontalIcon}
              label="More"
              appearance="subtle"
              spacing="compact"
            />
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
                  const count = tab.key === 'available' ? availableCount : inUseCount;
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
                        {count}
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
                    options={MISSIONS}
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
              head={isInUse ? IN_USE_HEAD : AVAILABLE_HEAD}
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
      />

      <OverviewPanel
        isOpen={overview.isOpen}
        onClose={closeOverview}
        item={overview.item}
        onEdit={handleOverviewEdit}
      />
    </PageLayout>
  );
}
