import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { PageLayout, Content, Main, LeftSidebar, TopNavigation } from '@atlaskit/page-layout';
import TopNav from './TopNav';
import SideNav from './SideNav';
import SlidePanel from './SlidePanel';

// ─── Constants ────────────────────────────────────────────────────────────────

const SPECIALTY_COLORS = {
  Plastics: '#6d28d9', Ortho: '#0e7490', Cardiac: '#1561cc', General: '#cf4f27',
};

const MONTH_MAP = {
  Jan:0,Feb:1,Mar:2,Apr:3,May:4,Jun:5,Jul:6,Aug:7,Sep:8,Oct:9,Nov:10,Dec:11,
};

const DEFAULT_ORDER = ['missions','alerts','calendar','activity'];

// ─── Primitives ───────────────────────────────────────────────────────────────

function InfoTooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position:'relative', display:'inline-flex', alignItems:'center' }}>
      <button
        onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}
        style={{ background:'none', border:'none', cursor:'pointer', padding:'0 0 0 5px', color:'#8590A2', display:'flex', alignItems:'center' }}
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6.25" stroke="currentColor" strokeWidth="1.2"/>
          <path d="M7 6.5v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
          <circle cx="7" cy="4.5" r="0.65" fill="currentColor"/>
        </svg>
      </button>
      {show && (
        <div style={{
          position:'absolute', left:'110%', top:'50%', transform:'translateY(-50%)',
          zIndex:200, width:230, backgroundColor:'#172B4D', color:'#fff',
          borderRadius:5, padding:'9px 13px', fontSize:12, lineHeight:1.55,
          boxShadow:'0 4px 16px rgba(9,30,66,0.22)', pointerEvents:'none',
        }}>
          {text}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, tooltip }) {
  return (
    <div style={{ display:'flex', alignItems:'center', gap:2, marginBottom:4 }}>
      <h2 style={{ margin:0, fontSize:15, fontWeight:600, color:'#000' }}>{title}</h2>
      <InfoTooltip text={tooltip} />
    </div>
  );
}

function SectionSubtitle({ children }) {
  return <p style={{ margin:'0 0 14px', fontSize:12, color:'#8590A2', lineHeight:1.4 }}>{children}</p>;
}

function StatusBadge({ status }) {
  const map = {
    ONGOING:  { bg:'#E3FCEF', text:'#006644', border:'#ABF5D1' },
    PENDING:  { bg:'#FFF7D6', text:'#7A5200', border:'#FFD84D' },
    COMPLETED:{ bg:'#F1F2F4', text:'#44546F', border:'#C1C7D0' },
    ARCHIVED: { bg:'#F1F2F4', text:'#44546F', border:'#C1C7D0' },
  };
  const c = map[status] || map.PENDING;
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', padding:'1px 7px',
      border:`1px solid ${c.border}`, borderRadius:3, backgroundColor:c.bg,
      fontSize:11, fontWeight:700, color:c.text,
      textTransform:'uppercase', letterSpacing:'0.04em',
    }}>{status}</span>
  );
}

function CategoryBadge({ label, color }) {
  return (
    <span style={{
      display:'inline-flex', alignItems:'center', padding:'2px 10px',
      backgroundColor:color, borderRadius:999,
      fontSize:10, fontWeight:500, color:'#fff', whiteSpace:'nowrap',
    }}>{label}</span>
  );
}

function PinIcon() {
  return (
    <svg width="11" height="13" viewBox="0 0 12 14" fill="none" style={{ flexShrink:0 }}>
      <path d="M6 0a4.5 4.5 0 0 1 4.5 4.5C10.5 7.5 6 13 6 13S1.5 7.5 1.5 4.5A4.5 4.5 0 0 1 6 0Z" fill="#626F86"/>
      <circle cx="6" cy="4.5" r="1.5" fill="#fff"/>
    </svg>
  );
}

function CalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <rect x="1" y="1.5" width="10" height="9.5" rx="1" stroke="#44546F" strokeWidth="1.2"/>
      <path d="M4 1v2M8 1v2M1 4.5h10" stroke="#44546F" strokeWidth="1.2" strokeLinecap="round"/>
    </svg>
  );
}

function WarningIcon({ color='#FF991F', size=15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" style={{ flexShrink:0 }}>
      <path d="M8 2L14.5 13.5H1.5L8 2Z" fill={color}/>
      <path d="M8 6v3.5M8 11v.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" style={{ flexShrink:0 }}>
      <path d="M2.5 9.5L9.5 2.5M9.5 2.5H5.5M9.5 2.5V6.5" stroke="#44546F" strokeWidth="1.4" strokeLinecap="round"/>
    </svg>
  );
}

function UserAvatar({ initials }) {
  const cols = { JD:'#5137a2',SM:'#1561cc',KL:'#1a7f37',AL:'#d63c8a' };
  return (
    <div style={{
      width:28, height:28, borderRadius:'50%',
      backgroundColor:cols[initials]||'#626F86', color:'#fff',
      display:'flex', alignItems:'center', justifyContent:'center',
      fontSize:11, fontWeight:600, flexShrink:0,
    }}>{initials}</div>
  );
}

function InventoryIcon({ status }) {
  const color = status==='available'?'#1a7f37':status==='in-use'?'#1565c0':'#c62828';
  return (
    <div style={{
      width:28, height:28, borderRadius:'50%',
      backgroundColor:color+'18',
      display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0,
    }}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="4" width="12" height="9" rx="1.5" stroke={color} strokeWidth="1.3"/>
        <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke={color} strokeWidth="1.3"/>
        <path d="M6 8.5h4" stroke={color} strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    </div>
  );
}

// ─── Mission Card ─────────────────────────────────────────────────────────────

function MissionCard({ mission, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={() => onClick(mission)}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        border:`1px solid ${hov?'#b7b9be':'#d9d9d9'}`, borderRadius:4,
        padding:'12px 14px', cursor:'pointer',
        backgroundColor:hov?'#FAFBFC':'#fff', transition:'all 0.15s',
      }}
    >
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:6 }}>
        <span style={{ fontSize:14, fontWeight:500, color:'#172B4D', lineHeight:'20px', paddingRight:8 }}>
          {mission.name}
        </span>
        <CategoryBadge label={mission.specialty||'General'} color={SPECIALTY_COLORS[mission.specialty]||'#626F86'}/>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:6, marginBottom:5 }}>
        <StatusBadge status={mission.status}/>
        <span style={{ display:'flex', alignItems:'center', gap:4, fontSize:12, color:'#44546F' }}>
          <CalIcon/>{mission.dates||'TBD'}
        </span>
      </div>
      <div style={{ display:'flex', alignItems:'center', gap:5 }}>
        <PinIcon/>
        <span style={{ fontSize:12, color:'#626F86' }}>{mission.location||'Location TBD'}</span>
      </div>
    </div>
  );
}

// ─── Calendar ─────────────────────────────────────────────────────────────────

function buildEvents(missions, year, month) {
  const events = {};
  missions.forEach(m => {
    if (!m.dates) return;
    const color = SPECIALTY_COLORS[m.specialty] || '#626F86';
    const match = m.dates.match(/(\w{3})\s+(\d+)\s*[-–]\s*(\w{3})\s+(\d+),?\s*(\d{4})/);
    if (!match) return;
    const [, sM, sD, eM, eD, yr] = match;
    const start = new Date(parseInt(yr), MONTH_MAP[sM]??0, parseInt(sD));
    const end   = new Date(parseInt(yr), MONTH_MAP[eM]??0, parseInt(eD));
    for (let d = new Date(start); d <= end; d.setDate(d.getDate()+1)) {
      if (d.getFullYear()===year && d.getMonth()===month) {
        const day = d.getDate();
        if (!events[day]) events[day] = [];
        if (!events[day].includes(color)) events[day].push(color);
      }
    }
  });
  return events;
}

function CalendarWidget({ missions, onDayClick }) {
  const now = new Date();
  const year = now.getFullYear(), month = now.getMonth(), todayDay = now.getDate();
  const monthName = now.toLocaleString('default', { month:'long' });

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month+1, 0).getDate();
  const allDays = [...Array(firstDay).fill(null)];
  for (let d=1; d<=daysInMonth; d++) allDays.push(d);
  while (allDays.length%7) allDays.push(null);
  const weeks = [];
  for (let i=0; i<allDays.length; i+=7) weeks.push(allDays.slice(i,i+7));

  const events = buildEvents(missions, year, month);
  const monthMissions = missions.filter(m => m.dates && m.dates.includes(monthName.slice(0,3)));

  return (
    <div>
      <span style={{ fontSize:15, fontWeight:600, color:'#000', display:'block', marginBottom:4 }}>
        {monthName} {year}
      </span>
      <SectionSubtitle>Mission dates this month. Click a highlighted date to see active missions.</SectionSubtitle>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', textAlign:'center', marginBottom:4 }}>
        {['Su','Mo','Tu','We','Th','Fr','Sa'].map(d => (
          <span key={d} style={{ fontSize:10, fontWeight:700, color:'#626F86', padding:'3px 0' }}>{d}</span>
        ))}
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:'1px', backgroundColor:'#EBECF0', border:'1px solid #EBECF0', borderRadius:4, overflow:'hidden' }}>
        {weeks.flat().map((day, i) => {
          const isToday = day===todayDay;
          const dayEvents = day ? events[day] : null;
          const hasEvents = !!(dayEvents&&dayEvents.length);
          return (
            <div
              key={i}
              onClick={() => hasEvents && onDayClick(day)}
              style={{
                height:42,
                backgroundColor: day?(isToday?'#F4F5FF':'#fff'):'#FBFBFC',
                display:'flex', flexDirection:'column',
                alignItems:'center', justifyContent:'center',
                cursor: hasEvents?'pointer':'default',
                transition:'background-color 0.1s',
              }}
              onMouseEnter={e => { if(hasEvents&&day) e.currentTarget.style.backgroundColor='#F4F5F7'; }}
              onMouseLeave={e => { if(day) e.currentTarget.style.backgroundColor=isToday?'#F4F5FF':'#fff'; }}
            >
              {day && (
                <>
                  <span style={{
                    fontSize:12, marginBottom:dayEvents?2:0,
                    fontWeight:isToday?700:hasEvents?600:400,
                    color:isToday?'#422670':hasEvents?'#172B4D':'#8590A2',
                  }}>{day}</span>
                  {dayEvents && (
                    <div style={{ display:'flex', gap:2 }}>
                      {dayEvents.slice(0,3).map((c,ci) => (
                        <div key={ci} style={{ width:4, height:4, borderRadius:'50%', backgroundColor:c }}/>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          );
        })}
      </div>

      {monthMissions.length>0 && (
        <div style={{ marginTop:14, display:'flex', flexDirection:'column', gap:7 }}>
          {monthMissions.slice(0,3).map(m => (
            <div key={m.id} style={{ display:'flex', alignItems:'center', gap:8 }}>
              <div style={{ width:8, height:8, borderRadius:'50%', backgroundColor:SPECIALTY_COLORS[m.specialty]||'#626F86', flexShrink:0 }}/>
              <span style={{ fontSize:12, color:'#44546F', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{m.name}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Rows ─────────────────────────────────────────────────────────────────────

function AlertRow({ alert, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display:'flex', alignItems:'center', gap:8, padding:'9px 10px', borderRadius:4,
        backgroundColor:hov?'#FFF7EC':'transparent', cursor:'pointer',
        transition:'background-color 0.12s', borderBottom:'1px solid #f0f0f0',
      }}
    >
      <WarningIcon color={alert.severity==='danger'?'#c62828':'#FF991F'}/>
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, color:'#172B4D', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{alert.item}</div>
        <div style={{ fontSize:11, color:'#8590A2' }}>{alert.text} · expires {alert.date}</div>
      </div>
      <ArrowIcon/>
    </div>
  );
}

function ActivityFeedRow({ entry, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)} onMouseLeave={() => setHov(false)}
      style={{
        display:'flex', alignItems:'center', gap:10, padding:'8px 6px', borderRadius:4,
        backgroundColor:hov?'#F4F5F7':'transparent', cursor:'pointer',
        transition:'background-color 0.12s', borderBottom:'1px solid #f0f0f0',
      }}
    >
      {entry.feedType==='item' ? <InventoryIcon status={entry.status}/> : <UserAvatar initials={entry.initials}/>}
      <div style={{ flex:1, minWidth:0 }}>
        <div style={{ fontSize:13, color:'#172B4D', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>{entry.text}</div>
        {entry.feedType==='item' && (
          <div style={{ fontSize:11, color:'#8590A2', marginTop:1 }}>
            <span style={{ fontWeight:600, color:entry.status==='available'?'#1a7f37':entry.status==='in-use'?'#1565c0':'#c62828' }}>{entry.status}</span>
            {' · '}{entry.qty} units
          </div>
        )}
      </div>
      <span style={{ fontSize:11, color:'#8590A2', whiteSpace:'nowrap' }}>{entry.time}</span>
    </div>
  );
}

// ─── Widget Wrapper (drag & drop) ─────────────────────────────────────────────

function WidgetWrapper({ id, editMode, dragFrom, dragOver, onDragStart, onDragOver, onDrop, onDragEnd, children }) {
  const isBeingDragged = dragFrom===id;
  const isDropTarget   = dragOver===id && dragFrom!==id;
  return (
    <div
      draggable={editMode}
      onDragStart={() => onDragStart(id)}
      onDragOver={(e) => onDragOver(e, id)}
      onDrop={(e) => { e.preventDefault(); onDrop(id); }}
      onDragEnd={onDragEnd}
      style={{
        border: editMode
          ? `2px ${isDropTarget?'solid #422670':'dashed #c4b5e0'}`
          : '1px solid #e8e8e8',
        borderRadius:6, position:'relative',
        opacity:isBeingDragged?0.4:1,
        transition:'opacity 0.15s, border-color 0.15s, background-color 0.15s',
        cursor:editMode?'grab':'default',
        backgroundColor:isDropTarget?'#F8F6FF':'#fff',
        userSelect:editMode?'none':'auto',
        overflow:'hidden',
      }}
    >
      {editMode && (
        <div style={{
          position:'absolute', top:0, left:0, right:0, height:30, zIndex:10,
          display:'flex', alignItems:'center', justifyContent:'center', gap:6,
          backgroundColor:isDropTarget?'#EDE9FF':'#F3F0FF',
          borderBottom:'1px solid #c4b5e0',
          color:'#5E4DB2', fontSize:12, fontWeight:500, pointerEvents:'none',
        }}>
          <svg width="12" height="12" viewBox="0 0 12 12" fill="currentColor">
            <circle cx="3" cy="2.5" r="1.1"/><circle cx="9" cy="2.5" r="1.1"/>
            <circle cx="3" cy="6"   r="1.1"/><circle cx="9" cy="6"   r="1.1"/>
            <circle cx="3" cy="9.5" r="1.1"/><circle cx="9" cy="9.5" r="1.1"/>
          </svg>
          Drag to reorder
        </div>
      )}
      <div style={{ marginTop:editMode?30:0 }}>{children}</div>
    </div>
  );
}

// ─── Detail Panels ────────────────────────────────────────────────────────────

function DetailField({ label, value }) {
  return (
    <div style={{ marginBottom:16 }}>
      <p style={{ margin:'0 0 4px', fontSize:11, fontWeight:700, color:'#626F86', textTransform:'uppercase', letterSpacing:'0.06em' }}>{label}</p>
      <p style={{ margin:0, fontSize:14, color:'#172B4D' }}>{value}</p>
    </div>
  );
}

function MissionDetailPanel({ mission, navigate }) {
  if (!mission) return null;
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ padding:'12px 20px 12px 48px', borderBottom:'1px solid #E8E8E8', display:'flex', alignItems:'center', height:53, boxSizing:'border-box' }}>
        <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:'#172B4D' }}>{mission.name}</h2>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:24 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <StatusBadge status={mission.status}/>
          {mission.specialty && <CategoryBadge label={mission.specialty} color={SPECIALTY_COLORS[mission.specialty]||'#626F86'}/>}
        </div>
        <DetailField label="Location" value={mission.location||'—'}/>
        <DetailField label="Dates" value={mission.dates||'—'}/>
        <DetailField label="Doctor" value={mission.doctor_name||'—'}/>
        <DetailField label="Budget" value={mission.budget?`$${Number(mission.budget).toLocaleString()}`:'—'}/>
      </div>
      <div style={{ padding:'16px 24px', borderTop:'1px solid #E8E8E8', display:'flex', flexDirection:'column', gap:8 }}>
        <button onClick={() => navigate(`/missions/${mission.id}`)} style={{ width:'100%', height:40, backgroundColor:'#422670', color:'#fff', border:'none', borderRadius:4, fontSize:14, fontWeight:600, cursor:'pointer', fontFamily:'inherit' }}>
          Go to Mission Details
        </button>
        <button onClick={() => navigate('/missions')} style={{ width:'100%', height:40, backgroundColor:'transparent', color:'#44546F', border:'1px solid #DFE1E6', borderRadius:4, fontSize:14, fontWeight:500, cursor:'pointer', fontFamily:'inherit' }}>
          View All Missions
        </button>
      </div>
    </div>
  );
}

function ExpirationDetailPanel({ alert }) {
  if (!alert) return null;
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ padding:'12px 20px 12px 48px', borderBottom:'1px solid #E8E8E8', display:'flex', alignItems:'center', height:53, boxSizing:'border-box' }}>
        <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:'#172B4D' }}>Expiration Alert</h2>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:24 }}>
        <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
          <WarningIcon color="#FF991F"/>
          <p style={{ margin:0, fontSize:14, color:'#44546F' }}>This item is expiring soon and requires action.</p>
        </div>
        <DetailField label="Item" value={alert.item}/>
        <DetailField label="Quantity" value={alert.qty}/>
        <DetailField label="Location" value={alert.location}/>
        <DetailField label="Expiration Date" value={alert.date}/>
        <div style={{ marginTop:8, padding:14, backgroundColor:'#FFF7EC', borderRadius:6, border:'1px solid #FFD580' }}>
          <p style={{ margin:0, fontSize:13, color:'#974F0C' }}>
            Action needed: Dispose of or redistribute these items before the expiration date.
          </p>
        </div>
      </div>
    </div>
  );
}

function ActivityDetailPanel({ entry }) {
  if (!entry) return null;
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ padding:'12px 20px 12px 48px', borderBottom:'1px solid #E8E8E8', display:'flex', alignItems:'center', height:53, boxSizing:'border-box' }}>
        <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:'#172B4D' }}>
          {entry.feedType==='item'?'Inventory Update':'Activity Detail'}
        </h2>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:24 }}>
        {entry.feedType==='item' ? (
          <>
            <DetailField label="Item"     value={entry.text}/>
            <DetailField label="Status"   value={entry.status}/>
            <DetailField label="Quantity" value={`${entry.qty} units`}/>
            <DetailField label="Updated"  value={entry.time}/>
          </>
        ) : (
          <>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:20 }}>
              <UserAvatar initials={entry.initials}/>
              <span style={{ fontSize:13, color:'#44546F' }}>{entry.time}</span>
            </div>
            <DetailField label="Action" value={entry.text}/>
            <DetailField label="Time"   value={entry.time}/>
          </>
        )}
      </div>
    </div>
  );
}

function CalendarDayPanel({ data, navigate }) {
  if (!data) return null;
  const { day, missions } = data;
  const now = new Date();
  const label = `${now.toLocaleString('default',{month:'long'})} ${day}`;
  return (
    <div style={{ display:'flex', flexDirection:'column', height:'100%' }}>
      <div style={{ padding:'12px 20px 12px 48px', borderBottom:'1px solid #E8E8E8', height:53, boxSizing:'border-box', display:'flex', alignItems:'center' }}>
        <h2 style={{ margin:0, fontSize:18, fontWeight:700, color:'#172B4D' }}>{label}</h2>
      </div>
      <div style={{ flex:1, overflowY:'auto', padding:24 }}>
        {missions.length===0 ? (
          <p style={{ color:'#626F86', fontSize:14 }}>No missions active on this date.</p>
        ) : (
          <>
            <p style={{ margin:'0 0 16px', fontSize:13, color:'#626F86' }}>
              {missions.length} mission{missions.length!==1?'s':''} active on this date
            </p>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
              {missions.map(m => (
                <div
                  key={m.id}
                  onClick={() => navigate(`/missions/${m.id}`)}
                  onMouseEnter={e => e.currentTarget.style.borderColor='#b7b9be'}
                  onMouseLeave={e => e.currentTarget.style.borderColor='#e8e8e8'}
                  style={{ border:'1px solid #e8e8e8', borderRadius:6, padding:14, cursor:'pointer', transition:'border-color 0.12s' }}
                >
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                    <span style={{ fontWeight:600, fontSize:14, color:'#172B4D' }}>{m.name}</span>
                    <CategoryBadge label={m.specialty||'General'} color={SPECIALTY_COLORS[m.specialty]||'#626F86'}/>
                  </div>
                  <div style={{ fontSize:12, color:'#626F86', marginBottom:6 }}>{m.dates} · {m.location}</div>
                  <StatusBadge status={m.status}/>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function DashboardPage({ user, onSwitchAccount, onLogout }) {
  const navigate = useNavigate();
  const [panel, setPanel]           = useState({ type:null, data:null });
  const [mobileMenuOpen, setMobile] = useState(false);
  const [missionTab, setMissionTab] = useState('ongoing');
  const [editMode, setEditMode]     = useState(false);
  const [widgetOrder, setWidgetOrder] = useState(() => {
    try {
      const s = localStorage.getItem('mk_dashboard_order');
      if (s) {
        const p = JSON.parse(s);
        if (Array.isArray(p) && p.length===4 && DEFAULT_ORDER.every(id=>p.includes(id))) return p;
      }
    } catch {}
    return DEFAULT_ORDER;
  });
  const [dragFrom, setDragFrom] = useState(null);
  const [dragOver, setDragOver] = useState(null);

  const [ongoingMissions,  setOngoing]      = useState([]);
  const [upcomingMissions, setUpcoming]     = useState([]);
  const [hasMoreOngoing,   setHasMoreOn]    = useState(false);
  const [hasMoreUpcoming,  setHasMoreUp]    = useState(false);
  const [alerts,    setAlerts]    = useState([]);
  const [feedItems, setFeedItems] = useState([]);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => { fetchDashboardData(); }, []);

  const fmt = (dateStr) => {
    const d = new Date(dateStr), diff = Date.now()-d.getTime();
    if (diff<3600000)  return `${Math.floor(diff/60000)}m ago`;
    if (diff<86400000) return `${Math.floor(diff/3600000)}h ago`;
    return d.toLocaleDateString();
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate()+90);
      const cutoffDate = cutoff.toISOString().split('T')[0];

      const [ongoingRes,upcomingRes,alertsRes,logRes,shipmentsRes] = await Promise.all([
        supabase.from('missions').select('*').eq('status','ONGOING').order('created_at',{ascending:false}).limit(5),
        supabase.from('missions').select('*').eq('status','PENDING').order('created_at',{ascending:false}).limit(5),
        supabase.from('shipments').select('*,inventory(description)').not('expiration_date','is',null).lt('expiration_date',cutoffDate).order('expiration_date',{ascending:true}).limit(5),
        supabase.from('activity_log').select('*,profiles(name,initials)').order('created_at',{ascending:false}).limit(5),
        supabase.from('shipments').select('*,inventory(description)').order('created_at',{ascending:false}).limit(5),
      ]);

      const on = ongoingRes.data||[], up = upcomingRes.data||[];
      setOngoing(on.slice(0,4));  setHasMoreOn(on.length>4);
      setUpcoming(up.slice(0,4)); setHasMoreUp(up.length>4);

      setAlerts((alertsRes.data||[]).map(a => ({
        id:a.id, text:`${a.quantity} units expiring soon`,
        date:new Date(a.expiration_date).toLocaleDateString(),
        item:a.inventory?.description||'Unknown Item',
        qty:a.quantity, location:a.location||'Primary Storage',
        severity: new Date(a.expiration_date)<new Date()?'danger':'warning',
      })));

      const logEntries = (logRes.data||[]).map(l => ({
        id:'log-'+l.id, feedType:'activity', text:l.action_text,
        time:fmt(l.created_at), initials:l.profiles?.initials||'??',
        _ts:new Date(l.created_at).getTime(),
      }));
      const invEntries = (shipmentsRes.data||[]).map(s => ({
        id:'ship-'+s.id, feedType:'item',
        text:s.inventory?.description||'Inventory item',
        qty:s.quantity, status:s.status, time:fmt(s.created_at),
        _ts:new Date(s.created_at).getTime(),
      }));
      setFeedItems([...logEntries,...invEntries].sort((a,b)=>b._ts-a._ts).slice(0,8));
    } catch(err) {
      console.error('[Dashboard]',err);
    } finally {
      setLoading(false);
    }
  };

  const getMissionsForDay = (day) => {
    const now = new Date();
    const check = new Date(now.getFullYear(), now.getMonth(), day);
    return [...ongoingMissions,...upcomingMissions].filter(m => {
      if (!m.dates) return false;
      const match = m.dates.match(/(\w{3})\s+(\d+)\s*[-–]\s*(\w{3})\s+(\d+),?\s*(\d{4})/);
      if (!match) return false;
      const [,sM,sD,eM,eD,yr] = match;
      const start = new Date(parseInt(yr), MONTH_MAP[sM]??0, parseInt(sD));
      const end   = new Date(parseInt(yr), MONTH_MAP[eM]??0, parseInt(eD));
      return check>=start && check<=end;
    });
  };

  // Drag handlers
  const handleDragStart = (id) => setDragFrom(id);
  const handleDragOver  = (e,id) => { e.preventDefault(); setDragOver(id); };
  const handleDrop = (id) => {
    if (!dragFrom||dragFrom===id) { setDragFrom(null); setDragOver(null); return; }
    const next = [...widgetOrder];
    const fi = next.indexOf(dragFrom), ti = next.indexOf(id);
    next.splice(fi,1); next.splice(ti,0,dragFrom);
    setWidgetOrder(next);
    localStorage.setItem('mk_dashboard_order', JSON.stringify(next));
    setDragFrom(null); setDragOver(null);
  };
  const handleDragEnd = () => { setDragFrom(null); setDragOver(null); };

  const openPanel  = (type,data) => setPanel({type,data});
  const closePanel = () => setPanel({type:null,data:null});

  const allMissions = [...ongoingMissions,...upcomingMissions];
  const displayed   = missionTab==='ongoing' ? ongoingMissions : upcomingMissions;
  const hasMore     = missionTab==='ongoing' ? hasMoreOngoing  : hasMoreUpcoming;

  const dragProps = { editMode, dragFrom, dragOver, onDragStart:handleDragStart, onDragOver:handleDragOver, onDrop:handleDrop, onDragEnd:handleDragEnd };

  // ─── Widget content map ───────────────────────────────────────────────────

  const WIDGETS = {
    missions: (
      <div style={{ padding:'20px 20px 16px' }}>
        <SectionHeader
          title="Missions"
          tooltip="Shows ongoing and upcoming missions. Toggle between tabs. Click a card to open the mission's detail page."
        />
        {/* Ongoing / Upcoming toggle */}
        <div style={{ display:'flex', borderBottom:'1px solid #e8e8e8', marginBottom:14 }}>
          {[['ongoing','Ongoing'],['upcoming','Upcoming']].map(([key,label]) => {
            const count = (key==='ongoing'?ongoingMissions:upcomingMissions).length;
            const more  = (key==='ongoing'?hasMoreOngoing:hasMoreUpcoming);
            return (
              <button key={key} onClick={() => setMissionTab(key)} style={{
                padding:'6px 14px', border:'none', background:'transparent',
                fontSize:13, cursor:'pointer', fontFamily:'inherit',
                color:missionTab===key?'#172B4D':'#626F86',
                fontWeight:missionTab===key?600:400,
                borderBottom:missionTab===key?'2px solid #172B4D':'2px solid transparent',
                marginBottom:-1, display:'flex', alignItems:'center', gap:6,
              }}>
                {label}
                <span style={{
                  fontSize:11, padding:'1px 6px', borderRadius:10,
                  backgroundColor:missionTab===key?'#F3F0FF':'#F4F5F7',
                  color:missionTab===key?'#422670':'#626F86',
                }}>
                  {count}{more?'+':''}
                </span>
              </button>
            );
          })}
        </div>

        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
          {loading ? (
            <p style={{ gridColumn:'span 2', textAlign:'center', padding:16, color:'#626F86' }}>Loading…</p>
          ) : displayed.length===0 ? (
            <p style={{ gridColumn:'span 2', textAlign:'center', padding:16, color:'#626F86', fontSize:13 }}>
              No {missionTab} missions right now.
            </p>
          ) : displayed.map(m => (
            <MissionCard key={m.id} mission={m} onClick={m => navigate(`/missions/${m.id}`)}/>
          ))}
        </div>

        {hasMore && (
          <button onClick={() => navigate('/missions')} style={{
            marginTop:12, padding:'6px 12px', border:'1px solid #d9d9d9',
            borderRadius:4, background:'#fff', cursor:'pointer',
            fontSize:13, color:'#172B4D', fontFamily:'inherit',
          }}>
            View all on Missions page →
          </button>
        )}
      </div>
    ),

    alerts: (
      <div style={{ padding:'20px 20px 16px' }}>
        <SectionHeader
          title="Expiration Alerts"
          tooltip="Inventory items expiring within 90 days. Red = already expired. Click an item to see details and take action."
        />
        <SectionSubtitle>Supplies expiring soon — act before the date to avoid waste.</SectionSubtitle>
        {loading ? (
          <p style={{ textAlign:'center', padding:16, color:'#626F86' }}>Loading…</p>
        ) : alerts.length===0 ? (
          <p style={{ textAlign:'center', padding:16, color:'#1a7f37', fontSize:13 }}>✓ No items expiring in the next 90 days.</p>
        ) : alerts.map(a => (
          <AlertRow key={a.id} alert={a} onClick={() => openPanel('expiration',a)}/>
        ))}
      </div>
    ),

    calendar: (
      <div style={{ padding:'16px 20px' }}>
        <SectionHeader
          title="Mission Calendar"
          tooltip="Shows mission date ranges for this month. Dots = specialty color. Click a highlighted date to see which missions are active on that day."
        />
        <CalendarWidget missions={allMissions} onDayClick={day => openPanel('calendarDay',{day,missions:getMissionsForDay(day)})}/>
      </div>
    ),

    activity: (
      <div style={{ padding:'16px 20px' }}>
        <SectionHeader
          title="Activity Feed"
          tooltip="Combined log of team actions and inventory changes. Avatar = user action; box icon = inventory status update."
        />
        <SectionSubtitle>Recent team actions and inventory updates across the system.</SectionSubtitle>
        {loading ? (
          <p style={{ textAlign:'center', padding:10, color:'#626F86' }}>Loading…</p>
        ) : feedItems.length===0 ? (
          <p style={{ textAlign:'center', padding:10, color:'#626F86' }}>No recent activity found.</p>
        ) : feedItems.map(e => (
          <ActivityFeedRow key={e.id} entry={e} onClick={() => openPanel('activity',e)}/>
        ))}
        <button onClick={() => navigate('/inventory')} style={{
          marginTop:12, padding:'6px 14px', border:'1px solid #d9d9d9',
          borderRadius:4, background:'#fff', cursor:'pointer',
          fontSize:13, color:'#172B4D', fontFamily:'inherit',
        }}>
          View All Inventory
        </button>
      </div>
    ),
  };

  return (
    <PageLayout>
      <TopNavigation isFixed>
        <TopNav user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} onToggleMobileMenu={() => setMobile(m=>!m)}/>
      </TopNavigation>
      <Content>
        <LeftSidebar width={mobileMenuOpen?'100vw':240}>
          <div className={mobileMenuOpen?'':'sidebar-collapsed'} style={{ height:'calc(100vh - 56px)' }}>
            <SideNav active="dashboard" user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} isMobile={mobileMenuOpen} onCloseMobile={() => setMobile(false)}/>
          </div>
        </LeftSidebar>
        <Main>
          <div className="main-content">

            {/* Header */}
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:editMode?8:24 }}>
              <h1 style={{ margin:0, fontSize:24, fontWeight:600, color:'#172B4D' }}>Dashboard</h1>
              <div style={{ display:'flex', gap:8 }}>
                <button
                  onClick={() => setEditMode(e=>!e)}
                  style={{
                    height:32, padding:'0 16px',
                    backgroundColor:editMode?'#422670':'#fff',
                    color:editMode?'#fff':'#44546F',
                    border:editMode?'none':'1px solid #d9d9d9',
                    borderRadius:4, fontSize:14, fontWeight:500,
                    cursor:'pointer', fontFamily:'inherit',
                  }}
                >
                  {editMode ? '✓  Done' : '⊞  Edit Layout'}
                </button>
                {!editMode && (
                  <button onClick={() => navigate('/inventory')} style={{
                    height:32, padding:'0 16px', backgroundColor:'#422670', color:'#fff',
                    border:'none', borderRadius:4, fontSize:14, fontWeight:500,
                    cursor:'pointer', fontFamily:'inherit',
                  }}>
                    Go to Inventory
                  </button>
                )}
              </div>
            </div>

            {/* Edit mode banner */}
            {editMode && (
              <div style={{
                marginBottom:16, padding:'10px 16px',
                backgroundColor:'#F3F0FF', border:'1px solid #c4b5e0',
                borderRadius:6, fontSize:13, color:'#5E4DB2',
                display:'flex', alignItems:'center', gap:8,
              }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                  <path d="M11 2.5L13.5 5L6 12.5H3.5V10L11 2.5Z" stroke="#5E4DB2" strokeWidth="1.4" strokeLinejoin="round"/>
                </svg>
                Drag widgets to rearrange your dashboard. Click <strong style={{ marginLeft:3 }}>Done</strong> when finished — your layout is saved automatically.
              </div>
            )}

            {/* 2×2 draggable grid */}
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
              {widgetOrder.map(id => (
                <WidgetWrapper key={id} id={id} {...dragProps}>
                  {WIDGETS[id]}
                </WidgetWrapper>
              ))}
            </div>

          </div>
        </Main>
      </Content>

      <SlidePanel isOpen={panel.type!==null} onClose={closePanel} width={420}>
        {panel.type==='mission'     && <MissionDetailPanel   mission={panel.data}  navigate={navigate}/>}
        {panel.type==='expiration'  && <ExpirationDetailPanel alert={panel.data}/>}
        {panel.type==='activity'    && <ActivityDetailPanel  entry={panel.data}/>}
        {panel.type==='calendarDay' && <CalendarDayPanel     data={panel.data}     navigate={navigate}/>}
      </SlidePanel>
    </PageLayout>
  );
}
