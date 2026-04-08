import { useState, useRef, useEffect } from 'react';
import { PageLayout, Content, Main, LeftSidebar, TopNavigation } from '@atlaskit/page-layout';
import TopNav from './TopNav';
import SideNav from './SideNav';

// ─── Mock Data ────────────────────────────────────────────────────────────────

const SELECTED_PRELOADED = [
  { id: 1, description: 'i-Stat User guide',           company: 'Abbott', ref: '609874325',      qty: 10,   exp: '12/4' },
  { id: 2, description: 'Eclipse Needle 18G x 1.5in',  company: 'Abbott', ref: '305766',         qty: 2433, exp: '12/4' },
  { id: 3, description: 'Sterilizable Gas + Steam...', company: 'Nipro',  ref: 'IS-170/AVF/RL/H-WB', qty: 342, exp: '12/4' },
];

const RECOMMENDED_ITEMS = [
  { id: 4,  description: 'i-Stat User guide',           company: 'Abbott',   ref: '414350986',      qty: 10,   exp: '12/4' },
  { id: 5,  description: 'Eclipse Needle 18G x 1.5in',  company: 'Company',  ref: '305766',         qty: 2433, exp: '12/4' },
  { id: 6,  description: 'Sterilizable Gas + Steam...', company: 'Nipro',    ref: 'IS-170/AVF/RL/H-WB', qty: 342, exp: '12/4' },
  { id: 7,  description: 'Chest Tube',                  company: 'Text',     ref: '203457349',      qty: 10,   exp: '12/4' },
  { id: 8,  description: 'Gauze',                       company: 'Text',     ref: 'SWKE48G',        qty: 10,   exp: '12/4' },
  { id: 9,  description: 'Item Name Testing for...',    company: 'Text',     ref: '45780GHLRKNV',   qty: 10,   exp: '12/4' },
  { id: 10, description: 'Text',                        company: 'Text',     ref: 'Q9345R8GLHK',    qty: 10,   exp: '12/4' },
  { id: 11, description: 'Text',                        company: 'Text',     ref: 'W94RGTJ',        qty: 10,   exp: '12/4' },
];

const ITEM_TYPES = ['Surgical', 'Medication', 'Diagnostic', 'Consumables'];
const COMPANIES  = ['Abbott', 'Nipro', 'Medline', 'Pfizer', 'Johnson & Johnson'];

// ─── Primitives ───────────────────────────────────────────────────────────────

function QtyBadge({ qty }) {
  const bg = qty >= 1000 ? '#FFBE33' : qty >= 100 ? '#F8E6A0' : '#F1F2F4';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 36, padding: '1px 8px',
      backgroundColor: bg, borderRadius: 10,
      fontSize: 12, fontWeight: 600, color: '#172B4D',
    }}>
      {qty}
    </span>
  );
}

function FilterDropdown({ label, options, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    const h = e => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          height: 32, padding: '0 10px',
          border: '1px solid #d9d9d9', borderRadius: 4,
          background: selected ? '#F3F0FF' : '#fff',
          color: selected ? '#422670' : '#172B4D',
          cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
        }}
      >
        {selected || label}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d={open ? 'M3 8l3-3 3 3' : 'M3 4l3 3 3-3'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4,
          minWidth: 160, padding: '4px 0', background: '#fff',
          borderRadius: 4, boxShadow: '0 4px 16px rgba(9,30,66,0.16)', zIndex: 100,
        }}>
          <button onClick={() => { onSelect(''); setOpen(false); }} style={dropBtnStyle(false)}>All</button>
          {options.map(o => (
            <button key={o} onClick={() => { onSelect(o); setOpen(false); }} style={dropBtnStyle(selected === o)}>{o}</button>
          ))}
        </div>
      )}
    </div>
  );
}

const dropBtnStyle = active => ({
  display: 'block', width: '100%', padding: '7px 12px', border: 'none',
  background: active ? '#F3F0FF' : 'transparent',
  color: active ? '#422670' : '#172B4D',
  fontSize: 13, fontFamily: 'inherit', textAlign: 'left',
  fontWeight: active ? 600 : 400, cursor: 'pointer',
});

// ─── Table component ──────────────────────────────────────────────────────────

const COL = '32px 2fr 1.4fr 1.4fr 80px 80px';

function TableHead() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: COL, padding: '10px 14px', backgroundColor: '#FAFBFC', borderBottom: '1px solid #e8e8e8', gap: 8 }}>
      {['', 'Item Description', 'Manufacturing Company', 'Reference Number', 'Quantity', 'Expiration'].map((h, i) => (
        <span key={i} style={{ fontSize: 11, fontWeight: 700, color: '#626F86', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 3 }}>
          {h}
          {h && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 4l2-2 2 2M3 6l2 2 2-2" stroke="#8590A2" strokeWidth="1.2" strokeLinecap="round"/></svg>}
        </span>
      ))}
    </div>
  );
}

function TableRow({ item, checked, onToggle, showCheck = true }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: COL, padding: '10px 14px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f4f4f4', backgroundColor: checked ? '#F8F6FF' : '#fff' }}>
      {showCheck
        ? <input type="checkbox" checked={checked} onChange={onToggle} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#422670' }} />
        : <span />
      }
      <span style={{ fontSize: 13, color: '#172B4D' }}>{item.description}</span>
      <span style={{ fontSize: 13, color: '#172B4D' }}>{item.company}</span>
      <span style={{ fontSize: 13, color: '#44546F' }}>{item.ref}</span>
      <QtyBadge qty={item.qty} />
      <span style={{ fontSize: 13, color: '#44546F' }}>{item.exp}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AddItemsPage({ mission, onNavigate }) {
  const [itemTypeFilter, setItemType] = useState('');
  const [companyFilter,  setCompany]  = useState('');
  const [search,         setSearch]   = useState('');
  const [selectedIds,    setSelected] = useState(new Set(SELECTED_PRELOADED.map(i => i.id)));

  const handleScanOpen = () => alert('Scan functionality not implemented');

  const toggleId = id => setSelected(s => {
    const next = new Set(s);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const filteredRec = RECOMMENDED_ITEMS.filter(item => {
    if (companyFilter && item.company !== companyFilter)                             return false;
    if (search && !item.description.toLowerCase().includes(search.toLowerCase()))   return false;
    return true;
  });

  const selectedItems = [
    ...SELECTED_PRELOADED.filter(i => selectedIds.has(i.id)),
    ...RECOMMENDED_ITEMS.filter(i => selectedIds.has(i.id)),
  ];

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
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <button 
                  onClick={() => onNavigate('mission-detail', mission)}
                  style={{ background: 'none', border: 'none', color: 'var(--ds-link)', cursor: 'pointer', padding: 0, marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                  ← Back to Mission
                </button>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#172B4D' }}>Add Items {mission ? `to ${mission.name}` : ''}</h1>
              </div>
              <button 
                onClick={handleScanOpen}
                style={{ height: 32, padding: '0 16px', backgroundColor: '#422670', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer', marginTop: 16, fontFamily: 'inherit' }}>
                Scan Barcode
              </button>
            </div>

            {/* Filter bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <FilterDropdown label="Item Type" options={ITEM_TYPES} selected={itemTypeFilter} onSelect={setItemType} />
                <FilterDropdown label="Company"   options={COMPANIES}  selected={companyFilter}  onSelect={setCompany}  />
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                <span style={{ position: 'absolute', left: 8, color: '#8590A2', display: 'flex' }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                    <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                </span>
                <input
                  type="text" placeholder="Search"
                  value={search} onChange={e => setSearch(e.target.value)}
                  style={{ height: 32, paddingLeft: 28, paddingRight: 10, border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 13, fontFamily: 'inherit', width: 200, outline: 'none' }}
                />
              </div>
            </div>

            {/* Selected Items section */}
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 600, color: '#000' }}>Selected Items</h2>
              <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
                <TableHead />
                {selectedItems.length === 0
                  ? <div style={{ padding: 20, textAlign: 'center', color: '#8590A2', fontSize: 14 }}>No items selected</div>
                  : selectedItems.map(item => (
                    <TableRow key={item.id} item={item} checked onToggle={() => toggleId(item.id)} />
                  ))
                }
              </div>
            </section>

            {/* Recommended Items section */}
            <section style={{ marginBottom: 80 }}>
              <h2 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 600, color: '#000' }}>
                Recommended for {mission?.specialty || 'ENT'}
              </h2>
              <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
                <TableHead />
                {filteredRec.map(item => (
                  <TableRow key={item.id} item={item} checked={selectedIds.has(item.id)} onToggle={() => toggleId(item.id)} />
                ))}
              </div>
            </section>
          </div>

          {/* Sticky footer */}
          <div style={{
            position: 'fixed', bottom: 0, right: 0,
            left: 240, padding: '14px 32px',
            backgroundColor: '#fff', borderTop: '1px solid #e8e8e8',
            display: 'flex', justifyContent: 'flex-end', gap: 10,
            zIndex: 50,
          }}>
            <button
              onClick={() => onNavigate('mission-detail', mission)}
              style={{ height: 36, padding: '0 20px', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}
            >
              Cancel
            </button>
            <button
              onClick={() => onNavigate('mission-detail', mission)}
              style={{
                height: 36, padding: '0 20px',
                border: 'none', borderRadius: 4,
                background: selectedIds.size > 0 ? '#422670' : '#e8e8e8',
                color: selectedIds.size > 0 ? '#fff' : '#8590A2',
                cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
              Add Item
            </button>
          </div>
        </Main>
      </Content>
    </PageLayout>
  );
}
