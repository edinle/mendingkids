import { useState, useRef, useEffect } from 'react';
import {
  PageLayout,
  TopNavigation,
  LeftSidebarWithoutResize,
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
  { id: 1,  description: 'Pulse Oximeter User Guide',           company: 'Abbott',        reference: 'IS-170/AVF/RL/H-WB', quantity: 10,   status: 'available', mission: '',                      location: 'Cabinet 14 Shelf 3A',  expiration: '15 Nov 2027' },
  { id: 2,  description: 'Hypodermic Needle 22G x 1.5in',       company: 'Abbott',        reference: '305766',              quantity: 2433, status: 'available', mission: '',                      location: 'Cabinet 12 Shelf 1B',  expiration: '22 Dec 2025' },
  { id: 3,  description: 'Autoclave Sterilization Pouches',      company: 'Nipro',         reference: 'IS-170/AVF/RL/H-WB', quantity: 342,  status: 'available', mission: '',                      location: 'Storage Room A',       expiration: '30 Jan 2028' },
  { id: 4,  description: 'Sterile Surgical Drapes',              company: 'Abbott',        reference: 'IS-170/AVF/RL/H-WB', quantity: 342,  status: 'available', mission: '',                      location: 'Cabinet 14 Shelf 3A',  expiration: '05 May 2027' },
  { id: 5,  description: 'Disposable Face Masks (Box 50)',       company: 'Abbott',        reference: '305766',              quantity: 342,  status: 'available', mission: '',                      location: 'Storage Room B',       expiration: '18 Aug 2026' },
  { id: 6,  description: 'Surgical Sutures Kit 3-0',             company: 'Nipro',         reference: '305766',              quantity: 85,   status: 'available', mission: '',                      location: 'Cabinet 15 Shelf 2A',  expiration: '09 Sep 2029' },
  { id: 7,  description: 'ECG Electrodes (Pack 100)',            company: 'Nipro',         reference: '305766',              quantity: 120,  status: 'available', mission: '',                      location: 'Cabinet 11 Shelf 4B',  expiration: '14 Mar 2028' },
  { id: 8,  description: 'Oxygen Delivery Mask (Adult)',         company: 'Nipro',         reference: 'IS-170/AVF/RL/H-WB', quantity: 56,   status: 'available', mission: '',                      location: 'Cabinet 13 Shelf 1A',  expiration: '22 Jul 2027' },
  { id: 9,  description: 'Sterile Wound Dressings 4x4',         company: 'Nipro',         reference: 'IS-170/AVF/RL/H-WB', quantity: 200,  status: 'available', mission: '',                      location: 'Storage Room A',       expiration: '01 Dec 2027' },
  { id: 10, description: 'Disposable Syringes 5ml',              company: 'Nipro',         reference: '305766',              quantity: 1500, status: 'available', mission: '',                      location: 'Cabinet 12 Shelf 2A',  expiration: '15 Jun 2028' },
  { id: 11, description: 'Sterile Surgical Gowns (L)',           company: 'Nipro',         reference: '305766',              quantity: 75,   status: 'available', mission: '',                      location: 'Storage Room B',       expiration: '30 Apr 2027' },
  { id: 12, description: 'Surgical Instrument Set (Basic)',      company: 'Abbott',        reference: '305766',              quantity: 12,   status: 'available', mission: '',                      location: 'Cabinet 15 Shelf 3A',  expiration: '20 Feb 2029' },
  { id: 13, description: 'Blood Pressure Cuffs (Disp.)',        company: 'Abbott',        reference: '305766',              quantity: 45,   status: 'available', mission: '',                      location: 'Cabinet 11 Shelf 2B',  expiration: '11 Nov 2027' },
  { id: 14, description: 'Sterilizable Surgical Scissors',       company: 'Abbott',        reference: '305766',              quantity: 30,   status: 'available', mission: '',                      location: 'Cabinet 14 Shelf 1A',  expiration: '08 Aug 2028' },
  { id: 15, description: 'Disposable ECG Leads (12-Lead)',       company: 'Medline',       reference: 'MDL-ECG-12',          quantity: 65,   status: 'available', mission: '',                      location: 'Cabinet 13 Shelf 3B',  expiration: '25 Oct 2027' },
  // In-use items (assigned to missions)
  { id: 16, description: 'Infusion Set w/ Flow Regulator',       company: 'Nipro',         reference: 'IS-170/AVF/RL/H-WB', quantity: 100,  status: 'in-use',    mission: 'Uganda Cardiac 2026',   location: 'Mission Kit #1',       expiration: '08 Aug 2027' },
  { id: 17, description: 'Sterile Gloves (Size 7.5)',            company: 'Medline',       reference: 'MDL-SG-75',           quantity: 500,  status: 'in-use',    mission: 'Uganda Cardiac 2026',   location: 'Mission Kit #1',       expiration: '12 Jan 2027' },
  { id: 18, description: 'Lidocaine 1% 20ml Vials',             company: 'Pfizer',        reference: 'PF-LID-120',          quantity: 50,   status: 'in-use',    mission: 'Guatemala Dental 2026', location: 'Mission Kit #3',       expiration: '30 Sep 2026' },
  { id: 19, description: 'Absorbable Sutures 4-0 (Vicryl)',     company: 'Ethicon',       reference: 'J392H',               quantity: 200,  status: 'in-use',    mission: 'Uganda Cardiac 2026',   location: 'Mission Kit #1',       expiration: '15 Apr 2028' },
  { id: 20, description: 'Portable Pulse Oximeter',              company: 'Masimo',        reference: 'RAD-5V',              quantity: 8,    status: 'in-use',    mission: 'Peru Cleft Lip 2026',   location: 'Mission Kit #2',       expiration: '01 Mar 2029' },
  { id: 21, description: 'Surgical Blade #15 (Box 100)',         company: 'Swann-Morton',  reference: 'SM-0105',             quantity: 300,  status: 'in-use',    mission: 'Guatemala Dental 2026', location: 'Mission Kit #3',       expiration: '20 Nov 2027' },
  { id: 22, description: 'IV Cannula 20G',                       company: 'BD',            reference: 'BD-3901',             quantity: 150,  status: 'in-use',    mission: 'Peru Cleft Lip 2026',   location: 'Mission Kit #2',       expiration: '05 Jun 2027' },
  { id: 23, description: 'Sterile Gauze Pads 4x4',              company: 'Johnson & Johnson', reference: 'JJ-GP44',         quantity: 1000, status: 'in-use',    mission: 'Uganda Cardiac 2026',   location: 'Mission Kit #1',       expiration: '28 Feb 2028' },
  { id: 24, description: 'Endotracheal Tubes Size 7.0',          company: 'Medline',       reference: 'MDL-ETT-70',          quantity: 25,   status: 'in-use',    mission: 'Peru Cleft Lip 2026',   location: 'Mission Kit #2',       expiration: '17 Jul 2027' },
  { id: 25, description: 'Hemostatic Forceps (Curved)',           company: 'Aesculap',      reference: 'BH110R',              quantity: 15,   status: 'in-use',    mission: 'Guatemala Dental 2026', location: 'Mission Kit #3',       expiration: '10 Dec 2029' },
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
    'Uganda Cardiac 2026':   { bg: '#E9F2FF', color: '#0055CC', border: '#B3D4FF' },
    'Guatemala Dental 2026': { bg: '#FFF3EB', color: '#974F0C', border: '#FAE1C7' },
    'Peru Cleft Lip 2026':   { bg: '#F3F0FF', color: '#5E4DB2', border: '#DFD8FD' },
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

export default function InventoryPage({ onNavigate }) {
  const [search, setSearch] = useState('');
  const [rows, setRows] = useState(INITIAL_ROWS);
  const [activeTab, setActiveTab] = useState('available');
  const [missionFilter, setMissionFilter] = useState('');
  const [expirationFilter, setExpirationFilter] = useState('');
  const [panel, setPanel] = useState({ isOpen: false });
  const [overview, setOverview] = useState({ isOpen: false, item: null });

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
        <TopNav />
      </TopNavigation>

      <Content>
        <LeftSidebarWithoutResize
          id="left-sidebar"
          skipLinkTitle="Project Navigation"
          width={240}
        >
          <SideNav active="inventory" onNavigate={onNavigate} />
        </LeftSidebarWithoutResize>

        <Main id="main-content" skipLinkTitle="Main Content">
          <div style={{ padding: '24px 24px 32px' }}>

            {/* Page Header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              marginBottom: 16,
            }}>
              <h1 style={{
                margin: 0, fontSize: 24, fontWeight: 600, lineHeight: '28px',
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
