import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import {
  PageLayout, Content, Main, LeftSidebar, TopNavigation,
} from '@atlaskit/page-layout';
import TopNav from './TopNav';
import SideNav from './SideNav';
import SlidePanel from './SlidePanel';

// ─── Constants ─────────────────────────────────────────────────────────────
const SPECIALTY_COLORS = {
  'Plastics': '#6d28d9',
  'Ortho':    '#0e7490',
  'Cardiac':  '#1561cc',
  'General':  '#cf4f27',
};

const MISSIONS = [
  { id: 1, name: 'Benin Cleft Lip & Palate', specialty: 'Plastics', status: 'ONGOING', location: 'Cotonou, Benin', dates: 'Apr 12 - Apr 25, 2026', category: 'Surgical', categoryColor: '#6d28d9', coordinator: 'Sarah Jenkins', volunteers: 12, items: 45, date: '2026-04-12', action: 'Submit equipment list' },
  { id: 2, name: 'Guatemala Orthopedic 2026', specialty: 'Ortho', status: 'PENDING', location: 'Guatemala City', dates: 'May 05 - May 18, 2026', category: 'Orthopedic', categoryColor: '#0e7490', coordinator: 'Mike Thompson', volunteers: 8, items: 32, date: '2026-05-05', action: 'Finalize volunteer list' },
  { id: 3, name: 'Tanzania Cardiac Relief', specialty: 'Cardiac', status: 'ONGOING', location: 'Dar es Salaam', dates: 'Apr 01 - Apr 15, 2026', category: 'Cardiac', categoryColor: '#1561cc', coordinator: 'Elena Rodriguez', volunteers: 15, items: 68, date: '2026-04-01', action: 'Review patient files' },
  { id: 4, name: 'Panama General Surgery', specialty: 'General', status: 'PENDING', location: 'Panama City', dates: 'Jun 10 - Jun 22, 2026', category: 'General', categoryColor: '#cf4f27', coordinator: 'David Chen', volunteers: 10, items: 25, date: '2026-06-10', action: 'Order supplies' },
];

const CALENDAR = {
  month: 'April 2026',
  days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 9,
  weeks: [
    [null, null, null, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25],
    [26, 27, 28, 29, 30, null, null],
  ],
  events: {
    1: ['#1561cc'],
    5: ['#1561cc'],
    9: ['#1561cc', '#d63c8a'],
    12: ['#6d28d9'],
    15: ['#1561cc'],
    20: ['#6d28d9'],
  }
};

// ─── Sub-components ────────────────────────────────────────────────────────

function StatusBadge({ status }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '1px 6px',
      border: '1px solid #8590A2',
      borderRadius: 3,
      fontSize: 11, fontWeight: 700, color: '#44546F',
      textTransform: 'uppercase', letterSpacing: '0.04em',
    }}>
      {status}
    </span>
  );
}

function CategoryBadge({ label, color }) {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '2px 10px',
      backgroundColor: color, borderRadius: 999,
      fontSize: 10, fontWeight: 500, color: '#fff',
      whiteSpace: 'nowrap',
    }}>
      {label}
    </span>
  );
}

function MissionCard({ mission, onClick }) {
  const [hovered, setHovered] = useState(false);
  return (
    <div
      onClick={() => onClick(mission)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        border: `1px solid ${hovered ? '#b7b9be' : '#d9d9d9'}`,
        borderRadius: 4, padding: '12px 14px',
        cursor: 'pointer',
        backgroundColor: hovered ? '#FAFBFC' : '#fff',
        transition: 'all 0.15s',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <span style={{ fontSize: 16, fontWeight: 400, color: '#000', lineHeight: '20px' }}>
          {mission.name}
        </span>
        <CategoryBadge label={mission.specialty || 'General'} color={SPECIALTY_COLORS[mission.specialty] || '#626F86'} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
        <StatusBadge status={mission.status} />
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#000' }}>
          <CalIconSvg />
          {mission.dates || 'TBD'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <WarningIcon color="#FF991F" size={12} />
        <span style={{ fontSize: 12, color: '#000', textDecoration: 'underline', textDecorationColor: '#aaa' }}>
          Location: {mission.location || 'Unknown'}
        </span>
        <ArrowIcon />
      </div>
    </div>
  );
}

function Pagination({ current, total, compact }) {
  const pages = compact
    ? [1, 2, 3, '...', 8, 9, 10]
    : [1, 2, 3];

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, paddingTop: 12 }}>
      <PageBtn label="‹" />
      {pages.map((p, i) =>
        p === '...'
          ? <span key={i} style={{ padding: '0 4px', fontSize: 13, color: '#44546F' }}>…</span>
          : <PageBtn key={`${p}-${i}`} label={String(p)} active={p === current} />
      )}
      <PageBtn label="›" />
    </div>
  );
}

function PageBtn({ label, active }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        minWidth: 28, height: 28, padding: '0 6px',
        border: active ? '1px solid #5137a2' : '1px solid transparent',
        borderRadius: 3, fontSize: 13,
        background: active ? '#eeeeff' : hov ? '#f4f5f7' : 'transparent',
        color: active ? '#5137a2' : '#44546F',
        cursor: 'pointer', fontWeight: active ? 600 : 400,
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}

function WarningIcon({ color = '#FF991F', size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M8 2L14.5 13.5H1.5L8 2Z" fill={color} />
      <path d="M8 6v3.5M8 11v.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true" style={{ flexShrink: 0 }}>
      <path d="M2.5 9.5L9.5 2.5M9.5 2.5H5.5M9.5 2.5V6.5" stroke="#44546F" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

function CalIconSvg() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect x="1" y="1.5" width="10" height="9.5" rx="1" stroke="#44546F" strokeWidth="1.2" />
      <path d="M4 1v2M8 1v2M1 4.5h10" stroke="#44546F" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function UserAvatar({ initials }) {
  const colors = { JD: '#5137a2', SM: '#1561cc', KL: '#1a7f37', AL: '#d63c8a' };
  const bg = colors[initials] || '#626F86';
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      backgroundColor: bg, color: '#fff',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: 11, fontWeight: 600, flexShrink: 0,
    }}>
      {initials}
    </div>
  );
}

function NavBtn({ label }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        width: 24, height: 24, border: 'none', borderRadius: 3,
        background: hov ? '#F4F5F7' : 'transparent',
        cursor: 'pointer', fontSize: 14, color: '#44546F',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontFamily: 'inherit',
      }}
    >
      {label}
    </button>
  );
}

function CalendarDay({ day, events, isToday }) {
  const [hov, setHov] = useState(false);
  if (!day) return <div style={{ height: 36 }} />;
  const hasEvents = events && events.length > 0;
  return (
    <div
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        height: 36, display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        borderRadius: 3, cursor: 'pointer', position: 'relative',
        backgroundColor: isToday ? '#EAE6FF' : hov ? '#F4F5F7' : 'transparent',
      }}
    >
      <span style={{
        fontSize: 13, lineHeight: '18px',
        color: isToday ? '#5137a2' : '#172B4D',
        fontWeight: isToday ? 700 : 400,
        textDecoration: hasEvents && !isToday ? 'underline' : 'none',
        textDecorationColor: hasEvents ? events[0] : 'transparent',
        textUnderlineOffset: 2,
      }}>
        {day}
      </span>
      {hasEvents && events.length > 1 && (
        <div style={{ display: 'flex', gap: 2, position: 'absolute', bottom: 2 }}>
          {events.slice(0, 3).map((c, i) => (
            <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: c }} />
          ))}
        </div>
      )}
    </div>
  );
}

function CalendarWidget({ onOpenPanel }) {
  const [hoveredDay, setHoveredDay] = useState(null);
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>{CALENDAR.month}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <NavBtn label="‹" />
          <NavBtn label="›" />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: 8 }}>
        {CALENDAR.days.map((d) => (
          <span key={d} style={{ fontSize: 11, fontWeight: 700, color: '#626F86', padding: '4px 0', textTransform: 'uppercase' }}>{d}</span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#EBECF0', border: '1px solid #EBECF0', borderRadius: 4, overflow: 'hidden' }}>
        {CALENDAR.weeks.map((week, wi) => (
          week.map((day, di) => {
            const isToday = day === CALENDAR.today;
            const events = day ? CALENDAR.events[day] : null;
            return (
              <div
                key={`${wi}-${di}`}
                onClick={() => {
                  if (day && CALENDAR.events[day]) {
                    // Find a mission matching the category or just show a default one for prototype
                    const mission = MISSIONS[wi % MISSIONS.length];
                    onOpenPanel('mission', mission);
                  }
                }}
                onMouseEnter={() => setHoveredDay(day)}
                onMouseLeave={() => setHoveredDay(null)}
                style={{
                  height: 48,
                  backgroundColor: day ? (isToday ? '#F4F5FF' : '#fff') : '#FBFBFC',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  cursor: day ? 'pointer' : 'default',
                }}
              >
                {day && (
                  <>
                    <span style={{
                      fontSize: 13,
                      fontWeight: isToday ? 700 : 400,
                      color: isToday ? '#422670' : '#172B4D',
                      marginBottom: 4,
                    }}>
                      {day}
                    </span>
                    {events && (
                      <div style={{ display: 'flex', gap: 2 }}>
                        {events.map((c, i) => (
                          <div key={i} style={{ width: 4, height: 4, borderRadius: '50%', backgroundColor: c }} />
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>
            );
          })
        ))}
      </div>
      
      <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1561cc' }} />
          <span style={{ fontSize: 12, color: '#44546F' }}>Cardiac Mission Briefing</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#d63c8a' }} />
          <span style={{ fontSize: 12, color: '#44546F' }}>Infections Supplies Audit</span>
        </div>
      </div>
    </div>
  );
}

// ─── Detail Panel Contents ─────────────────────────────────────────────────

function DetailField({ label, value }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <p style={{ margin: '0 0 4px', fontSize: 11, fontWeight: 700, color: '#626F86', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
      <p style={{ margin: 0, fontSize: 14, color: '#172B4D' }}>{value}</p>
    </div>
  );
}

function MissionDetailPanel({ mission }) {
  const navigate = useNavigate();
  if (!mission) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 20px 12px 48px', borderBottom: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', height: 53, boxSizing: 'border-box' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#172B4D' }}>{mission.name}</h2>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <StatusBadge status={mission.status} />
          <CategoryBadge label={mission.category} color={mission.categoryColor} />
        </div>
        <DetailField label="Location" value={mission.location} />
        <DetailField label="Coordinator" value={mission.coordinator} />
        <DetailField label="Volunteers" value={mission.volunteers} />
        <DetailField label="Items Required" value={mission.items} />
        <DetailField label="Date" value={mission.date} />
        <DetailField label="Pending Action" value={mission.action} />
      </div>
      <div style={{ padding: '16px 24px', borderTop: '1px solid #E8E8E8', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={() => navigate(`/missions/${mission.id}`)}
          style={{
            width: '100%', height: 40, backgroundColor: '#422670', color: '#fff',
            border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit'
          }}
        >
          Go to Mission Details
        </button>
        <button
          onClick={() => navigate('/missions')}
          style={{
            width: '100%', height: 40, backgroundColor: 'transparent', color: '#44546F',
            border: '1px solid #DFE1E6', borderRadius: 4, fontSize: 14, fontWeight: 500,
            cursor: 'pointer', fontFamily: 'inherit'
          }}
        >
          View All Missions
        </button>
      </div>
    </div>
  );
}

function ExpirationDetailPanel({ alert }) {
  if (!alert) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 20px 12px 48px', borderBottom: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', height: 53, boxSizing: 'border-box' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#172B4D' }}>Expiration Alert</h2>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <WarningIcon color="#FF991F" />
          <p style={{ margin: 0, fontSize: 14, color: '#44546F' }}>{alert.text} ({alert.date})</p>
        </div>
        <DetailField label="Item" value={alert.item} />
        <DetailField label="Quantity" value={alert.qty} />
        <DetailField label="Location" value={alert.location} />
        <DetailField label="Expiration Date" value={alert.date} />
        <div style={{ marginTop: 8, padding: 16, backgroundColor: '#FFF7EC', borderRadius: 6, border: '1px solid #FFD580' }}>
          <p style={{ margin: 0, fontSize: 13, color: '#974F0C' }}>
            Action needed: Dispose or redistribute these items before the expiration date.
          </p>
        </div>
      </div>
    </div>
  );
}

function ActivityDetailPanel({ activity }) {
  if (!activity) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 20px 12px 48px', borderBottom: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', height: 53, boxSizing: 'border-box' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#172B4D' }}>Activity Detail</h2>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
          <UserAvatar initials={activity.initials} />
          <span style={{ fontSize: 14, color: '#44546F' }}>{activity.time}</span>
        </div>
        <DetailField label="Action" value={activity.text} />
        <DetailField label="Time" value={activity.time} />
        <DetailField label="User" value={activity.initials} />
      </div>
    </div>
  );
}

function ItemStatusDetailPanel({ item }) {
  if (!item) return null;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 20px 12px 48px', borderBottom: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', height: 53, boxSizing: 'border-box' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#172B4D' }}>{item.name}</h2>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        <span style={{ fontSize: 13, fontWeight: 600, color: item.statusColor, display: 'block', marginBottom: 16 }}>{item.qty} {item.status}</span>
        <DetailField label="Item Name" value={item.name} />
        <DetailField label="Quantity" value={item.qty} />
        <DetailField label="Status" value={item.status} />
      </div>
    </div>
  );
}

// ─── Row Sub-components ────────────────────────────────────────────────────

function AlertRow({ alert, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '9px 10px',
        borderRadius: 4,
        backgroundColor: hov ? '#FFF7EC' : 'transparent',
        cursor: 'pointer',
        transition: 'background-color 0.12s',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <WarningIcon color={alert.severity === 'warning' ? '#FF991F' : '#FFBE33'} />
      <span style={{ flex: 1, fontSize: 13, color: '#000', lineHeight: '18px' }}>
        {alert.text} ({alert.date})
      </span>
      <ArrowIcon />
    </div>
  );
}

function ActivityRow({ activity, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 4px',
        borderRadius: 4,
        backgroundColor: hov ? '#F4F5F7' : 'transparent',
        cursor: 'pointer',
        transition: 'background-color 0.12s',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <UserAvatar initials={activity.initials} />
      <span style={{ flex: 1, fontSize: 13, color: '#000' }}>{activity.text}</span>
      <span style={{ fontSize: 11, color: '#8590A2', whiteSpace: 'nowrap' }}>{activity.time}</span>
    </div>
  );
}

function ItemStatusRow({ item, onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 4px',
        borderRadius: 4,
        backgroundColor: hov ? '#F4F5F7' : 'transparent',
        cursor: 'pointer',
        transition: 'background-color 0.12s',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      <span style={{ fontSize: 13, color: '#000' }}>{item.name}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: item.statusColor, whiteSpace: 'nowrap' }}>
        {item.qty} {item.status}
      </span>
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────

export default function DashboardPage({ user, onSwitchAccount, onLogout }) {
  const navigate = useNavigate();
  const [panel, setPanel] = useState({ type: null, data: null });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [missions, setMissions] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [activity, setActivity] = useState([]);
  const [updates, setUpdates] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    
    // 1. Fetch Latest 4 Missions (Ongoing/Pending)
    const { data: missionsData } = await supabase
      .from('missions')
      .select('*')
      .neq('status', 'COMPLETED')
      .order('created_at', { ascending: false })
      .limit(4);
    if (missionsData) setMissions(missionsData);

    // 2. Fetch Expiration Alerts (< 90 days)
    const ninetyDaysFromNow = new Date();
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
    const { data: alertsData } = await supabase
      .from('shipments')
      .select('*, inventory(description)')
      .lt('expiration_date', ninetyDaysFromNow.toISOString().split('T')[0])
      .order('expiration_date', { ascending: true })
      .limit(4);
    if (alertsData) {
      const mappedAlerts = alertsData.map(a => ({
        id: a.id,
        text: `${a.quantity} units expiring soon`,
        date: new Date(a.expiration_date).toLocaleDateString(),
        item: a.inventory?.description || 'Unknown',
        qty: a.quantity,
        location: a.location || 'Primary Storage',
        severity: new Date(a.expiration_date) < new Date() ? 'danger' : 'warning'
      }));
      setAlerts(mappedAlerts);
    }

    // 3. Fetch Recent Activity
    const { data: logData } = await supabase
      .from('activity_log')
      .select('*, profiles(name, initials)')
      .order('created_at', { ascending: false })
      .limit(5);
    if (logData) {
      const mappedLogs = logData.map(l => ({
        id: l.id,
        text: l.action_text,
        time: formatRelativeTime(l.created_at),
        initials: l.profiles?.initials || '??'
      }));
      setActivity(mappedLogs);
    }

    // 4. Fetch Item Status Updates (Recent shipments changes)
    const { data: shipmentsData } = await supabase
      .from('shipments')
      .select('*, inventory(description)')
      .order('created_at', { ascending: false })
      .limit(4);
    if (shipmentsData) {
      const mapped = shipmentsData.map(s => ({
        id: s.id,
        name: s.inventory?.description || 'Item',
        qty: s.quantity,
        status: s.status,
        statusColor: s.status === 'expired' ? '#c62828' : s.status === 'available' ? '#1a7f37' : '#1565c0'
      }));
      setUpdates(mapped);
    }

    setLoading(false);
  };

  const formatRelativeTime = (dateStr) => {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  const openPanel = (type, data) => setPanel({ type, data });
  const closePanel = () => setPanel({ type: null, data: null });

  return (
    <PageLayout>
      <TopNavigation isFixed>
        <TopNav user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} onToggleMobileMenu={() => setMobileMenuOpen(!mobileMenuOpen)} />
      </TopNavigation>

      <Content>
        <LeftSidebar width={mobileMenuOpen ? '100vw' : 240}>
          <div className={mobileMenuOpen ? "" : "sidebar-collapsed"} style={{ height: 'calc(100vh - 56px)' }}>
            <SideNav 
              active="dashboard" 
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
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#172B4D' }}>
                Dashboard
              </h1>
              <button 
                onClick={() => navigate('/inventory')}
                style={{ height: 32, padding: '0 16px', backgroundColor: '#422670', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}>
                Go to Inventory
              </button>
            </div>

            {/* Top row: Missions + Expiration Alerts */}
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 0.65fr', gap: 16, marginBottom: 16 }}>

              <div style={{ border: '1px solid #e8e8e8', borderRadius: 6, padding: '20px 20px 16px' }}>
                <h2 style={{ margin: '0 0 16px', fontSize: 15, fontWeight: 600, color: '#000' }}>Missions</h2>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {missions.length === 0 ? (
                    <p style={{ gridColumn: 'span 2', textAlign: 'center', padding: 20, color: '#626F86' }}>No active missions found.</p>
                  ) : missions.map((m) => (
                    <MissionCard key={m.id} mission={m} onClick={(mission) => navigate(`/missions/${mission.id}`)} />
                  ))}
                </div>
                <Pagination current={1} total={10} compact />
              </div>

              <div style={{ border: '1px solid #e8e8e8', borderRadius: 6, padding: '20px 20px 16px' }}>
                <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#000' }}>Expiration Alerts</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                  {alerts.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: 20, color: '#626F86' }}>No upcoming expirations found.</p>
                  ) : alerts.map((alert) => (
                    <AlertRow key={alert.id} alert={alert} onClick={() => openPanel('expiration', alert)} />
                  ))}
                </div>
                <Pagination current={1} total={3} compact={false} />
              </div>
            </div>

            {/* Bottom row: Calendar + Recent Activity + Item Status Updates */}
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>

              <div style={{ border: '1px solid #e8e8e8', borderRadius: 6, padding: '16px 20px' }}>
                <CalendarWidget onOpenPanel={openPanel} />
              </div>

              <div style={{ border: '1px solid #e8e8e8', borderRadius: 6, padding: '16px 20px' }}>
                <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#000' }}>Recent Activity</h2>
                <div>
                  {activity.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: 10, color: '#626F86' }}>No recent activity found.</p>
                  ) : activity.map((a) => (
                    <ActivityRow key={a.id} activity={a} onClick={() => openPanel('activity', a)} />
                  ))}
                </div>
                <button style={{
                  marginTop: 12, padding: '6px 14px',
                  border: '1px solid #d9d9d9', borderRadius: 4,
                  background: '#fff', cursor: 'pointer',
                  fontSize: 13, color: '#172B4D', fontFamily: 'inherit',
                }}>
                  View All
                </button>
              </div>

              <div style={{ border: '1px solid #e8e8e8', borderRadius: 6, padding: '16px 20px' }}>
                <h2 style={{ margin: '0 0 12px', fontSize: 15, fontWeight: 600, color: '#000' }}>Item Status Updates</h2>
                <div>
                  {updates.length === 0 ? (
                    <p style={{ textAlign: 'center', padding: 10, color: '#626F86' }}>No recent item updates found.</p>
                  ) : updates.map((item) => (
                    <ItemStatusRow key={item.id} item={item} onClick={() => openPanel('itemStatus', item)} />
                  ))}
                </div>
                <button style={{
                  marginTop: 12, padding: '6px 14px',
                  border: '1px solid #d9d9d9', borderRadius: 4,
                  background: '#fff', cursor: 'pointer',
                  fontSize: 13, color: '#172B4D', fontFamily: 'inherit',
                }}>
                  View All
                </button>
              </div>
            </div>
          </div>
        </Main>
      </Content>

      {/* Detail slide panel */}
      <SlidePanel isOpen={panel.type !== null} onClose={closePanel} width={400}>
        {panel.type === 'mission'    && <MissionDetailPanel    mission={panel.data} />}
        {panel.type === 'expiration' && <ExpirationDetailPanel alert={panel.data} />}
        {panel.type === 'activity'   && <ActivityDetailPanel   activity={panel.data} />}
        {panel.type === 'itemStatus' && <ItemStatusDetailPanel item={panel.data} />}
      </SlidePanel>
    </PageLayout>
  );
}
