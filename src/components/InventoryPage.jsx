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
import Button from '@atlaskit/button';
import { IconButton } from '@atlaskit/button/new';
import Modal, { ModalTransition, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@atlaskit/modal-dialog';
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
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { Section, ButtonItem } from '@atlaskit/menu';
import Popup from '@atlaskit/popup';
import FilterDropdown from './FilterDropdown';

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
    'Benin Cleft Lip & Palate': { bg: '#DEEBFF', color: '#0747A6', border: '#B3D4FF' },
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

function ActionMenu({ item, onItemAction }) {
  const [isOpen, setIsOpen] = useState(false);
  const status = item?.status;

  return (
    <Popup
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      placement="bottom-end"
      content={() => (
        <div style={{ minWidth: 160 }}>
          <Section>
            {status === 'archived' ? (
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
        background: isSelected ? '#DEEBFF' : hover ? '#FAFBFC' : 'transparent',
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

// ── Button Tooltip ─────────────────────────────────────────────────────────

function BtnTooltip({ label, children, position = 'top' }) {
  const [show, setShow] = useState(false);
  const isTop = position !== 'bottom';
  return (
    <div
      style={{ position: 'relative', display: 'inline-flex' }}
      onMouseEnter={() => setShow(true)}
      onMouseLeave={() => setShow(false)}
    >
      {children}
      {show && label && (
        <div style={{
          position: 'absolute',
          ...(isTop ? { bottom: 'calc(100% + 7px)' } : { top: 'calc(100% + 7px)' }),
          left: '50%', transform: 'translateX(-50%)',
          zIndex: 1200, whiteSpace: 'nowrap',
          backgroundColor: '#172B4D', color: '#fff',
          borderRadius: 4, padding: '5px 10px',
          fontSize: 12, lineHeight: 1.4,
          boxShadow: '0 2px 8px rgba(9,30,66,0.22)',
          pointerEvents: 'none',
        }}>
          {label}
          <div style={{
            position: 'absolute',
            ...(isTop ? { top: '100%', borderColor: '#172B4D transparent transparent' } : { bottom: '100%', borderColor: 'transparent transparent #172B4D' }),
            left: '50%', transform: 'translateX(-50%)',
            borderWidth: '4px 4px 0', borderStyle: 'solid',
          }} />
        </div>
      )}
    </div>
  );
}

// ── Expiration categories ──────────────────────────────────────────────────
const EXPIRATION_OPTIONS = ['Expired', '0-3 Months', '3-6 Months', '6-12 Months', '1+ year'];

function getExpirationCategory(dateStr) {
  const d = parseDate(dateStr);
  if (!d) return '1+ year';
  const now = new Date();
  const diff = d - now;
  const days = diff / (1000 * 60 * 60 * 24);
  if (days < 0) return 'Expired';
  if (days <= 90) return '0-3 Months';
  if (days <= 180) return '3-6 Months';
  if (days <= 365) return '6-12 Months';
  return '1+ year';
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

export default function InventoryPage({ user, onSwitchAccount, onLogout }) {
  const [inventory, setInventory] = useState([]);
  const [archived, setArchived] = useState([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  
  // Filters state
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [mission, setMission] = useState('');
  const [location, setLocation] = useState('');
  const [expiration, setExpiration] = useState('');

  const [activeTab, setActiveTab] = useState('available');
  const [missionFilter, setMissionFilter] = useState('');
  const [expirationFilter, setExpirationFilter] = useState('');
  const [panel, setPanel] = useState({ isOpen: false, baseItem: null, isEdit: false });
  const [overview, setOverview] = useState({ isOpen: false, item: null });
  const [assignOpen, setAssignOpen] = useState(false);
  const [deploySuccess, setDeploySuccess] = useState({ isOpen: false, msg: '' });
  const [selectedItem, setSelectedItem] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, item: null, action: null });
  const [missions, setMissions]             = useState([]);
  const [missionsList, setMissionsList]     = useState([]);   // {id, name}
  const [selectedIds, setSelectedIds]       = useState(new Set());
  const [companyFilter, setCompanyFilter]   = useState('');
  const [bulkConfirm, setBulkConfirm]       = useState({ isOpen: false });
  const [bulkAssignOpen, setBulkAssignOpen] = useState(false);

  useEffect(() => {
    fetchInventory();
    fetchMissionsList();
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('name');
    if (data) setCategories(data.map(c => ({ label: c.name, value: c.name })));
  };

  const fetchInventory = async () => {
    setLoading(true);
    const selectWithExtendedColumns = `
      *,
      inventory (
        id,
        description,
        company,
        reference_number,
        unit_of_measure,
        shelf_life,
        notes,
        category,
        created_at,
        updated_at
      ),
      missions (
        name
      )
    `;
    const selectFallback = `
      *,
      inventory (
        id,
        description,
        company,
        reference_number,
        unit_of_measure,
        category,
        created_at,
        updated_at
      ),
      missions (
        name
      )
    `;

    let result = await supabase
      .from('shipments')
      .select(selectWithExtendedColumns);

    if (result.error && /does not exist/i.test(result.error.message || '')) {
      console.warn('[Inventory] Missing optional columns in inventory table. Retrying with fallback select.');
      result = await supabase
        .from('shipments')
        .select(selectFallback);
    }
    
    if (result.error) {
      console.error('[Inventory] Failed to fetch inventory:', result.error);
      setLoading(false);
      return [];
    }

    if (result.data) {
      const mapped = result.data.map(s => ({
        id: s.id,
        inventory_id: s.inventory_id,
        description: s.inventory?.description || 'Unknown',
        company: s.inventory?.company || 'Unknown',
        reference: s.inventory?.reference_number || '—',
        category: s.inventory?.category || 'Uncategorized',
        unit_of_measure: s.inventory?.unit_of_measure || 'units',
        shelf_life: s.inventory?.shelf_life || 'Does Not Expire',
        notes: s.inventory?.notes || '',
        quantity: s.quantity,
        status: s.status,
        mission: s.missions?.name || '',
        location: s.location || '',
        expiration: s.expiration_date || '—',
        lot_number: s.lot_number || 'N/A',
        market_value: s.market_value,
        valuation_source: s.valuation_source,
        acquisition_method: s.acquisition_method,
        created_at: s.inventory?.created_at || s.created_at,
        updated_at: s.updated_at || s.inventory?.updated_at || s.created_at,
      }));
      setInventory(mapped);
      setLoading(false);
      return mapped;
    }
    setLoading(false);
    return [];
  };

  const fetchMissionsList = async () => {
    const { data } = await supabase.from('missions').select('id, name').neq('status', 'ARCHIVED');
    if (data) {
      setMissions(data.map(m => m.name));
      setMissionsList(data);
    }
  };

  const openAdd = (baseItem = null, isEdit = false) => setPanel({ isOpen: true, baseItem, isEdit });
  const closePanel = () => setPanel({ ...panel, isOpen: false });
  const openOverview = (item) => setOverview({ isOpen: true, item });
  const closeOverview = () => setOverview((p) => ({ ...p, isOpen: false }));
  
  const handleItemAction = (item, action) => {
    setSelectedItem(item);
    if (action === 'assign') {
      setAssignOpen(true);
    } else if (action === 'new-entry' || action === 'add-shipment') {
      openAdd(item, false);
    } else if (action === 'delete') {
      setConfirmModal({ isOpen: true, item, action: 'delete' });
    } else if (action === 'archive') {
      setConfirmModal({ isOpen: true, item, action: 'archive' });
    } else if (action === 'restore') {
      setConfirmModal({ isOpen: true, item, action: 'restore' });
    }
  };

  const handleExecuteModalAction = async () => {
    const { item, action } = confirmModal;
    if (!item) return;

    try {
      if (action === 'delete') {
        await supabase.from('shipments').delete().eq('id', item.id);
      } else if (action === 'archive') {
        await supabase.from('shipments').update({ status: 'archived' }).eq('id', item.id);
      } else if (action === 'restore') {
        await supabase.from('shipments').update({ status: 'available' }).eq('id', item.id);
      }
      fetchInventory();
    } catch (err) {
      console.error(`Action ${action} failed:`, err);
    } finally {
      setConfirmModal({ isOpen: false, item: null, action: null });
    }
  };

  const handleOverviewEdit = () => {
    const item = overview.item;
    closeOverview();
    openAdd(item, true);
  };

  // ── Bulk select helpers ───────────────────────────────────────────────────

  const toggleSelectRow = (id, e) => {
    e.stopPropagation();
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkAction = async (action) => {
    const ids = [...selectedIds];
    if (!ids.length) return;
    if (action === 'delete') { setBulkConfirm({ isOpen: true }); return; }
    if (action === 'assign') { setBulkAssignOpen(true); return; }
    if (action === 'archive') {
      await supabase.from('shipments').update({ status: 'archived' }).in('id', ids);
    } else if (action === 'restore') {
      await supabase.from('shipments').update({ status: 'available' }).in('id', ids);
    }
    setSelectedIds(new Set());
    fetchInventory();
  };

  const handleBulkDelete = async () => {
    await supabase.from('shipments').delete().in('id', [...selectedIds]);
    setSelectedIds(new Set());
    setBulkConfirm({ isOpen: false });
    fetchInventory();
  };

  const handleBulkAssign = async (missionId) => {
    await supabase.from('shipments')
      .update({ mission_id: missionId, status: 'in-use' })
      .in('id', [...selectedIds]);
    setSelectedIds(new Set());
    setBulkAssignOpen(false);
    fetchInventory();
  };

  const handleSave = async () => {
    const latest = await fetchInventory();
    if (overview.isOpen && overview.item && latest.length > 0) {
      const refreshed = latest.find((x) => x.id === overview.item.id);
      if (refreshed) {
        setOverview((prev) => ({ ...prev, item: refreshed }));
      }
    }
  };

  // ── Derived values for filters ────────────────────────────────────────────
  const allCompanies = [...new Set(inventory.map(r => r.company).filter(c => c && c !== 'Unknown'))].sort();

  // Filter pipeline: tab → search → category → company → mission → expiration
  const filtered = inventory.filter((r) => {
    if (r.status !== activeTab) return false;
    if (search && !r.description.toLowerCase().includes(search.toLowerCase()) &&
        !r.company.toLowerCase().includes(search.toLowerCase())) return false;
    if (category && r.category !== category) return false;
    if (companyFilter && r.company !== companyFilter) return false;
    if (missionFilter && r.mission !== missionFilter) return false;
    if (expirationFilter && getExpirationCategory(r.expiration) !== expirationFilter) return false;
    return true;
  });

  const isInUse = activeTab === 'in-use';

  // ── Checkbox-augmented heads ──────────────────────────────────────────────
  const filteredIds = filtered.map(r => r.id);
  const isAllSelected = filteredIds.length > 0 && filteredIds.every(id => selectedIds.has(id));
  const isPartial = selectedIds.size > 0 && !isAllSelected;

  const checkboxHeadCell = {
    key: 'select',
    content: (
      <input
        type="checkbox"
        checked={isAllSelected}
        ref={el => { if (el) el.indeterminate = isPartial; }}
        onChange={() => setSelectedIds(isAllSelected ? new Set() : new Set(filteredIds))}
        onClick={e => e.stopPropagation()}
        style={{ cursor: 'pointer', accentColor: '#0747A6', width: 15, height: 15 }}
      />
    ),
    width: 3,
  };

  const baseHead = activeTab === 'available' ? AVAILABLE_HEAD : activeTab === 'in-use' ? IN_USE_HEAD : ARCHIVED_HEAD;
  const activeHead = { cells: [checkboxHeadCell, ...baseHead.cells] };

  const tableRows = filtered.map((row) => {
    const checkboxCell = {
      key: 'select',
      content: (
        <input
          type="checkbox"
          checked={selectedIds.has(row.id)}
          onChange={e => toggleSelectRow(row.id, e)}
          onClick={e => e.stopPropagation()}
          style={{ cursor: 'pointer', accentColor: '#0747A6', width: 15, height: 15 }}
        />
      ),
    };

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
            <BtnTooltip label="Add a new shipment entry for this item">
              <IconButton icon={AddIcon} label="New Entry" appearance="subtle" spacing="compact" onClick={() => openAdd(row, false)} />
            </BtnTooltip>
            <BtnTooltip label="View and edit item details">
              <IconButton icon={EditIcon} label="Edit" appearance="subtle" spacing="compact" onClick={() => openOverview(row)} />
            </BtnTooltip>
              <BtnTooltip label="Archive, assign, delete and more">
                <span><ActionMenu item={row} onItemAction={(action) => handleItemAction(row, action)} /></span>
              </BtnTooltip>
          </span>
        ),
      },
    );

    return {
      key: String(row.id),
      onClick: () => openOverview(row),
      style: selectedIds.has(row.id) ? { backgroundColor: '#F8F6FF' } : undefined,
      cells: [checkboxCell, ...baseCells],
    };
  });

  // Count items per tab
  const availableCount = inventory.filter(r => r.status === 'available').length;
  const inUseCount = inventory.filter(r => r.status === 'in-use').length;
  const archivedCount = inventory.filter(r => r.status === 'archived').length;

  return (
    <PageLayout>
      <TopNavigation isFixed id="top-navigation" skipLinkTitle="Top Navigation">
        <TopNav user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
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
                <BtnTooltip label="Add a new inventory item or shipment">
                  <button
                    onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#043584'}
                    onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0747A6'}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 6,
                      height: 32, padding: '0 12px',
                      backgroundColor: '#0747A6', color: '#fff',
                      border: 'none', borderRadius: 3,
                      fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
                      cursor: 'pointer', transition: 'background-color 0.2s',
                    }}
                    onClick={() => openAdd(null, false)}
                  >
                    <AddIcon label="" size="small" /> Add Item
                  </button>
                </BtnTooltip>
                <BtnTooltip label="Export, print, or import inventory in bulk">
                  <IconButton
                    icon={ShowMoreHorizontalIcon}
                    label="More options"
                    appearance="default"
                  />
                </BtnTooltip>
              </div>
            </div>

            {/* Tab bar + right-side filters */}
            {/* Tabs Row */}
            <div style={{
              display: 'flex', alignItems: 'flex-end',
              borderBottom: `2px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`,
              marginBottom: 16,
            }}>
              <div style={{ display: 'flex' }}>
                {TABS.map((tab) => {
                  const isActive = activeTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      onClick={() => {
                        setActiveTab(tab.key);
                        setMissionFilter('');
                        setExpirationFilter('');
                        setCompanyFilter('');
                        setSelectedIds(new Set());
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
                        color: isActive ? '#0747A6' : token('color.text.subtle', '#44546F'),
                        fontFamily: 'inherit',
                      }}
                    >
                      {tab.label}
                      <span style={{
                        marginLeft: 6, padding: '1px 6px',
                        borderRadius: 10, fontSize: 11, fontWeight: 600,
                        backgroundColor: isActive ? '#DEEBFF' : '#F1F2F4',
                        color: isActive ? '#0747A6' : '#626F86',
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
                          backgroundColor: '#0747A6',
                          borderRadius: '1px 1px 0 0',
                        }} />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Filters & Search Row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FilterDropdown label="Category"   options={categories}       selected={category}       onSelect={setCategory} />
                <FilterDropdown label="Company"    options={allCompanies}     selected={companyFilter}  onSelect={setCompanyFilter} />
                {isInUse && (
                  <FilterDropdown label="Mission"  options={missions}         selected={missionFilter}  onSelect={setMissionFilter} />
                )}
                <FilterDropdown label="Expiration" hasIcon options={EXPIRATION_OPTIONS} selected={expirationFilter} onSelect={setExpirationFilter} />
              </div>

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

            {/* Bulk action bar */}
            {selectedIds.size > 0 && (
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap',
                padding: '10px 16px', marginBottom: 12,
                backgroundColor: '#DEEBFF', border: '1px solid #8ABAFF', borderRadius: 6,
              }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: '#0747A6' }}>
                  {selectedIds.size} item{selectedIds.size > 1 ? 's' : ''} selected
                </span>
                <div style={{ width: 1, height: 16, backgroundColor: '#8ABAFF' }} />
                {activeTab !== 'archived' && <>
                  <button onClick={() => handleBulkAction('archive')} style={{ padding: '4px 12px', border: '1px solid #8ABAFF', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', color: '#172B4D' }}>Archive</button>
                  <button onClick={() => handleBulkAction('assign')} style={{ padding: '4px 12px', border: '1px solid #8ABAFF', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', color: '#172B4D' }}>Assign to Mission</button>
                </>}
                {activeTab === 'archived' &&
                  <button onClick={() => handleBulkAction('restore')} style={{ padding: '4px 12px', border: '1px solid #8ABAFF', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', color: '#172B4D' }}>Restore</button>
                }
                <button onClick={() => handleBulkAction('delete')} style={{ padding: '4px 12px', border: '1px solid #F87168', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', color: '#AE2E24' }}>Delete</button>
                <div style={{ flex: 1 }} />
                <button onClick={() => setSelectedIds(new Set())} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 13, color: '#626F86', fontFamily: 'inherit' }}>✕ Deselect all</button>
              </div>
            )}

            <DynamicTable
              head={activeHead}
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
        isEdit={panel.isEdit}
        baseItem={panel.baseItem}
        user={user}
      />

      <OverviewPanel
        isOpen={overview.isOpen}
        onClose={closeOverview}
        item={overview.item}
        onSave={handleSave}
        onEdit={handleOverviewEdit}
        onAssign={() => { setOverview(p => ({ ...p, isOpen: false })); setAssignOpen(true); setSelectedItem(overview.item); }}
        onNewEntry={() => { setOverview(p => ({ ...p, isOpen: false })); openAdd(overview.item); }}
      />

      <AssignToMissionPanel
        isOpen={assignOpen}
        onClose={() => setAssignOpen(false)}
        item={selectedItem}
        onAssign={async (mission, qty) => {
          setDeploySuccess({ isOpen: true, msg: `Successfully deployed ${qty} units of ${selectedItem.description} to ${mission.label}` });
          setAssignOpen(false);
          
          // Log Activity
          await supabase.from('activity_log').insert({
            profile_id: user?.id,
            action_text: `Assigned ${qty}x ${selectedItem.description} to ${mission.label}`,
            category: 'Inventory'
          });
          
          fetchInventory(); // Refresh to show updated location and status
        }}
      />

      <DeleteConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={() => setConfirmModal({ isOpen: false, item: null, action: null })}
        onConfirm={handleExecuteModalAction}
        title={
          confirmModal.action === 'archive' ? 'Archive Item' :
          confirmModal.action === 'restore' ? 'Restore Item' :
          'Delete Item'
        }
        message={
          confirmModal.action === 'archive' ? 'Are you sure you want to archive' :
          confirmModal.action === 'restore' ? 'Are you sure you want to restore' :
          'Are you sure you want to delete'
        }
        itemName={confirmModal.item?.description}
        appearance={confirmModal.action === 'restore' ? 'primary' : 'danger'}
        confirmLabel={
          confirmModal.action === 'archive' ? 'Archive' :
          confirmModal.action === 'restore' ? 'Restore' :
          'Delete'
        }
      />
      {/* Bulk delete confirmation */}
      <ModalTransition>
        {bulkConfirm.isOpen && (
          <Modal onClose={() => setBulkConfirm({ isOpen: false })}>
            <ModalHeader>
              <ModalTitle appearance="danger">Delete {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''}?</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p>This will permanently remove <strong>{selectedIds.size}</strong> selected item{selectedIds.size !== 1 ? 's' : ''} from inventory. This action cannot be undone.</p>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setBulkConfirm({ isOpen: false })}>Cancel</Button>
              <Button appearance="danger" onClick={handleBulkDelete}>Delete All</Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>

      {/* Bulk assign to mission */}
      <ModalTransition>
        {bulkAssignOpen && (
          <Modal onClose={() => setBulkAssignOpen(false)}>
            <ModalHeader>
              <ModalTitle>Assign {selectedIds.size} item{selectedIds.size !== 1 ? 's' : ''} to Mission</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p style={{ marginBottom: 16, color: '#626F86', fontSize: 14 }}>
                Select a mission. All selected items will be marked <strong>In Use</strong> and linked to that mission.
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {missionsList.length === 0 && <p style={{ color: '#8590A2', fontSize: 13 }}>No active missions found.</p>}
                {missionsList.map(m => (
                  <button
                    key={m.id}
                    onClick={() => handleBulkAssign(m.id)}
                    onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F4F5F7'}
                    onMouseLeave={e => e.currentTarget.style.backgroundColor = '#fff'}
                    style={{ padding: '10px 16px', border: '1px solid #DFE1E6', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', textAlign: 'left', color: '#172B4D', transition: 'background 0.1s' }}
                  >
                    {m.name}
                  </button>
                ))}
              </div>
            </ModalBody>
            <ModalFooter>
              <Button onClick={() => setBulkAssignOpen(false)}>Cancel</Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>

      <ModalTransition>
        {deploySuccess.isOpen && (
          <Modal onClose={() => setDeploySuccess({ ...deploySuccess, isOpen: false })}>
            <ModalHeader>
              <ModalTitle>Deployment Initiated</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p>{deploySuccess.msg}</p>
            </ModalBody>
            <ModalFooter>
              <Button appearance="primary" onClick={() => setDeploySuccess({ ...deploySuccess, isOpen: false })}>
                Done
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
    </PageLayout>
  );
}
