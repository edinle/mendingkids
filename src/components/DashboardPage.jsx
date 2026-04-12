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

const CALENDAR = {
  month: 'April 2026',
  days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
  today: 11,
  weeks: [
    [null, null, null, 1, 2, 3, 4],
    [5, 6, 7, 8, 9, 10, 11],
    [12, 13, 14, 15, 16, 17, 18],
    [19, 20, 21, 22, 23, 24, 25],
    [26, 27, 28, 29, 30, null, null],
  ],
  events: {
    1:  ['#1561cc'],
    5:  ['#1561cc'],
    9:  ['#1561cc', '#d63c8a'],
    12: ['#6d28d9'],
    15: ['#1561cc'],
    20: ['#6d28d9'],
  },
};

// ─── Info Tooltip ───────────────────────────────────────────────────────────

function InfoTooltip({ text }) {
  const [show, setShow] = useState(false);
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      <button
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        style={{
          background: 'none', border: 'none', cursor: 'pointer',
          padding: '0 0 0 5px', color: '#8590A2',
          display: 'flex', alignItems: 'center',
        }}
        aria-label="More info"
      >
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <circle cx="7" cy="7" r="6.25" stroke="currentColor" strokeWidth="1.2" />
          <path d="M7 6.5v3.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <circle cx="7" cy="4.5" r="0.65" fill="currentColor" />
        </svg>
      </button>
      {show && (
        <div style={{
          position: 'absolute', left: '110%', top: '50%', transform: 'translateY(-50%)',
          zIndex: 200, width: 230,
          backgroundColor: '#172B4D', color: '#fff',
          borderRadius: 5, padding: '9px 13px',
          fontSize: 12, lineHeight: 1.55,
          boxShadow: '0 4px 16px rgba(9,30,66,0.22)',
          pointerEvents: 'none',
        }}>
          {text}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ title, tooltip, style }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginBottom: 4, ...style }}>
      <h2 style={{ margin: 0, fontSize: 15, fontWeight: 600, color: '#000' }}>{title}</h2>
      <InfoTooltip text={tooltip} />
    </div>
  );
}

function SectionSubtitle({ children }) {
  return (
    <p style={{ margin: '0 0 14px', fontSize: 12, color: '#8590A2', lineHeight: 1.4 }}>
      {children}
    </p>
  );
}

// ─── Status / Category Badges ───────────────────────────────────────────────

function StatusBadge({ status }) {
  const colors = {
    ONGOING:   { bg: '#E3FCEF', text: '#006644', border: '#ABF5D1' },
    PENDING:   { bg: '#FFF7D6', text: '#7A5200', border: '#FFD84D' },
    COMPLETED: { bg: '#F1F2F4', text: '#44546F', border: '#C1C7D0' },
    ARCHIVED:  { bg: '#F1F2F4', text: '#44546F', border: '#C1C7D0' },
  };
  const c = colors[status] || colors.PENDING;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center',
      padding: '1px 7px',
      border: `1px solid ${c.border}`,
      borderRadius: 3,
      fontSize: 11, fontWeight: 700,
      color: c.text,
      backgroundColor: c.bg,
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

// ─── Mission Card ───────────────────────────────────────────────────────────

function PinIcon() {
  return (
    <svg width="11" height="13" viewBox="0 0 12 14" fill="none" style={{ flexShrink: 0 }}>
      <path d="M6 0a4.5 4.5 0 0 1 4.5 4.5C10.5 7.5 6 13 6 13S1.5 7.5 1.5 4.5A4.5 4.5 0 0 1 6 0Z" fill="#626F86" />
      <circle cx="6" cy="4.5" r="1.5" fill="#fff" />
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
        <span style={{ fontSize: 14, fontWeight: 500, color: '#172B4D', lineHeight: '20px', paddingRight: 8 }}>
          {mission.name}
        </span>
        <CategoryBadge label={mission.specialty || 'General'} color={SPECIALTY_COLORS[mission.specialty] || '#626F86'} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
        <StatusBadge status={mission.status} />
        <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, color: '#44546F' }}>
          <CalIconSvg />
          {mission.dates || 'TBD'}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
        <PinIcon />
        <span style={{ fontSize: 12, color: '#626F86' }}>
          {mission.location || 'Location TBD'}
        </span>
      </div>
    </div>
  );
}

// ─── Calendar Widget ────────────────────────────────────────────────────────

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

function CalendarWidget() {
  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
        <span style={{ fontSize: 15, fontWeight: 600, color: '#000' }}>{CALENDAR.month}</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <NavBtn label="‹" />
          <NavBtn label="›" />
        </div>
      </div>
      <SectionSubtitle>Mission dates and scheduled events this month. Dots indicate active missions.</SectionSubtitle>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', textAlign: 'center', marginBottom: 4 }}>
        {CALENDAR.days.map((d) => (
          <span key={d} style={{ fontSize: 11, fontWeight: 700, color: '#626F86', padding: '4px 0', textTransform: 'uppercase' }}>{d}</span>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '1px', backgroundColor: '#EBECF0', border: '1px solid #EBECF0', borderRadius: 4, overflow: 'hidden' }}>
        {CALENDAR.weeks.map((week, wi) =>
          week.map((day, di) => {
            const isToday = day === CALENDAR.today;
            const events = day ? CALENDAR.events[day] : null;
            return (
              <div
                key={`${wi}-${di}`}
                style={{
                  height: 44,
                  backgroundColor: day ? (isToday ? '#F4F5FF' : '#fff') : '#FBFBFC',
                  display: 'flex', flexDirection: 'column',
                  alignItems: 'center', justifyContent: 'center',
                  position: 'relative',
                  cursor: day ? 'default' : 'default',
                }}
              >
                {day && (
                  <>
                    <span style={{
                      fontSize: 13,
                      fontWeight: isToday ? 700 : 400,
                      color: isToday ? '#422670' : '#172B4D',
                      marginBottom: events ? 2 : 0,
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
        )}
      </div>

      <div style={{ marginTop: 14, display: 'flex', flexDirection: 'column', gap: 7 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#1561cc', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#44546F' }}>Cardiac Mission Briefing</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: '#d63c8a', flexShrink: 0 }} />
          <span style={{ fontSize: 12, color: '#44546F' }}>Infections Supplies Audit</span>
        </div>
      </div>
    </div>
  );
}

// ─── Alert Row ──────────────────────────────────────────────────────────────

function WarningIcon({ color = '#FF991F', size = 15 }) {
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
      <WarningIcon color={alert.severity === 'danger' ? '#c62828' : '#FF991F'} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: '#172B4D', lineHeight: '18px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {alert.item}
        </div>
        <div style={{ fontSize: 11, color: '#8590A2' }}>{alert.text} · expires {alert.date}</div>
      </div>
      <ArrowIcon />
    </div>
  );
}

// ─── Combined Activity Feed ─────────────────────────────────────────────────

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

function InventoryIcon({ status }) {
  const color = status === 'available' ? '#1a7f37' : status === 'in-use' ? '#1565c0' : '#c62828';
  return (
    <div style={{
      width: 28, height: 28, borderRadius: '50%',
      backgroundColor: color + '18',
      display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
    }}>
      <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
        <rect x="2" y="4" width="12" height="9" rx="1.5" stroke={color} strokeWidth="1.3" />
        <path d="M5 4V3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v1" stroke={color} strokeWidth="1.3" />
        <path d="M6 8.5h4" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    </div>
  );
}

function ActivityFeedRow({ entry, onClick }) {
  const [hov, setHov] = useState(false);
  const isItem = entry.feedType === 'item';
  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '8px 6px',
        borderRadius: 4,
        backgroundColor: hov ? '#F4F5F7' : 'transparent',
        cursor: 'pointer',
        transition: 'background-color 0.12s',
        borderBottom: '1px solid #f0f0f0',
      }}
    >
      {isItem
        ? <InventoryIcon status={entry.status} />
        : <UserAvatar initials={entry.initials} />
      }
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {entry.text}
        </div>
        {isItem && (
          <div style={{ fontSize: 11, color: '#8590A2', marginTop: 1 }}>
            <span style={{
              fontWeight: 600,
              color: entry.status === 'available' ? '#1a7f37' : entry.status === 'in-use' ? '#1565c0' : '#c62828',
            }}>
              {entry.status}
            </span>
            {' · '}{entry.qty} units
          </div>
        )}
      </div>
      <span style={{ fontSize: 11, color: '#8590A2', whiteSpace: 'nowrap' }}>{entry.time}</span>
    </div>
  );
}

// ─── Detail Panels ──────────────────────────────────────────────────────────

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
          {mission.specialty && (
            <CategoryBadge label={mission.specialty} color={SPECIALTY_COLORS[mission.specialty] || '#626F86'} />
          )}
        </div>
        <DetailField label="Location" value={mission.location || '—'} />
        <DetailField label="Dates" value={mission.dates || '—'} />
        <DetailField label="Doctor" value={mission.doctor_name || '—'} />
        <DetailField label="Budget" value={mission.budget ? `$${Number(mission.budget).toLocaleString()}` : '—'} />
      </div>
      <div style={{ padding: '16px 24px', borderTop: '1px solid #E8E8E8', backgroundColor: '#fff', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          onClick={() => navigate(`/missions/${mission.id}`)}
          style={{ width: '100%', height: 40, backgroundColor: '#422670', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          Go to Mission Details
        </button>
        <button
          onClick={() => navigate('/missions')}
          style={{ width: '100%', height: 40, backgroundColor: 'transparent', color: '#44546F', border: '1px solid #DFE1E6', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
          <WarningIcon color="#FF991F" />
          <p style={{ margin: 0, fontSize: 14, color: '#44546F' }}>This item is expiring soon and requires action.</p>
        </div>
        <DetailField label="Item" value={alert.item} />
        <DetailField label="Quantity" value={alert.qty} />
        <DetailField label="Location" value={alert.location} />
        <DetailField label="Expiration Date" value={alert.date} />
        <div style={{ marginTop: 8, padding: 14, backgroundColor: '#FFF7EC', borderRadius: 6, border: '1px solid #FFD580' }}>
          <p style={{ margin: 0, fontSize: 13, color: '#974F0C' }}>
            Action needed: Dispose of or redistribute these items before the expiration date.
          </p>
        </div>
      </div>
    </div>
  );
}

function ActivityDetailPanel({ entry }) {
  if (!entry) return null;
  const isItem = entry.feedType === 'item';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 20px 12px 48px', borderBottom: '1px solid #E8E8E8', display: 'flex', alignItems: 'center', height: 53, boxSizing: 'border-box' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#172B4D' }}>
          {isItem ? 'Inventory Update' : 'Activity Detail'}
        </h2>
      </div>
      <div style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
        {isItem ? (
          <>
            <DetailField label="Item" value={entry.text} />
            <DetailField label="Status" value={entry.status} />
            <DetailField label="Quantity" value={`${entry.qty} units`} />
            <DetailField label="Updated" value={entry.time} />
          </>
        ) : (
          <>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <UserAvatar initials={entry.initials} />
              <span style={{ fontSize: 13, color: '#44546F' }}>{entry.time}</span>
            </div>
            <DetailField label="Action" value={entry.text} />
            <DetailField label="Time" value={entry.time} />
          </>
        )}
      </div>
    </div>
  );
}

// ─── Pagination ─────────────────────────────────────────────────────────────

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

function Pagination({ current, total }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2, paddingTop: 12 }}>
      <PageBtn label="‹" />
      {[1, 2, 3].map(p => <PageBtn key={p} label={String(p)} active={p === current} />)}
      <PageBtn label="›" />
    </div>
  );
}

// ─── Main Page ──────────────────────────────────────────────────────────────

export default function DashboardPage({ user, onSwitchAccount, onLogout }) {
  const navigate = useNavigate();
  const [panel, setPanel] = useState({ type: null, data: null });
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [missions, setMissions]   = useState([]);
  const [alerts, setAlerts]       = useState([]);
  const [feedItems, setFeedItems] = useState([]);
  const [loading, setLoading]     = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const formatRelativeTime = (dateStr) => {
    const d = new Date(dateStr);
    const diff = Date.now() - d.getTime();
    if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
    return d.toLocaleDateString();
  };

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const ninetyDaysFromNow = new Date();
      ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90);
      const cutoffDate = ninetyDaysFromNow.toISOString().split('T')[0];

      const [missionsRes, alertsRes, logRes, shipmentsRes] = await Promise.all([
        // Only ONGOING missions on the dashboard
        supabase
          .from('missions')
          .select('*')
          .eq('status', 'ONGOING')
          .order('created_at', { ascending: false })
          .limit(4),
        // Items expiring within 90 days
        supabase
          .from('shipments')
          .select('*, inventory(description)')
          .not('expiration_date', 'is', null)
          .lt('expiration_date', cutoffDate)
          .order('expiration_date', { ascending: true })
          .limit(5),
        // Recent team activity
        supabase
          .from('activity_log')
          .select('*, profiles(name, initials)')
          .order('created_at', { ascending: false })
          .limit(5),
        // Recent inventory changes
        supabase
          .from('shipments')
          .select('*, inventory(description)')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      if (missionsRes.data) setMissions(missionsRes.data);

      if (alertsRes.data) {
        setAlerts(alertsRes.data.map(a => ({
          id: a.id,
          text: `${a.quantity} units expiring soon`,
          date: new Date(a.expiration_date).toLocaleDateString(),
          item: a.inventory?.description || 'Unknown Item',
          qty: a.quantity,
          location: a.location || 'Primary Storage',
          severity: new Date(a.expiration_date) < new Date() ? 'danger' : 'warning',
        })));
      }

      // Merge activity log + inventory updates into one chronological feed
      const activityEntries = (logRes.data || []).map(l => ({
        id: 'log-' + l.id,
        feedType: 'activity',
        text: l.action_text,
        time: formatRelativeTime(l.created_at),
        initials: l.profiles?.initials || '??',
        _ts: new Date(l.created_at).getTime(),
      }));

      const inventoryEntries = (shipmentsRes.data || []).map(s => ({
        id: 'ship-' + s.id,
        feedType: 'item',
        text: s.inventory?.description || 'Inventory item',
        qty: s.quantity,
        status: s.status,
        time: formatRelativeTime(s.created_at),
        _ts: new Date(s.created_at).getTime(),
      }));

      // Sort merged feed newest-first, take top 8
      const merged = [...activityEntries, ...inventoryEntries]
        .sort((a, b) => b._ts - a._ts)
        .slice(0, 8);

      setFeedItems(merged);
    } catch (err) {
      console.error('[Dashboard] fetch error:', err);
    } finally {
      setLoading(false);
    }
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
              <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#172B4D' }}>Dashboard</h1>
              <button
                onClick={() => navigate('/inventory')}
                style={{ height: 32, padding: '0 16px', backgroundColor: '#422670', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                Go to Inventory
              </button>
            </div>

            {/* Top row: Ongoing Missions + Expiration Alerts */}
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 0.65fr', gap: 16, marginBottom: 16 }}>

              <div style={{ border: '1px solid #e8e8e8', borderRadius: 6, padding: '20px 20px 16px' }}>
                <SectionHeader
                  title="Ongoing Missions"
                  tooltip="Missions currently in progress. Click a card to view team, items, and details. Pending and completed missions are accessible from the Missions page."
                />
                <SectionSubtitle>
                  Active missions happening right now. Click any card to manage items and team members.
                </SectionSubtitle>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {loading ? (
                    <p style={{ gridColumn: 'span 2', textAlign: 'center', padding: 20, color: '#626F86' }}>Loading…</p>
                  ) : missions.length === 0 ? (
                    <p style={{ gridColumn: 'span 2', textAlign: 'center', padding: 20, color: '#626F86' }}>No ongoing missions right now.</p>
                  ) : missions.map((m) => (
                    <MissionCard key={m.id} mission={m} onClick={(mission) => navigate(`/missions/${mission.id}`)} />
                  ))}
                </div>
                {missions.length > 0 && <Pagination current={1} total={missions.length} />}
              </div>

              <div style={{ border: '1px solid #e8e8e8', borderRadius: 6, padding: '20px 20px 16px' }}>
                <SectionHeader
                  title="Expiration Alerts"
                  tooltip="Inventory items expiring within the next 90 days. Items shown in red have already expired. Review and redistribute or dispose of them promptly."
                />
                <SectionSubtitle>
                  Supplies expiring soon — act before the date to avoid waste.
                </SectionSubtitle>
                {loading ? (
                  <p style={{ textAlign: 'center', padding: 20, color: '#626F86' }}>Loading…</p>
                ) : alerts.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: 20, color: '#1a7f37', fontSize: 13 }}>✓ No items expiring in the next 90 days.</p>
                ) : alerts.map((alert) => (
                  <AlertRow key={alert.id} alert={alert} onClick={() => openPanel('expiration', alert)} />
                ))}
              </div>
            </div>

            {/* Bottom row: Calendar + Combined Activity Feed */}
            <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 16 }}>

              <div style={{ border: '1px solid #e8e8e8', borderRadius: 6, padding: '16px 20px' }}>
                <SectionHeader
                  title="Mission Calendar"
                  tooltip="An at-a-glance view of mission events scheduled this month. Colored dots on dates correspond to active or upcoming missions by specialty."
                  style={{ marginBottom: 0 }}
                />
                <CalendarWidget />
              </div>

              <div style={{ border: '1px solid #e8e8e8', borderRadius: 6, padding: '16px 20px' }}>
                <SectionHeader
                  title="Activity Feed"
                  tooltip="A combined log of team actions (user activity) and inventory changes. Circular avatars indicate a person's action; box icons indicate an inventory update."
                />
                <SectionSubtitle>
                  Recent team actions and inventory updates across the system.
                </SectionSubtitle>
                {loading ? (
                  <p style={{ textAlign: 'center', padding: 10, color: '#626F86' }}>Loading…</p>
                ) : feedItems.length === 0 ? (
                  <p style={{ textAlign: 'center', padding: 10, color: '#626F86' }}>No recent activity found.</p>
                ) : feedItems.map((entry) => (
                  <ActivityFeedRow
                    key={entry.id}
                    entry={entry}
                    onClick={() => openPanel('activity', entry)}
                  />
                ))}
                <button
                  onClick={() => navigate('/inventory')}
                  style={{
                    marginTop: 12, padding: '6px 14px',
                    border: '1px solid #d9d9d9', borderRadius: 4,
                    background: '#fff', cursor: 'pointer',
                    fontSize: 13, color: '#172B4D', fontFamily: 'inherit',
                  }}
                >
                  View All Inventory
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
        {panel.type === 'activity'   && <ActivityDetailPanel   entry={panel.data} />}
      </SlidePanel>
    </PageLayout>
  );
}
