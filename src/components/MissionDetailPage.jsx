import { useState } from 'react';
import { PageLayout, Content, Main, LeftSidebar, TopNavigation } from '@atlaskit/page-layout';
import TopNav from './TopNav';
import SideNav from './SideNav';

// ─── Mock items for a mission ─────────────────────────────────────────────────

const MISSION_ITEMS = [
  { id: 1,  description: 'i-Stat User guide',           company: 'Abbott', ref: '609874325',      qty: 10,   qtyFlag: null    },
  { id: 2,  description: 'Eclipse Needle 18G x 1.5in',  company: 'Abbott', ref: '305766',         qty: 2433, qtyFlag: null    },
  { id: 3,  description: 'Sterilizable Gas + Steam...', company: 'Nipro',  ref: 'IS-170/AVF/RL/H-WB', qty: 342, qtyFlag: null },
  { id: 4,  description: 'Text', company: 'Text', ref: 'Text', qty: 10,  qtyFlag: 'danger' },
  { id: 5,  description: 'Text', company: 'Text', ref: 'Text', qty: 10,  qtyFlag: 'info'   },
  { id: 6,  description: 'Text', company: 'Text', ref: 'Text', qty: 10,  qtyFlag: null     },
  { id: 7,  description: 'Text', company: 'Text', ref: 'Text', qty: 10,  qtyFlag: null     },
  { id: 8,  description: 'Text', company: 'Text', ref: 'Text', qty: 10,  qtyFlag: null     },
  { id: 9,  description: 'Text', company: 'Text', ref: 'Text', qty: 10,  qtyFlag: null     },
  { id: 10, description: 'Text', company: 'Text', ref: 'Text', qty: 10,  qtyFlag: null     },
  { id: 11, description: 'Text', company: 'Text', ref: 'Text', qty: 10,  qtyFlag: null     },
  { id: 12, description: 'Text', company: 'Text', ref: 'Text', qty: 10,  qtyFlag: null     },
  { id: 13, description: 'Text', company: 'Text', ref: 'Text', qty: 10,  qtyFlag: null     },
  { id: 14, description: 'Text', company: 'Text', ref: 'Text', qty: 10,  qtyFlag: null     },
  { id: 15, description: 'Text', company: 'Text', ref: 'Text', qty: 10,  qtyFlag: null     },
  { id: 16, description: 'Text', company: 'Text', ref: 'Text', qty: 10,  qtyFlag: null     },
  { id: 17, description: 'Text', company: 'Text', ref: 'Text', qty: 10,  qtyFlag: null     },
  { id: 18, description: 'Text', company: 'Text', ref: 'Text', qty: null, qtyFlag: null    },
  { id: 19, description: 'Text', company: 'Text', ref: 'Text', qty: null, qtyFlag: null    },
  { id: 20, description: 'Text', company: 'Text', ref: 'Text', qty: null, qtyFlag: null    },
];

const ADD_ITEMS_RECOMMENDED = [
  { id: 1,  description: 'i-Stat User guide',           company: 'Abbott' },
  { id: 2,  description: 'Eclipse Needle 18G x 1.5in',  company: 'Abbott' },
  { id: 3,  description: 'Sterilizable Gas + Steam...', company: 'Nipro'  },
  { id: 4,  description: 'Text', company: 'Text' },
  { id: 5,  description: 'Text', company: 'Text' },
  { id: 6,  description: 'Text', company: 'Text' },
  { id: 7,  description: 'Text', company: 'Text' },
  { id: 8,  description: 'Text', company: 'Text' },
];

const CATEGORY_CHIPS = ['Syringes', 'Patches', 'Chest Tubes', 'Bandages'];
const CHIP_COLORS = { Syringes: '#e8f4fe', Patches: '#fef9e7', 'Chest Tubes': '#fde8d8', Bandages: '#fde8e8' };
const CHIP_TEXT   = { Syringes: '#1561cc', Patches: '#b45309', 'Chest Tubes': '#cf4f27', Bandages: '#c62828' };

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

export default function MissionDetailPage({ mission, onNavigate }) {
  const [addPanelOpen, setAddPanel] = useState(false);
  const m = mission || { name: 'Mission Name', specialty: 'ENT', location: 'Location Name', timeAway: '4 months away', items: 30 };

  const SPECIALTY_COLORS = {
    ENT: { bg: '#1a7f37', text: '#fff' }, Cardiac: { bg: '#1561cc', text: '#fff' },
    General: { bg: '#cf4f27', text: '#fff' }, Ortho: { bg: '#0e7490', text: '#fff' },
    Plastics: { bg: '#6d28d9', text: '#fff' }, Infections: { bg: '#be185d', text: '#fff' },
  };
  const sc = SPECIALTY_COLORS[m.specialty] || { bg: '#626F86', text: '#fff' };

  return (
    <PageLayout>
      <TopNavigation isFixed>
        <TopNav onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />
      </TopNavigation>
      <Content>
        <LeftSidebar width={240}>
          <SideNav active="missions" onNavigate={onNavigate} />
        </LeftSidebar>
        <Main>
          <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
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
                  onClick={() => setAddPanel(p => !p)}
                  style={{ height: 32, padding: '0 16px', backgroundColor: '#422670', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer', marginTop: 16, fontFamily: 'inherit' }}>
                  Add Items
                </button>
              </div>

              <p style={{ margin: '0 0 2px', fontSize: 14, color: '#44546F' }}>{m.location || 'Location Name'}</p>
              <p style={{ margin: '0 0 20px', fontSize: 13, color: '#626F86' }}>{m.timeAway || '4 months away'}</p>

              {/* Items count */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <span style={{ fontSize: 13, color: '#626F86', fontWeight: 500 }}>{m.items || 30} items</span>
                <button
                  onClick={() => setAddPanel(p => !p)}
                  style={{
                    height: 34, padding: '0 14px',
                    border: 'none', borderRadius: 4,
                    background: '#422670', color: '#fff',
                    cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', fontWeight: 500,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  + Add Items
                </button>
              </div>

              {/* Items table */}
              <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
                {/* Head */}
                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.4fr 80px', padding: '10px 14px', backgroundColor: '#FAFBFC', borderBottom: '1px solid #e8e8e8', gap: 8 }}>
                  {['Item Description', 'Manufacturing Company', 'Reference Number', 'Qty'].map(h => (
                    <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#626F86', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 4 }}>
                      {h}
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 4l2-2 2 2M3 6l2 2 2-2" stroke="#8590A2" strokeWidth="1.2" strokeLinecap="round"/></svg>
                    </span>
                  ))}
                </div>
                {/* Rows */}
                {MISSION_ITEMS.map(item => (
                  <div key={item.id} style={{ display: 'grid', gridTemplateColumns: '2fr 1.4fr 1.4fr 80px', padding: '10px 14px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f4f4f4' }}>
                    <span style={{ fontSize: 13, color: '#172B4D' }}>{item.description}</span>
                    <span style={{ fontSize: 13, color: '#172B4D' }}>{item.company}</span>
                    <span style={{ fontSize: 13, color: '#172B4D' }}>{item.ref}</span>
                    <QtyBadge qty={item.qty} flag={item.qtyFlag} />
                  </div>
                ))}
              </div>
            </div>

            {/* Add Items side panel */}
            {addPanelOpen && (
              <AddItemsPanel
                category={m.specialty || 'ENT'}
                mission={m}
                onClose={() => setAddPanel(false)}
                onNavigate={onNavigate}
              />
            )}
          </div>
        </Main>
      </Content>
    </PageLayout>
  );
}
