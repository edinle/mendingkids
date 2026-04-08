import { useState } from 'react';
import { PageLayout, Content, Main, LeftSidebar, TopNavigation } from '@atlaskit/page-layout';
import TopNav from './TopNav';
import SideNav from './SideNav';
import SlidePanel from './SlidePanel';
import DeleteConfirmationModal from './DeleteConfirmationModal';

// ─── Mock items for a mission ─────────────────────────────────────────────────

const MISSION_ITEMS = [
  { id: 1,  description: 'i-Stat User guide',           company: 'Abbott', ref: '609874325',      qty: 10,   qtyFlag: null    },
  { id: 2,  description: 'Eclipse Needle 18G x 1.5in',  company: 'Abbott', ref: '305766',         qty: 2433, qtyFlag: null    },
  { id: 3,  description: 'Sterilizable Gas + Steam Barcode', company: 'Nipro',  ref: 'IS-170/AVF/RL/H-WB', qty: 342, qtyFlag: null },
  { id: 4,  description: 'Surgical Blade #15',          company: 'Swann-Morton', ref: 'BLD-15',   qty: 100,  qtyFlag: 'danger' },
  { id: 5,  description: 'Pulse Oximeter',              company: 'Masimo', ref: 'PX-101',         qty: 15,   qtyFlag: 'info'   },
  { id: 6,  description: 'IV Cannula 20G',             company: 'B. Braun', ref: 'IVC-20',       qty: 50,   qtyFlag: null     },
  { id: 7,  description: 'Surgical Masks (Box of 50)',  company: '3M', ref: 'MSK-77',         qty: 200,  qtyFlag: null     },
  { id: 8,  description: 'Gauze Pads 4x4',              company: 'Johnson & Johnson', ref: 'GP-44', qty: 500,  qtyFlag: null     },
  { id: 9,  description: 'Surgical Gowns (Large)',      company: 'Cardinal Health', ref: 'SGN-LRG', qty: 40,   qtyFlag: null     },
  { id: 10, description: 'Hand Sanitizer 500ml',       company: 'Purell', ref: 'HS-500',         qty: 12,   qtyFlag: null     },
  { id: 11, description: 'Adhesive Bandage Strips',    company: 'Curad', ref: 'BD-100',          qty: 1000, qtyFlag: null     },
  { id: 12, description: 'Blood Pressure Cuff',         company: 'Welch Allyn', ref: 'BPC-AD',   qty: 5,    qtyFlag: null     },
  { id: 13, description: 'Disposable Syringe 10ml',    company: 'BD', ref: 'SYR-10',            qty: 300,  qtyFlag: null     },
  { id: 14, description: 'Lignocaine 2% Injection',    company: 'Hospira', ref: 'LIG-2PCT',       qty: 25,   qtyFlag: null     },
  { id: 15, description: 'Betadine Solution 1L',       company: 'Mundipharma', ref: 'BET-1L',    qty: 4,    qtyFlag: null     },
  { id: 16, description: 'Surgical Tape 1in',           company: '3M', ref: 'TP-201',             qty: 60,   qtyFlag: null     },
  { id: 17, description: 'Elastic Bandages 4in',        company: 'ACE', ref: 'EB-400',           qty: 30,   qtyFlag: null     },
  { id: 18, description: 'Sterile Gloves Size 7.5',    company: 'Ansell', ref: 'GLV-75',         qty: 100,  qtyFlag: null    },
  { id: 19, description: 'Saline Solution 500ml',      company: 'Baxter', ref: 'SS-500',         qty: 80,   qtyFlag: null    },
  { id: 20, description: 'Digital Thermometer',         company: 'Omron', ref: 'DT-501',          qty: 10,   qtyFlag: null    },
];

const ADD_ITEMS_RECOMMENDED = [
  { id: 1,  description: 'i-Stat User guide',           company: 'Abbott' },
  { id: 2,  description: 'Eclipse Needle 18G x 1.5in',  company: 'Abbott' },
  { id: 3,  description: 'Sterilizable Gas + Steam Barcode', company: 'Nipro'  },
  { id: 4,  description: 'Suture Silk 3-0',            company: 'Ethicon' },
  { id: 5,  description: 'Tracheal Tube 7.5mm',         company: 'Teleflex' },
  { id: 6,  description: 'Defibrillator Pads',          company: 'Zoll' },
  { id: 7,  description: 'Suction Catheter',            company: 'Medtronic' },
  { id: 8,  description: 'Oxygen Mas - Adult',          company: 'Aero Healthcare' },
];

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

function AddItemsPanel({ category = 'ENT', onClose, onAddItemsPage, onNavigate }) {
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
      width: 320, flexShrink: 0,
      borderLeft: '1px solid #e8e8e8',
      display: 'flex', flexDirection: 'column',
      height: '100%', backgroundColor: '#fff',
    }}>
      {/* Panel header */}
      <div style={{ padding: '16px 20px 12px', borderBottom: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#000' }}>Add Items</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#626F86', display: 'flex' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <path d="M4 4l10 10M14 4L4 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
          </svg>
        </button>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '14px 20px' }}>
        {/* Search */}
        <div style={{ position: 'relative', marginBottom: 12 }}>
          <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#8590A2', display: 'flex' }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </span>
          <input
            type="text" placeholder="Search"
            value={search} onChange={e => setSearch(e.target.value)}
            style={{ width: '100%', height: 34, paddingLeft: 28, paddingRight: 8, border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box' }}
          />
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
          {CATEGORY_CHIPS.map(chip => (
            <button
              key={chip}
              onClick={() => setChip(c => c === chip ? null : chip)}
              style={{
                padding: '3px 10px', borderRadius: 999, border: 'none', cursor: 'pointer',
                backgroundColor: activeChip === chip ? (CHIP_COLORS[chip] || '#e8e8e8') : (CHIP_COLORS[chip] || '#e8e8e8'),
                color: CHIP_TEXT[chip] || '#172B4D',
                fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
                outline: activeChip === chip ? `2px solid ${CHIP_TEXT[chip]}` : 'none',
              }}
            >
              {chip}
            </button>
          ))}
        </div>

        {/* Recommended section */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <h4 style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#000' }}>Recommended for {category}</h4>
          <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
            <button onClick={() => setPage(p => Math.max(1, p - 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#626F86', padding: '2px', display: 'flex' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M9 3L5 7l4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </button>
            <span style={{ fontSize: 12, color: '#626F86' }}>{page} of 1</span>
            <button onClick={() => setPage(p => Math.min(1, p + 1))} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#626F86', padding: '2px', display: 'flex' }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/></svg>
            </button>
          </div>
        </div>

        {/* Compact table */}
        <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '28px 1fr auto', padding: '6px 10px', backgroundColor: '#FAFBFC', borderBottom: '1px solid #e8e8e8', gap: 8 }}>
            {['', 'Item Description', 'Company'].map((h, i) => (
              <span key={i} style={{ fontSize: 11, fontWeight: 700, color: '#626F86', textTransform: 'uppercase', letterSpacing: '0.03em' }}>{h}</span>
            ))}
          </div>
          {filtered.map(item => (
            <div key={item.id} style={{
              display: 'grid', gridTemplateColumns: '28px 1fr auto',
              padding: '7px 10px', gap: 8, alignItems: 'center',
              borderBottom: '1px solid #f4f4f4',
              backgroundColor: selected[item.id] ? '#F8F6FF' : '#fff',
            }}>
              <input type="checkbox" checked={!!selected[item.id]} onChange={() => toggle(item.id)} style={{ width: 14, height: 14, cursor: 'pointer', accentColor: '#422670' }} />
              <span style={{ fontSize: 12, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.description}</span>
              <span style={{ fontSize: 11, color: '#626F86' }}>{item.company}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '12px 20px', borderTop: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between' }}>
        <button onClick={onClose} style={{ height: 34, padding: '0 14px', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit' }}>Cancel</button>
        <button
          onClick={() => onNavigate && onNavigate('add-items', { category })}
          style={{ height: 34, padding: '0 14px', border: 'none', borderRadius: 4, background: '#422670', color: '#fff', cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 500 }}
        >
          Add Item
        </button>
      </div>
    </div>
  );
}

// ─── Main Detail Page ─────────────────────────────────────────────────────────

function AddPersonPanel({ onClose, onAdd }) {
  const [name, setName] = useState('');
  const [role, setRole] = useState('');
  const [email, setEmail] = useState('');

  return (
    <div style={{ width: 320, display: 'flex', flexDirection: 'column', height: '100%', backgroundColor: '#fff', borderLeft: '1px solid #e8e8e8' }}>
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h3 style={{ margin: 0, fontSize: 18, fontWeight: 700 }}>Add Person</h3>
        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none"><path d="M4 4l10 10M14 4L4 14" stroke="#626F86" strokeWidth="1.5" strokeLinecap="round"/></svg>
        </button>
      </div>
      <div style={{ flex: 1, padding: '20px' }}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Full Name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} style={{ width: '100%', height: 34, border: '1px solid #d9d9d9', borderRadius: 4, padding: '0 8px' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Role</label>
          <input type="text" value={role} onChange={e => setRole(e.target.value)} style={{ width: '100%', height: 34, border: '1px solid #d9d9d9', borderRadius: 4, padding: '0 8px' }} />
        </div>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Email</label>
          <input type="email" value={email} onChange={e => setEmail(e.target.value)} style={{ width: '100%', height: 34, border: '1px solid #d9d9d9', borderRadius: 4, padding: '0 8px' }} />
        </div>
      </div>
      <div style={{ padding: '12px 20px', borderTop: '1px solid #e8e8e8', display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
        <button onClick={onClose} style={{ height: 34, padding: '0 12px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 4, cursor: 'pointer' }}>Cancel</button>
        <button onClick={() => { onAdd({ name, role, email }); onClose(); }} style={{ height: 34, padding: '0 12px', background: '#422670', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' }}>Save Person</button>
      </div>
    </div>
  );
}

// ─── Main Detail Page ─────────────────────────────────────────────────────────

export default function MissionDetailPage({ mission, onNavigate, user, onSwitchAccount, onLogout }) {
  const [tab, setTab] = useState('items');
  const [activeTab, setActiveTab] = useState('items');
  const [addPanelOpen, setAddPanel] = useState(false);
  const [personPanelOpen, setPersonPanel] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  
  const [itemSearch, setItemSearch] = useState('');
  const [peopleSearch, setPeopleSearch] = useState('');

  const m = mission || { name: 'Mission Name', specialty: 'ENT', location: 'Location Name', timeAway: '4 months away', items: 30 };

  const SPECIALTY_COLORS = {
    'Plastics': { bg: '#F3F0FF', text: '#5E4DB2' },
    'Ortho':    { bg: '#E9F2FF', text: '#0055CC' },
    'Cardiac':  { bg: '#FFF3EB', text: '#974F0C' },
    'General':  { bg: '#E3FCEF', text: '#006644' },
  };

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
        <TopNav onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
      </TopNavigation>
      <Content>
        <LeftSidebar width={mobileMenuOpen ? '100vw' : 240}>
          <div className={mobileMenuOpen ? "" : "sidebar-collapsed"}>
            <SideNav 
              active="missions" 
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
            {/* Main content */}
            <div style={{ flex: 1, overflowY: 'auto', backgroundColor: '#fff' }}>
              {/* Back link and Header */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
                <div>
                  <button
                    onClick={() => onNavigate('missions')}
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

              <p style={{ margin: '0 0 2px', fontSize: 14, color: '#44546F' }}>{m.location || 'Location Name'}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
                <p style={{ margin: 0, fontSize: 13, color: '#626F86' }}>{m.dates || m.timeAway || '4 months away'}</p>
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
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: '0 1 240px' }}>
                      <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#8590A2', display: 'flex' }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5"/></svg>
                      </span>
                      <input 
                        type="text" placeholder="Search supplies..." 
                        value={itemSearch} onChange={e => setItemSearch(e.target.value)}
                        style={{ width: '100%', height: 32, paddingLeft: 28, border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13, outline: 'none' }}
                      />
                    </div>
                    <button style={{ height: 32, padding: '0 12px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13, cursor: 'pointer' }}>Filter</button>
                  </div>

                  <div className="mobile-stack-table" style={{ border: '1px solid #e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 2fr) 1.2fr 1.2fr 60px 40px', padding: '10px 14px', backgroundColor: '#FAFBFC', borderBottom: '1px solid #e8e8e8', gap: 8 }}>
                      {['Item Description', 'Company', 'Reference', 'Qty', ''].map(h => (
                        <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#626F86', textTransform: 'uppercase' }}>{h}</span>
                      ))}
                    </div>
                    {filteredItems.map(item => (
                      <div key={item.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 2fr) 1.2fr 1.2fr 60px 40px', padding: '10px 14px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f4f4f4' }}>
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
                  <div style={{ display: 'flex', gap: 8, marginBottom: 16, alignItems: 'center' }}>
                    <div style={{ position: 'relative', flex: '0 1 240px' }}>
                      <span style={{ position: 'absolute', left: 8, top: '50%', transform: 'translateY(-50%)', color: '#8590A2', display: 'flex' }}>
                        <svg width="14" height="14" viewBox="0 0 16 16" fill="none"><circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/><path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5"/></svg>
                      </span>
                      <input 
                        type="text" placeholder="Search team..." 
                        value={peopleSearch} onChange={e => setPeopleSearch(e.target.value)}
                        style={{ width: '100%', height: 32, paddingLeft: 28, border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13, outline: 'none' }}
                      />
                    </div>
                    <button style={{ height: 32, padding: '0 12px', background: '#fff', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13, cursor: 'pointer' }}>Filter</button>
                  </div>

                  <div className="mobile-stack-table" style={{ border: '1px solid #e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr 40px', padding: '10px 14px', backgroundColor: '#FAFBFC', borderBottom: '1px solid #e8e8e8', gap: 8 }}>
                      {['Name', 'Role', 'Email', ''].map(h => (
                        <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#626F86', textTransform: 'uppercase' }}>{h}</span>
                      ))}
                    </div>
                    {filteredPeople.map(person => (
                      <div key={person.id} style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1.2fr 40px', padding: '12px 14px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f4f4f4' }}>
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

            <SlidePanel isOpen={addPanelOpen} onClose={() => setAddPanel(false)} width={400}>
              <AddItemsPanel
                category={m.specialty || 'ENT'}
                mission={m}
                onClose={() => setAddPanel(false)}
                onNavigate={onNavigate}
              />
            </SlidePanel>

            <SlidePanel isOpen={personPanelOpen} onClose={() => setPersonPanel(false)} width={400}>
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
