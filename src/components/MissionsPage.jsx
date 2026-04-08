import { useState, useRef, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import { PageLayout, Content, Main, LeftSidebar, TopNavigation } from '@atlaskit/page-layout';
import TopNav from './TopNav';
import SideNav from './SideNav';
import CreateMissionPanel from './CreateMissionPanel';
import DeleteConfirmationModal from './DeleteConfirmationModal';

// ── Data Handling ────────────────────────────────────────────────────────────
// Missions data is now fetched from Supabase.

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

function FilterDropdown({ label, options, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
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
          fontWeight: selected ? 500 : 400,
        }}
      >
        {selected || label}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d={open ? 'M3 8l3-3 3 3' : 'M3 4l3 3 3-3'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4,
          minWidth: 160, padding: '4px 0',
          background: '#fff', borderRadius: 4,
          boxShadow: '0 4px 16px rgba(9,30,66,0.16)',
          zIndex: 100,
        }}>
          <DropItem label="All" active={!selected} onClick={() => { onSelect(''); setOpen(false); }} />
          {options.map(o => (
            <DropItem key={o} label={o} active={selected === o} onClick={() => { onSelect(o); setOpen(false); }} />
          ))}
        </div>
      )}
    </div>
  );
}

function DropItem({ label, active, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'block', width: '100%', padding: '7px 12px', border: 'none',
        background: active ? '#F3F0FF' : hov ? '#FAFBFC' : 'transparent',
        color: active ? '#422670' : '#172B4D',
        fontSize: 13, fontFamily: 'inherit', textAlign: 'left',
        fontWeight: active ? 600 : 400, cursor: 'pointer',
      }}
    >
      {label}
    </button>
  );
}

// ─── Mission Card ─────────────────────────────────────────────────────────────

function MissionCard({ mission, onClick }) {
  const [hov, setHov] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  useEffect(() => {
    const h = (e) => { if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div
      onClick={() => onClick(mission)}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        background: '#fff',
        border: `1px solid ${hov ? '#b7b9be' : '#e8e8e8'}`,
        borderRadius: 6, padding: '16px',
        cursor: 'pointer', transition: 'border-color 0.12s',
      }}
    >
      {/* Row 1: title + badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontSize: 16, fontWeight: 500, color: '#000', lineHeight: '20px' }}>
          {mission.name}
        </span>
        <SpecialtyBadge specialty={mission.specialty} />
      </div>

      {/* Row 2: location */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 4 }}>
        <PinIcon />
        <span style={{ fontSize: 13, color: '#44546F' }}>{mission.location}</span>
      </div>

      {/* Row 3: dates */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 14 }}>
        {mission.overdue
          ? <><OverdueIcon /><span style={{ fontSize: 13, color: '#c62828', fontWeight: 500 }}>{mission.days_away ? `${mission.days_away} days away` : mission.dates}</span></>
          : <><ClockIcon /><span style={{ fontSize: 13, color: '#44546F' }}>{mission.dates}</span></>
        }
      </div>

      {/* Row 4: meta + more */}
      <div
        style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        onClick={e => e.stopPropagation()}
      >
        <span style={{ fontSize: 12, color: '#626F86' }}>
          {mission.item_count || 0} items · {mission.people_count || 0} people
        </span>
        <div ref={menuRef} style={{ position: 'relative' }}>
          <button
            onClick={() => setMenuOpen(o => !o)}
            style={{
              background: 'transparent', border: 'none', cursor: 'pointer',
              padding: '2px 4px', borderRadius: 3, color: '#44546F',
              display: 'flex', alignItems: 'center',
            }}
          >
            <DotsIcon />
          </button>
          {menuOpen && (
            <div style={{
              position: 'absolute', right: 0, bottom: '100%', marginBottom: 4,
              background: '#fff', border: '1px solid #e8e8e8', borderRadius: 4,
              boxShadow: '0 4px 12px rgba(9,30,66,0.12)', zIndex: 50, minWidth: 140,
            }}>
              {['View', 'Edit', 'Archive', 'Delete'].map(action => (
                <button 
                  key={action} 
                  onClick={() => {
                    if (action === 'Delete') mission.onDelete(mission);
                    setMenuOpen(false);
                  }}
                  style={{
                    display: 'block', width: '100%', padding: '8px 14px',
                    border: 'none', background: 'transparent', textAlign: 'left',
                    fontSize: 13, cursor: 'pointer', fontFamily: 'inherit',
                    color: action === 'Delete' ? '#c62828' : '#172B4D',
                  }}>{action}</button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Tiny SVGs ────────────────────────────────────────────────────────────────

const PinIcon = () => (
  <svg width="12" height="14" viewBox="0 0 12 14" fill="none" style={{ flexShrink: 0 }}>
    <path d="M6 0a4.5 4.5 0 0 1 4.5 4.5C10.5 7.5 6 13 6 13S1.5 7.5 1.5 4.5A4.5 4.5 0 0 1 6 0Z" fill="#626F86" />
    <circle cx="6" cy="4.5" r="1.5" fill="#fff" />
  </svg>
);

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 13 13" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="6.5" cy="6.5" r="5.75" stroke="#626F86" strokeWidth="1.2" />
    <path d="M6.5 3.5v3l2 1.5" stroke="#626F86" strokeWidth="1.2" strokeLinecap="round" />
  </svg>
);

const OverdueIcon = () => (
  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
    <circle cx="7" cy="7" r="6.25" stroke="#c62828" strokeWidth="1.3" />
    <path d="M7 4v3.5M7 9.5v.5" stroke="#c62828" strokeWidth="1.3" strokeLinecap="round" />
  </svg>
);

const DotsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
    <circle cx="4" cy="8" r="1.2" fill="#626F86" />
    <circle cx="8" cy="8" r="1.2" fill="#626F86" />
    <circle cx="12" cy="8" r="1.2" fill="#626F86" />
  </svg>
);

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MissionsPage({ onNavigate, user, onSwitchAccount, onLogout }) {
  const [tab, setTab]                   = useState('current');
  const [specialtyFilter, setSpecialty] = useState('');
  const [locationFilter, setLocation]   = useState('');
  const [search, setSearch]             = useState('');
  const [createOpen, setCreateOpen]     = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [missions, setMissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMissions();
  }, [tab]);

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      const { error } = await supabase.from('missions').delete().eq('id', deleteTarget.id);
      if (error) throw error;
      setMissions(prev => prev.filter(m => m.id !== deleteTarget.id));
      setDeleteTarget(null);
    } catch (err) {
      console.error('Delete failed:', err);
      alert('Failed to delete mission');
    }
  };

  const fetchMissions = async () => {
    setLoading(true);
    let query = supabase.from('missions').select('*');
    if (tab === 'archive') {
      query = query.eq('status', 'ARCHIVED');
    } else {
      query = query.neq('status', 'ARCHIVED');
    }
    
    const { data } = await query;
    if (data) setMissions(data);
    setLoading(false);
  };

  const filtered = missions.filter(m => {
    if (specialtyFilter && m.specialty !== specialtyFilter) return false;
    if (locationFilter  && m.location  !== locationFilter)  return false;
    if (search && !m.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const allSpecialties = [...new Set(missions.map(m => m.specialty))];
  const allLocations = [...new Set(missions.map(m => m.location))];

  return (
    <PageLayout>
      <TopNavigation isFixed>
        <TopNav onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
      </TopNavigation>
      <Content>
        <LeftSidebar width={mobileMenuOpen ? '100vw' : 240}>
          <div className={mobileMenuOpen ? "" : "sidebar-collapsed"} style={{ height: 'calc(100vh - 56px)' }}>
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
            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#172B4D' }}>Missions</h1>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => setCreateOpen(true)}
                  style={{ height: 32, padding: '0 16px', backgroundColor: '#422670', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
                >
                  Create Mission
                </button>
                <button style={{
                  width: 36, height: 36, border: '1px solid #e8e8e8', borderRadius: 4,
                  background: '#fff', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <DotsIcon />
                </button>
              </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', borderBottom: '1px solid #e8e8e8', marginBottom: 16 }}>
              {['current', 'archive'].map(t => (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  style={{
                    padding: '10px 16px', border: 'none', background: 'transparent',
                    fontSize: 14, cursor: 'pointer', fontFamily: 'inherit',
                    color: tab === t ? '#172B4D' : '#626F86',
                    fontWeight: tab === t ? 600 : 400,
                    borderBottom: tab === t ? '2px solid #172B4D' : '2px solid transparent',
                    marginBottom: -1,
                  }}
                >
                  {t.charAt(0).toUpperCase() + t.slice(1)}
                </button>
              ))}
            </div>

            {/* Filter row */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, gap: 12 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <FilterDropdown label="Specialty" options={allSpecialties} selected={specialtyFilter} onSelect={setSpecialty} />
                <FilterDropdown label="Location"  options={allLocations}   selected={locationFilter}  onSelect={setLocation}  />
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center', flex: '0 1 300px' }}>
                <span style={{ position: 'absolute', left: 8, color: '#8590A2', display: 'flex' }}>
                  <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                    <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5" />
                    <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type="text"
                  placeholder="Search missions..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{
                    height: 32, paddingLeft: 28, paddingRight: 10,
                    border: '1px solid #d9d9d9', borderRadius: 4,
                    fontSize: 13, fontFamily: 'inherit', width: '100%', outline: 'none',
                  }}
                />
              </div>
            </div>

            {/* Cards grid */}
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
              {filtered.map(m => (
                <MissionCard
                  key={m.id}
                  mission={{ ...m, onDelete: setDeleteTarget }}
                  onClick={() => onNavigate('mission-detail', m)}
                />
              ))}
            </div>
          </div>
        </Main>
      </Content>

      <CreateMissionPanel
        isOpen={createOpen}
        onClose={() => setCreateOpen(false)}
        onNavigate={onNavigate}
      />
      <DeleteConfirmationModal
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Mission"
        message="Are you sure you want to delete this mission?"
        itemName={deleteTarget?.name}
      />
    </PageLayout>
  );
}
