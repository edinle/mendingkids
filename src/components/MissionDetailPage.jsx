import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { token } from '@atlaskit/tokens';
import { PageLayout, Content, Main, LeftSidebar, TopNavigation } from '@atlaskit/page-layout';
import TopNav from './TopNav';
import SideNav from './SideNav';
import SlidePanel from './SlidePanel';
import CreateMissionPanel from './CreateMissionPanel';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import FilterDropdown from './FilterDropdown';

// ─── Primitives ───────────────────────────────────────────────────────────────

const CATEGORY_CHIPS = ['Syringes', 'Patches', 'Chest Tubes', 'Bandages'];
const CHIP_COLORS = { Syringes: '#E9F2FF', Patches: '#FFF3EB', 'Chest Tubes': '#E3FCEF', Bandages: '#F3F0FF' };
const CHIP_TEXT   = { Syringes: '#0055CC', Patches: '#974F0C', 'Chest Tubes': '#006644', Bandages: '#5E4DB2' };

// ─── Quantity Badge ───────────────────────────────────────────────────────────

function QtyBadge({ qty, flag }) {
  if (!qty && qty !== 0) return <span style={{ color: '#8590A2', fontSize: 13 }}>—</span>;
  const bg = flag === 'danger' ? '#FFEBE6' : flag === 'info' ? '#E9F2FF' : qty >= 1000 ? '#FFBE33' : qty >= 100 ? '#F8E6A0' : '#F1F2F4';
  const fg = flag === 'danger' ? '#c62828' : flag === 'info' ? '#1561cc' : '#172B4D';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 32, padding: '1px 7px', backgroundColor: bg,
      borderRadius: 10, fontSize: 12, fontWeight: 600, color: fg,
    }}>
      {qty}
    </span>
  );
}

// ─── Add Items Panel (right side) ────────────────────────────────────────────

// ─── Add Items Panel (right side) ────────────────────────────────────────────

function AddItemsPanel({ category = 'ENT', onClose, onNavigate }) {
  const [search,   setSearch]   = useState('');
  const [selected, setSelected] = useState({});
  const [activeChip, setChip]   = useState(null);
  const [page, setPage]         = useState(1);

  const toggle = id => setSelected(s => ({ ...s, [id]: !s[id] }));

  const filtered = ADD_ITEMS_RECOMMENDED.filter(i =>
    !search || i.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{
      width: '100%', flex: 1,
      display: 'flex', flexDirection: 'column',
      height: '100%', backgroundColor: '#fff',
    }}>
      {/* Panel header */}
      <div style={{ padding: '12px 20px 12px 48px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', height: 53, boxSizing: 'border-box', backgroundColor: '#fff' }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: token('color.text', '#172B4D') }}>Add Items</h3>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px' }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 20 }}>
          <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#626F86', display: 'flex', pointerEvents: 'none' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
          <input
            type="text" placeholder="Search"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', height: 36, paddingLeft: 32, paddingRight: 10, border: `1px solid ${token('color.border', '#DFE1E6')}`, borderRadius: 3, fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', backgroundColor: token('elevation.surface.sunken', '#F4F5F7') }}
          />
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 24 }}>
          {CATEGORY_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => setChip(c => c === chip ? null : chip)}
              style={{
                padding: '4px 12px', borderRadius: 12, border: 'none', cursor: 'pointer',
                backgroundColor: activeChip === chip ? CHIP_TEXT[chip] : (CHIP_COLORS[chip] || '#e8e8e8'),
                color: activeChip === chip ? '#fff' : (CHIP_TEXT[chip] || '#172B4D'),
                fontSize: 12, fontWeight: 600, fontFamily: 'inherit',
                transition: 'all 0.2s',
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Recommended section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h4 style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#172B4D' }}>Recommended for {category}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            {/* Pagination buttons logic ... */}
          </div>
        </div>

        {/* Compact table */}
        <div style={{ border: `1px solid ${token('color.border', '#DFE1E6')}`, borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '32px 1fr 100px', padding: '8px 12px', backgroundColor: '#FAFBFC', borderBottom: `1px solid ${token('color.border', '#DFE1E6')}`, gap: 8 }}>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#626F86', textTransform: 'uppercase' }}></span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#626F86', textTransform: 'uppercase' }}>Item Description</span>
            <span style={{ fontSize: 11, fontWeight: 700, color: '#626F86', textTransform: 'uppercase' }}>Company</span>
          </div>
          {inventory.filter(i => !search || i.description.toLowerCase().includes(search.toLowerCase())).map(item => (
            <div key={item.id} style={{
              display: 'grid', gridTemplateColumns: '32px 1fr 100px',
              padding: '10px 12px', gap: 8, alignItems: 'center',
              borderBottom: '1px solid #f4f4f4',
              backgroundColor: selected[item.id] ? '#F8F6FF' : '#fff',
            }}>
              <input type="checkbox" checked={!!selected[item.id]} onChange={() => toggle(item.id)} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#422670' }} />
              <span style={{ fontSize: 13, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</span>
              <span style={{ fontSize: 12, color: '#626F86' }}>{item.company}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 24px', borderTop: `1px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`, display: 'flex', justifyContent: 'flex-end', gap: 12, backgroundColor: '#fff' }}>
        <button onClick={onClose} style={{ height: 36, padding: '0 16px', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>Cancel</button>
        <button
          onClick={async () => {
            const updates = Object.keys(selected).filter(k => selected[k]).map(itemId => ({
              mission_id: missionId,
              inventory_id: itemId,
              quantity: 1,
              status: 'assigned',
              location: 'Transit'
            }));
            const { error } = await supabase.from('shipments').insert(updates);
            if (!error) {
               onSuccess();
               onClose();
            } else {
               alert(error.message);
            }
          }}
          disabled={Object.values(selected).filter(Boolean).length === 0}
          style={{ height: 36, padding: '0 16px', border: 'none', borderRadius: 4, background: '#422670', color: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', fontWeight: 600 }}
        >
          Add Selected
        </button>
      </div>
    </div>
  );
}

function AddPersonPanel({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div style={{ width: '100%', display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff' }}>
      <div style={{ padding: '12px 20px 12px 48px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', height: 53, boxSizing: 'border-box' }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: token('color.text', '#172B4D') }}>Add Person</h3>
      </div>
      <div style={{ flex: 1, padding: '24px', overflowY: 'auto' }}>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44546F', marginBottom: 4 }}>Full Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', height: 36, border: `1px solid ${token('color.border', '#DFE1E6')}`, borderRadius: 3, padding: '0 10px', fontSize: 14, outline: 'none' }} placeholder="e.g. Dr. Meredith Grey" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44546F', marginBottom: 4 }}>Role</label>
          <input type="text" value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', height: 36, border: `1px solid ${token('color.border', '#DFE1E6')}`, borderRadius: 3, padding: '0 10px', fontSize: 14, outline: 'none' }} placeholder="e.g. Lead Surgeon" />
        </div>
        <div style={{ marginBottom: 20 }}>
          <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44546F', marginBottom: 4 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', height: 36, border: `1px solid ${token('color.border', '#DFE1E6')}`, borderRadius: 3, padding: '0 10px', fontSize: 14, outline: 'none' }} placeholder="email@hospital.org" />
        </div>
      </div>
      <div style={{ padding: '16px 24px', borderTop: `1px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`, display: 'flex', justifyContent: 'flex-end', gap: 12, backgroundColor: '#fff' }}>
        <button onClick={onClose} style={{ height: 36, padding: '0 16px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer', fontSize: 14 }}>Cancel</button>
        <button onClick={() => { onAdd({ name, role, email }); onClose(); }} style={{ height: 36, padding: '0 16px', background: '#422670', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: 14, fontWeight: 600 }}>Save Person</button>
      </div>
    </div>
  );
}

// ─── Main Detail Page ─────────────────────────────────────────────────────────

export default function MissionDetailPage({ user, onSwitchAccount, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [mission, setMission] = useState(null);
  const [loading, setLoading] = useState(true);

  const [editing, setEditing] = useState(null);
  const [tempVal, setTempVal] = useState('');
  const [hovered, setHovered] = useState(null);

  useEffect(() => {
    if (id) {
      fetchMission();
    }
  }, [id]);

  const fetchMission = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('missions').select('*').eq('id', id).single();
    if (data) {
      setMission(data);
      fetchMissionItems();
    }
    setLoading(false);
  };

  const fetchMissionItems = async () => {
    const { data } = await supabase
      .from('shipments')
      .select('*, inventory(description, company, reference_number)')
      .eq('mission_id', id);
    if (data) {
      const mapped = data.map(s => ({
        id: s.id,
        description: s.inventory?.description || 'Unknown',
        company: s.inventory?.company || 'Unknown',
        ref: s.inventory?.reference_number || '—',
        qty: s.quantity,
        qtyFlag: null
      }));
      setItems(mapped);
    }
  };

  const startEdit = (field) => {
    setEditing(field);
    setTempVal(mission[field] || '');
    setHovered(null);
  };

  const commitEdit = async () => {
    const field = editing;
    const value = tempVal;
    
    setMission(prev => ({ ...prev, [field]: value }));
    setEditing(null);

    try {
      const { error } = await supabase.from('missions').update({ [field]: value }).eq('id', id);
      if (error) throw error;
    } catch (err) {
      console.error('Mission save failed:', err);
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setTempVal('');
  };

  const renderEditableHeader = (field, label, bold = false) => {
    const isEditing = editing === field;
    const isHovered = hovered === field && !isEditing;

    if (isEditing) {
      return (
        <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 8 }}>
          <input 
            autoFocus
            value={tempVal}
            onChange={e => setTempVal(e.target.value)}
            style={{ 
              padding: '4px 8px', borderRadius: 3, border: '2px solid #2684FF',
              fontSize: 14, outline: 'none', fontFamily: 'inherit', width: 240
            }}
          />
          <button onClick={commitEdit} style={{ border: 'none', background: '#1F845A', color: '#fff', borderRadius: 3, padding: '4px 8px', cursor: 'pointer' }}>✓</button>
          <button onClick={cancelEdit} style={{ border: 'none', background: '#AE2E24', color: '#fff', borderRadius: 3, padding: '4px 8px', cursor: 'pointer' }}>✕</button>
        </div>
      );
    }

    return (
      <div 
        onMouseEnter={() => setHovered(field)}
        onMouseLeave={() => setHovered(null)}
        onClick={() => startEdit(field)}
        style={{ 
          cursor: 'pointer', borderRadius: 4, padding: '2px 8px', margin: '0 -8px',
          display: 'inline-block',
          backgroundColor: isHovered ? 'rgba(9,30,66,0.04)' : 'transparent',
          border: isHovered ? '1px solid rgba(9,30,66,0.08)' : '1px solid transparent'
        }}
      >
        <p style={{ margin: 0, fontSize: bold ? 14 : 13, color: bold ? '#44546F' : '#626F86', fontWeight: bold ? 500 : 400 }}>
          {mission[field] || (bold ? 'Add Location' : 'Add Dates')}
        </p>
      </div>
    );
  };
  const [tab, setTab] = useState('items');
  const [activeTab, setActiveTab] = useState('items');
  const [addPanelOpen, setAddPanel] = useState(false);
  const [personPanelOpen, setPersonPanel] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const [itemSearch, setItemSearch] = useState('');
  const [peopleSearch, setPeopleSearch] = useState('');

  if (loading) return <div style={{ padding: 40 }}>Loading...</div>;
  if (!mission) return <div style={{ padding: 40 }}>Mission not found.</div>;

  const m = mission;

  const SPECIALTY_COLORS = {
    'Plastics': { bg: '#F3F0FF', text: '#5E4DB2' },
    'Ortho':    { bg: '#E9F2FF', text: '#0055CC' },
    'Cardiac':  { bg: '#FFF3EB', text: '#974F0C' },
    'General':  { bg: '#E3FCEF', text: '#006644' },
  };

  function SpecialtyBadge({ specialty }) {
    const c = (specialty && SPECIALTY_COLORS[specialty]) || { bg: '#DFE1E6', text: '#44546F' };
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center',
        padding: '2px 10px', borderRadius: 999,
        backgroundColor: c.bg, color: c.text,
        fontSize: 11, fontWeight: 500, whiteSpace: 'nowrap',
      }}>
        {specialty || 'General'}
      </span>
    );
  }

  const [items, setItems] = useState(MISSION_ITEMS);
  const [people, setPeople] = useState([
    { id: 1, name: 'Dr. Sarah Jenkins', role: 'Lead Surgeon', email: 's.jenkins@hospital.org' },
    { id: 2, name: 'Mark Thompson', role: 'Coordinator', email: 'm.thompson@mendingkids.org' },
    { id: 3, name: 'Elena Rodriguez', role: 'Nurse Practitioner', email: 'elena.r@health.gov' },
  ]);



  const handleDeleteItem = (item) => {
    setDeleteTarget({ type: 'item', data: item });
  };

  const handleDeletePerson = (person) => {
    setDeleteTarget({ type: 'person', data: person });
  };

  const handleConfirmDelete = () => {
    if (deleteTarget.type === 'item') {
      setItems(prev => prev.filter(i => i.id !== deleteTarget.data.id));
    } else {
      setPeople(prev => prev.filter(p => p.id !== deleteTarget.data.id));
    }
    setDeleteTarget(null);
  };

  const handleAddPerson = (newP) => {
    setPeople(prev => [...prev, { ...newP, id: Date.now() }]);
  };

  const handleUpdateItem = (id, field, value) => {
    setItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const filteredItems = items.filter(i => 
    i.description.toLowerCase().includes(itemSearch.toLowerCase()) ||
    i.company.toLowerCase().includes(itemSearch.toLowerCase())
  );

  const filteredPeople = people.filter(p => 
    p.name.toLowerCase().includes(peopleSearch.toLowerCase()) ||
    p.role.toLowerCase().includes(peopleSearch.toLowerCase())
  );
  const sc = SPECIALTY_COLORS[m.specialty] || { bg: '#626F86', text: '#fff' };

  return (
    <PageLayout>
      <TopNavigation isFixed>
        <TopNav user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
      </TopNavigation>
      <Content>
        <LeftSidebar width={mobileMenuOpen ? '100vw' : 240}>
          <div className={mobileMenuOpen ? "" : "sidebar-collapsed"}>
            <SideNav 
              active="missions" 
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
            {/* Main content */}
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#fff' }}>
              {/* Back link and Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <button
                    onClick={() => navigate('/missions')}
                    style={{ background: 'none', border: 'none', color: 'var(--ds-link)', cursor: 'pointer', padding: 0, marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                    ← Back to Missions
                  </button>
                  <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#172B4D' }}>{m.name}</h1>
                </div>
                <button 
                  onClick={() => activeTab === 'items' ? setAddPanel(true) : setPersonPanel(true)}
                  style={{ height: 32, padding: '0 16px', backgroundColor: '#422670', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer', marginTop: 16, fontFamily: 'inherit' }}>
                  {activeTab === 'items' ? 'Add Items' : 'Add Person'}
                </button>
              </div>

              {renderEditableHeader('location', 'Location', true)}
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                {renderEditableHeader('dates', 'Dates', false)}
                <div style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: '#C1C7D0' }} />
                <SpecialtyBadge specialty={m.specialty} />
              </div>

              {/* Tabs */}
              <div style={{ display: 'flex', borderBottom: '1px solid #e8e8e8', marginBottom: 16 }}>
                {[
                  { key: 'items', label: 'Items', count: m.item_count || items.length },
                  { key: 'people', label: 'People', count: m.people_count || people.length }
                ].map(t => (
                  <button
                    key={t.key}
                    onClick={() => { setTab(t.key); setActiveTab(t.key); }}
                    style={{
                      padding: '10px 16px', border: 'none', background: 'transparent',
                      fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                      color: activeTab === t.key ? '#172B4D' : '#626F86',
                      fontWeight: activeTab === t.key ? 600 : 400,
                      borderBottom: activeTab === t.key ? '2px solid #172B4D' : '2px solid transparent',
                      marginBottom: -1,
                      display: 'flex', alignItems: 'center', gap: 6
                    }}
                  >
                    {t.label}
                    <span style={{ 
                      fontSize: 11, padding: '1px 6px', borderRadius: 10, 
                      backgroundColor: activeTab === t.key ? '#F3F0FF' : '#F4F5F7',
                      color: activeTab === t.key ? '#422670' : '#626F86'
                    }}>
                      {t.count}
                    </span>
                  </button>
                ))}
              </div>

              {activeTab === 'items' ? (
                /* Items View */
                <>
                    <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <FilterDropdown label="Category" options={['Syringes', 'Patches', 'Chest Tubes', 'Bandages']} selected={null} onSelect={() => {}} />
                        <FilterDropdown label="Company" options={['Abbott', 'Nipro', 'Swann-Morton', 'Masimo', 'B. Braun']} selected={null} onSelect={() => {}} />
                      </div>
                      
                      {/* Search bar */}
                      <div style={{ position: 'relative', width: 280, flexShrink: 0 }}>
                        <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#626F86', display: 'flex', pointerEvents: 'none' }}>
                          <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                            <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                            <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                          </svg>
                        </span>
                        <input 
                          type="text" 
                          placeholder="Search supplies..." 
                          value={itemSearch} 
                          onChange={e => setItemSearch(e.target.value)}
                          style={{ 
                            width: '100%', height: 32, paddingLeft: 32, paddingRight: 10,
                            border: `1px solid ${token('color.border', '#DFE1E6')}`, borderRadius: 3, 
                            fontSize: 14, fontFamily: 'inherit', outline: 'none',
                            backgroundColor: token('elevation.surface.sunken', '#F4F5F7'),
                          }}
                        />
                      </div>
                    </div>

                  <div className="mobile-stack-table" style={{ border: '1px solid #e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 180px 180px 80px 40px', padding: '10px 14px', backgroundColor: '#FAFBFC', borderBottom: '1px solid #e8e8e8', gap: 8 }}>
                      {['Item Description', 'Company', 'Reference', 'Qty', ''].map(h => (
                        <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#626F86', textTransform: 'uppercase' }}>{h}</span>
                      ))}
                    </div>
                    {filteredItems.map(item => (
                      <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '1fr 180px 180px 80px 40px', padding: '10px 14px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f4f4f4' }}>
                        <span style={{ fontSize: 13, color: '#172B4D' }}>{item.description}</span>
                        <span style={{ fontSize: 13, color: '#44546F' }}>{item.company}</span>
                        <span style={{ fontSize: 13, color: '#172B4D' }}>{item.ref}</span>
                        <input 
                          type="number" value={item.qty || ''} 
                          onChange={e => handleUpdateItem(item.id, 'qty', parseInt(e.target.value) || 0)}
                          style={{ width: 50, border: '1px solid transparent', padding: '2px 4px', fontSize: 13, fontWeight: 600 }}
                        />
                        <button 
                          onClick={() => handleDeleteItem(item)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#626F86', padding: 4 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                /* People View */
                <>
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <FilterDropdown label="Role" options={['Surgeon', 'Nurse', 'Coordinator', 'Specialist']} selected={null} onSelect={() => {}} />
                    </div>
                    
                    <div style={{ position: 'relative', width: 280, flexShrink: 0 }}>
                      <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#8590A2', display: 'flex' }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5"/></svg>
                      </span>
                      <input 
                        type="text" placeholder="Search team..." 
                        value={peopleSearch} onChange={e => setPeopleSearch(e.target.value)}
                        style={{ 
                          width: '100%', height: 32, paddingLeft: 28, 
                          border: `1px solid ${token('color.border', '#DFE1E6')}`, borderRadius: 3, 
                          fontSize: 13, outline: 'none',
                          backgroundColor: token('elevation.surface.sunken', '#F4F5F7'),
                        }}
                      />
                    </div>
                  </div>

                  <div className="mobile-stack-table" style={{ border: '1px solid #e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 200px 240px 40px', padding: '10px 14px', backgroundColor: '#FAFBFC', borderBottom: '1px solid #e8e8e8', gap: 8 }}>
                      {['Name', 'Role', 'Email', ''].map(h => (
                        <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#626F86', textTransform: 'uppercase' }}>{h}</span>
                      ))}
                    </div>
                    {filteredPeople.map(person => (
                      <div key={person.id} style={{ display: 'grid', gridTemplateColumns: '1fr 200px 240px 40px', padding: '12px 14px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f4f4f4' }}>
                        <span style={{ fontSize: 13, fontWeight: 500, color: '#172B4D' }}>{person.name}</span>
                        <span style={{ fontSize: 13, color: '#44546F' }}>{person.role}</span>
                        <span style={{ fontSize: 13, color: '#44546F' }}>{person.email}</span>
                        <button 
                          onClick={() => handleDeletePerson(person)}
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#626F86', padding: 4 }}>
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                        </button>
                      </div>
                    ))}
                    <div style={{ padding: '12px 14px', textAlign: 'center' }}>
                      <button 
                        onClick={() => setPersonPanel(true)}
                        style={{ background: 'none', border: '1px dashed #C1C7D0', borderRadius: 4, padding: '8px 16px', width: '100%', color: '#626F86', cursor: 'pointer', fontSize: 13, fontWeight: 500 }}>
                        + Add Person to Mission
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            <SlidePanel isOpen={addPanelOpen} onClose={() => setAddPanel(false)} width={480}>
              <AddItemsPanel
                category={m.specialty || 'ENT'}
                onClose={() => setAddPanel(false)}
                onNavigate={onNavigate}
              />
            </SlidePanel>

            <SlidePanel isOpen={personPanelOpen} onClose={() => setPersonPanel(false)} width={480}>
              <AddPersonPanel 
                onClose={() => setPersonPanel(false)} 
                onAdd={handleAddPerson}
              />
            </SlidePanel>

            <DeleteConfirmationModal
              isOpen={!!deleteTarget}
              onClose={() => setDeleteTarget(null)}
              onConfirm={handleConfirmDelete}
              title={`Remove ${deleteTarget?.type === 'item' ? 'Item' : 'Person'}`}
              message={`Are you sure you want to remove this ${deleteTarget?.type === 'item' ? 'item from the mission allocation' : 'person from the team'}`}
              itemName={deleteTarget?.data?.description || deleteTarget?.data?.name}
            />
          </div>
        </Main>
      </Content>
    </PageLayout>
  );
}
