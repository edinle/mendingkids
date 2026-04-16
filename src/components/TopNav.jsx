import { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';

// ─── Brand tokens ─────────────────────────────────────────────────────────────
const BRAND_BG      = '#1868DB'; // Atlassian nav blue (overridden by CSS token to purple)
const ICON_COLOR    = '#fff';
const NAV_HEIGHT    = 56;

// ─── Logo ─────────────────────────────────────────────────────────────────────
function Logo({ onClick }) {
  const [hov, setHov] = useState(false);
  return (
    <a
      href="/dashboard"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        padding: '0 12px', height: NAV_HEIGHT,
        textDecoration: 'none', flexShrink: 0,
        opacity: hov ? 0.82 : 1, transition: 'opacity 0.15s',
      }}
      aria-label="Mending Kids – Go to dashboard"
    >
      {/* Icon mark */}
      <div style={{
        width: 24, height: 24, borderRadius: 4,
        backgroundColor: 'rgba(255,255,255,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M2 7h10M7 2l5 5-5 5" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      {/* Wordmark */}
      <span style={{
        fontSize: 15, fontWeight: 700, color: '#fff',
        letterSpacing: '-0.01em', whiteSpace: 'nowrap',
        fontFamily: 'inherit',
      }}>
        Mending Kids
      </span>
    </a>
  );
}

// ─── Divider ──────────────────────────────────────────────────────────────────
function NavDivider() {
  return (
    <div style={{
      width: 1, height: 24, backgroundColor: 'rgba(255,255,255,0.2)',
      flexShrink: 0, margin: '0 4px',
    }} />
  );
}

// ─── Search Bar ───────────────────────────────────────────────────────────────
function NavSearch() {
  const [focused, setFocused] = useState(false);
  const [value, setValue]     = useState('');
  const inputRef = useRef(null);

  return (
    <div
      onClick={() => inputRef.current?.focus()}
      style={{
        display: 'flex', alignItems: 'center', gap: 8,
        height: 32, borderRadius: 6,
        backgroundColor: focused ? '#fff' : 'rgba(255,255,255,0.15)',
        border: focused ? '2px solid #4C9AFF' : '2px solid transparent',
        padding: '0 10px',
        cursor: 'text', transition: 'all 0.15s',
        minWidth: focused ? 280 : 180, maxWidth: 360,
        color: focused ? '#172B4D' : '#fff',
      }}
    >
      {/* Search icon */}
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" style={{ flexShrink: 0, opacity: focused ? 0.55 : 0.75 }}>
        <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
        <path d="M10 10.5l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
      </svg>
      <input
        ref={inputRef}
        value={value}
        onChange={e => setValue(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        placeholder="Search…"
        aria-label="Search inventory items, missions, partners"
        style={{
          border: 'none', outline: 'none', background: 'transparent',
          fontSize: 14, color: 'inherit', width: '100%',
          fontFamily: 'inherit',
          '::placeholder': { color: 'rgba(255,255,255,0.7)' },
        }}
      />
      {/* Keyboard shortcut hint */}
      {!focused && !value && (
        <kbd style={{
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, padding: '1px 5px', borderRadius: 3,
          backgroundColor: 'rgba(255,255,255,0.12)',
          fontSize: 11, color: 'rgba(255,255,255,0.7)',
          fontFamily: 'inherit', border: '1px solid rgba(255,255,255,0.2)',
          lineHeight: 1.5,
        }}>/</kbd>
      )}
    </div>
  );
}

// ─── Icon Button ──────────────────────────────────────────────────────────────
function NavIconButton({ id, label, badge, children, onClick, active }) {
  const [hov, setHov] = useState(false);
  return (
    <button
      id={id}
      onClick={onClick}
      onMouseEnter={() => setHov(true)}
      onMouseLeave={() => setHov(false)}
      aria-label={label}
      title={label}
      style={{
        position: 'relative', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        width: 32, height: 32, borderRadius: 4,
        border: 'none', cursor: 'pointer',
        backgroundColor: active
          ? 'rgba(255,255,255,0.28)'
          : hov ? 'rgba(255,255,255,0.18)' : 'transparent',
        color: '#fff', transition: 'background-color 0.12s',
        flexShrink: 0, padding: 0,
      }}
    >
      {children}
      {badge && (
        <span style={{
          position: 'absolute', top: 2, right: 2,
          backgroundColor: '#E2483D',
          color: '#fff', fontSize: 9, fontWeight: 700,
          borderRadius: 8, padding: '1px 4px', lineHeight: 1.4,
          pointerEvents: 'none', minWidth: 14, textAlign: 'center',
          boxSizing: 'border-box',
        }}>
          {badge > 9 ? '9+' : badge}
        </span>
      )}
    </button>
  );
}

// ─── SVG Icons ────────────────────────────────────────────────────────────────
const BellIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 2a6 6 0 0 0-6 6v3l-1.5 2.5h15L16 11V8a6 6 0 0 0-6-6Z" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round"/>
    <path d="M8 15.5a2 2 0 0 0 4 0" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
  </svg>
);

const GearIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <path d="M10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" stroke="#fff" strokeWidth="1.4"/>
    <path d="M16.5 10c0-.28-.02-.55-.06-.82l1.7-1.32-1.5-2.6-2 .8a6 6 0 0 0-1.4-.82l-.3-2.14h-3l-.3 2.14a6 6 0 0 0-1.4.82l-2-.8-1.5 2.6 1.7 1.32A6.1 6.1 0 0 0 6.5 10c0 .28.02.55.06.82l-1.7 1.32 1.5 2.6 2-.8c.43.32.9.59 1.4.82l.3 2.14h3l.3-2.14a6 6 0 0 0 1.4-.82l2 .8 1.5-2.6-1.7-1.32c.04-.27.06-.54.06-.82Z" stroke="#fff" strokeWidth="1.4" strokeLinejoin="round"/>
  </svg>
);

const HelpIcon = () => (
  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
    <circle cx="10" cy="10" r="8" stroke="#fff" strokeWidth="1.4"/>
    <path d="M7.5 7.5a2.5 2.5 0 0 1 4.88.83c0 1.67-2.5 2.5-2.5 2.5v1" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
    <circle cx="10" cy="14.5" r=".75" fill="#fff"/>
  </svg>
);

// ─── Notifications Popup ──────────────────────────────────────────────────────
function NotificationsPopup({ isOpen, onClose, items }) {
  const ref = useRef(null);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const typeIcon = (type) => {
    if (type === 'success') return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" fill="#1F845A"/>
        <path d="M5 8l2 2 4-4" stroke="#fff" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    );
    if (type === 'error') return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" fill="#AE2E24"/>
        <path d="M5.5 5.5l5 5M10.5 5.5l-5 5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    );
    return (
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
        <circle cx="8" cy="8" r="7" fill="#5137a2"/>
        <path d="M8 7v4M8 5v.5" stroke="#fff" strokeWidth="1.4" strokeLinecap="round"/>
      </svg>
    );
  };

  return (
    <div ref={ref} style={{
      position: 'fixed', top: NAV_HEIGHT + 6, right: 56,
      width: 368, zIndex: 9999,
      backgroundColor: '#fff', borderRadius: 6,
      boxShadow: '0 8px 32px rgba(9,30,66,0.20), 0 0 1px rgba(9,30,66,0.28)',
      overflow: 'hidden',
      animation: 'slideDown 0.18s ease',
    }}>
      {/* Header */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        padding: '14px 18px 12px', borderBottom: '1px solid #EBECF0',
      }}>
        <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#172B4D' }}>
          Notifications
        </h3>
        <button style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#5137a2', fontSize: 13, fontWeight: 500, padding: '2px 6px',
          borderRadius: 3, fontFamily: 'inherit',
        }}>
          Mark all as read
        </button>
      </div>
      {/* Items */}
      <div style={{ maxHeight: 380, overflowY: 'auto' }}>
        {items.length === 0 ? (
          <div style={{ padding: '24px 18px', textAlign: 'center', color: '#8590A2', fontSize: 13 }}>
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" style={{ display: 'block', margin: '0 auto 8px', opacity: 0.4 }}>
              <path d="M16 4a10 10 0 0 0-10 10v5l-2.5 4h25L26 19V14A10 10 0 0 0 16 4Z" stroke="#8590A2" strokeWidth="1.4" strokeLinejoin="round"/>
              <path d="M13 27a3 3 0 0 0 6 0" stroke="#8590A2" strokeWidth="1.4" strokeLinecap="round"/>
            </svg>
            No new notifications
          </div>
        ) : items.map(n => (
          <div key={n.id} style={{
            display: 'flex', gap: 12, padding: '13px 18px',
            borderBottom: '1px solid #F4F5F7', cursor: 'pointer',
            transition: 'background-color 0.1s',
          }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F4F5F7'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <div style={{ flexShrink: 0, marginTop: 1 }}>{typeIcon(n.type)}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ margin: '0 0 2px', fontSize: 13, fontWeight: 600, color: '#172B4D' }}>{n.title}</p>
              <p style={{ margin: '0 0 4px', fontSize: 12, color: '#5E6C84', lineHeight: 1.45, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.desc}</p>
              <span style={{ fontSize: 11, color: '#8590A2' }}>{n.time}</span>
            </div>
          </div>
        ))}
      </div>
      {/* Footer */}
      <div style={{
        padding: '10px 18px', borderTop: '1px solid #EBECF0',
        backgroundColor: '#FAFBFC', textAlign: 'center',
      }}>
        <button style={{
          background: 'none', border: 'none', cursor: 'pointer',
          color: '#5137a2', fontSize: 13, fontWeight: 500,
          fontFamily: 'inherit',
        }}>
          View all notifications
        </button>
      </div>
    </div>
  );
}

// ─── Profile Dropdown ─────────────────────────────────────────────────────────
function ProfileDropdown({ user, onSwitchAccount, onLogout }) {
  const [open, setOpen]     = useState(false);
  const [hov, setHov]       = useState(false);
  const ref                 = useRef(null);
  const initials            = user?.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() || 'U';

  const AVATAR_COLORS = ['#6554C0','#0052CC','#00875A','#FF5630','#FF991F','#36B37E'];
  const avatarColor = AVATAR_COLORS[(initials.charCodeAt(0) || 0) % AVATAR_COLORS.length];

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  return (
    <div ref={ref} style={{ position: 'relative', flexShrink: 0 }}>
      {/* Avatar trigger */}
      <button
        onClick={() => setOpen(o => !o)}
        onMouseEnter={() => setHov(true)}
        onMouseLeave={() => setHov(false)}
        aria-label="Your profile and account"
        title="Your profile"
        aria-expanded={open}
        style={{
          width: 32, height: 32, borderRadius: '50%',
          backgroundColor: avatarColor,
          border: open ? '2px solid #fff' : hov ? '2px solid rgba(255,255,255,0.6)' : '2px solid transparent',
          cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 12, fontWeight: 700, color: '#fff',
          transition: 'border-color 0.12s',
          fontFamily: 'inherit', padding: 0,
        }}
      >
        {initials}
      </button>

      {open && (
        <div style={{
          position: 'fixed', top: NAV_HEIGHT + 6, right: 12,
          width: 240, zIndex: 9999,
          backgroundColor: '#fff', borderRadius: 6,
          boxShadow: '0 8px 32px rgba(9,30,66,0.20), 0 0 1px rgba(9,30,66,0.28)',
          overflow: 'hidden',
          animation: 'slideDown 0.18s ease',
        }}>
          {/* Account info */}
          <div style={{ padding: '16px 18px 12px', borderBottom: '1px solid #EBECF0' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%',
                backgroundColor: avatarColor,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 15, fontWeight: 700, color: '#fff', flexShrink: 0,
              }}>{initials}</div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ margin: 0, fontSize: 14, fontWeight: 600, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</p>
                <p style={{ margin: '1px 0 0', fontSize: 12, color: '#5E6C84', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email || ''}</p>
              </div>
            </div>
          </div>

          {/* Role switcher */}
          <div style={{ padding: '6px 0', borderBottom: '1px solid #EBECF0' }}>
            <p style={{ margin: 0, padding: '6px 18px 4px', fontSize: 11, fontWeight: 700, color: '#8590A2', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Switch role</p>
            {['Administrator', 'Intern'].map(role => (
              <div key={role}
                onClick={() => { setOpen(false); onSwitchAccount(role); }}
                style={{ padding: '8px 18px', fontSize: 14, cursor: 'pointer', color: '#172B4D', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F4F5F7'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Switch to {role}
              </div>
            ))}
          </div>

          {/* Log out */}
          <div style={{ padding: '6px 0' }}>
            <div
              onClick={() => { setOpen(false); onLogout(); }}
              style={{ padding: '8px 18px', fontSize: 14, cursor: 'pointer', color: '#AE2E24', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FFECEB'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Log out
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Top Nav ──────────────────────────────────────────────────────────────────
export default function TopNav({ user, onSwitchAccount, onLogout, onToggleMobileMenu }) {
  const [notifOpen, setNotifOpen]     = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  async function fetchNotifications() {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);
      if (!error && data) setNotifications(data);
    } catch (e) {
      console.warn('[TopNav] Notification fetch failed:', e);
    }
  }

  useEffect(() => {
    fetchNotifications();
    let sub;
    try {
      sub = supabase
        .channel('topnav-activity')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, fetchNotifications)
        .subscribe();
    } catch (e) {
      console.warn('[TopNav] Realtime unavailable:', e);
    }
    return () => { if (sub) supabase.removeChannel(sub); };
  }, []);

  const feedItems = notifications.map(row => ({
    id: String(row.id ?? row.created_at ?? Math.random()),
    type: row.type || 'info',
    title: row.title || 'Activity update',
    desc: row.message || row.description || 'A new activity was recorded.',
    time: row.created_at ? new Date(row.created_at).toLocaleString() : 'just now',
  }));

  const unread = feedItems.length;

  return (
    <>
      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        /* placeholder color inside nav search */
        #topnav-search-input::placeholder { color: rgba(255,255,255,0.65); }
        #topnav-search-input:focus::placeholder { color: #9BAEC8; }

        @media (max-width: 768px) {
          #topnav-wordmark { display: none !important; }
          #topnav-search   { display: none !important; }
          #topnav-hamburger { display: flex !important; }
        }
      `}</style>

      <header style={{
        height: NAV_HEIGHT,
        backgroundColor: 'var(--ds-background-brand, #422670)',
        display: 'flex', alignItems: 'center',
        position: 'sticky', top: 0, zIndex: 500,
        boxShadow: '0 1px 0 rgba(0,0,0,0.25)',
        userSelect: 'none',
      }}>

        {/* ── Left: Hamburger (mobile) + Logo ─────────────────────────── */}
        <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
          {/* Hamburger – hidden on desktop via CSS */}
          <button
            id="topnav-hamburger"
            onClick={onToggleMobileMenu}
            aria-label="Toggle navigation menu"
            style={{
              display: 'none', // shown via CSS on mobile
              alignItems: 'center', justifyContent: 'center',
              width: 40, height: 40, marginLeft: 8,
              border: 'none', background: 'transparent', cursor: 'pointer',
              color: '#fff', borderRadius: 4,
            }}
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round"/>
            </svg>
          </button>

          <Logo onClick={() => navigate('/dashboard')} />
        </div>

        {/* ── Centre: Search ────────────────────────────────────────────── */}
        <div
          id="topnav-search"
          style={{ flex: 1, display: 'flex', justifyContent: 'center', padding: '0 16px', maxWidth: 480, margin: '0 auto' }}
        >
          <NavSearch />
        </div>

        {/* ── Right: Help / Notifications / Settings / Profile ──────────── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 2, padding: '0 12px', flexShrink: 0 }}>

          {/* Help */}
          <NavIconButton
            id="topnav-help"
            label="Help"
            onClick={() => {}}
          >
            <HelpIcon />
          </NavIconButton>

          <NavDivider />

          {/* Notifications */}
          <NavIconButton
            id="topnav-notifications"
            label={`Notifications${unread > 0 ? ` (${unread} unread)` : ''}`}
            badge={unread || null}
            onClick={() => setNotifOpen(o => !o)}
            active={notifOpen}
          >
            <BellIcon />
          </NavIconButton>

          {/* Settings */}
          <NavIconButton
            id="topnav-settings"
            label="Settings"
            onClick={() => navigate('/settings')}
          >
            <GearIcon />
          </NavIconButton>

          <NavDivider />

          {/* Profile avatar */}
          <ProfileDropdown
            user={user}
            onSwitchAccount={onSwitchAccount}
            onLogout={onLogout}
          />
        </div>
      </header>

      {/* Notifications popover */}
      <NotificationsPopup
        isOpen={notifOpen}
        onClose={() => setNotifOpen(false)}
        items={feedItems}
      />
    </>
  );
}
