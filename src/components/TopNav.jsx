import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import {
  AtlassianNavigation,
  CustomProductHome,
  Settings,
  Notifications,
  Profile,
  Search,
} from '@atlaskit/atlassian-navigation';
import NotificationIcon from '@atlaskit/icon/core/notification';
import SearchIcon from '@atlaskit/icon/core/search';
import CheckCircleIcon from '@atlaskit/icon/core/check-circle';
import ErrorIcon from '@atlaskit/icon/core/error';
import InfoIcon from '@atlaskit/icon/core/information';

// Inline SVG data URLs for logo (purple box with "MK" text)
const LOGO_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='124' height='32' viewBox='0 0 124 32'%3E%3Crect width='124' height='32' rx='6' fill='%23032966'/%3E%3Ctext x='62' y='21' font-family='Arial' font-size='13' font-weight='700' fill='white' text-anchor='middle'%3EMENDING KIDS%3C/text%3E%3C/svg%3E";

const ICON_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23032966'/%3E%3Ctext x='16' y='21' font-family='Arial' font-size='11' font-weight='700' fill='white' text-anchor='middle'%3EMK%3C/text%3E%3C/svg%3E";

const NotificationBadge = () => (
  <span style={{
    position: 'absolute',
    top: 4, right: 4,
    backgroundColor: '#E2483D',
    color: '#fff',
    fontSize: 9,
    fontWeight: 700,
    borderRadius: 8,
    padding: '1px 4px',
    lineHeight: 1.4,
    pointerEvents: 'none',
  }}>9+</span>
);

const ProductHome = () => {
  const navigate = useNavigate();
  return (
    <CustomProductHome
      logoUrl={LOGO_URL}
      logoAlt="Mending Kids"
      onClick={(e) => { e.preventDefault(); navigate('/dashboard'); }}
      href="/dashboard"
    />
  );
};

function NotificationsPopover({ isOpen, onClose, items }) {
  if (!isOpen) return null;
  return (
    <>
      <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300 }} />
      <div style={{
        position: 'absolute', top: 56, right: 80, width: 360,
        backgroundColor: '#fff', borderRadius: 4, zIndex: 301,
        boxShadow: '0 8px 12px rgba(9,30,66,0.15), 0 0 1px rgba(9,30,66,0.31)',
        display: 'flex', flexDirection: 'column'
      }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #DFE1E6', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 600, color: '#172B4D' }}>Notifications</h3>
          <button style={{ background: 'none', border: 'none', color: 'var(--ds-link)', fontSize: 13, cursor: 'pointer', fontWeight: 500 }}>Mark all as read</button>
        </div>
        <div style={{ maxHeight: 400, overflowY: 'auto' }}>
          {items.length === 0 ? (
            <div style={{ padding: '16px 20px', color: '#626F86', fontSize: 13 }}>
              No recent notifications.
            </div>
          ) : items.map(n => (
            <div key={n.id} style={{ display: 'flex', gap: 12, padding: '16px 20px', borderBottom: '1px solid #F4F5F7', cursor: 'pointer', /* hover effect handled by css normally, just keep simple here */ }}>
              <div style={{ flexShrink: 0, marginTop: 2 }}>
                {n.type === 'success' && <CheckCircleIcon primaryColor="#1F845A" size="medium" />}
                {n.type === 'error' && <ErrorIcon primaryColor="#AE2E24" size="medium" />}
                {n.type !== 'success' && n.type !== 'error' && <InfoIcon primaryColor="var(--ds-icon-brand)" size="medium" />}
              </div>
              <div>
                <p style={{ margin: '0 0 4px', fontSize: 14, fontWeight: 600, color: '#172B4D' }}>{n.title}</p>
                <p style={{ margin: '0 0 6px', fontSize: 13, color: '#5E6C84', lineHeight: 1.4 }}>{n.desc}</p>
                <span style={{ fontSize: 12, color: '#8590A2' }}>{n.time}</span>
              </div>
            </div>
          ))}
        </div>
        <div style={{ padding: '12px', textAlign: 'center', backgroundColor: '#F4F5F7', borderBottomLeftRadius: 4, borderBottomRightRadius: 4 }}>
          <button style={{ background: 'none', border: 'none', color: 'var(--ds-link)', fontSize: 14, cursor: 'pointer', fontWeight: 500 }}>View all notifications</button>
        </div>
      </div>
    </>
  );
}

const NavNotifications = () => (
  <Notifications
    badge={NotificationBadge}
    onClick={() => {}}
    tooltip="Notifications"
  />
);

const NavSettings = () => (
  <Settings onClick={() => {}} tooltip="Settings" />
);

const NavProfile = ({ user, onSwitchAccount, onLogout }) => {
  const [profileOpen, setProfileOpen] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <Profile
        icon={() => (
          <span style={{
            width: 24, height: 24, borderRadius: '50%',
            backgroundColor: '#0747A6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 600, color: '#fff', cursor: 'pointer'
          }}>{user?.name?.charAt(0).toUpperCase()}</span>
        )}
        onClick={() => setProfileOpen(!profileOpen)}
        tooltip="Your profile"
      />
      {profileOpen && (
        <>
          <div onClick={() => setProfileOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000 }} />
          <div style={{
            position: 'absolute', top: 40, right: 0, width: 200,
            backgroundColor: '#fff', borderRadius: 4, zIndex: 1001,
            boxShadow: '0 8px 12px rgba(9,30,66,0.15), 0 1px 2px rgba(9,30,66,0.31)',
            padding: '8px 0'
          }}>
            <div style={{ padding: '8px 16px', borderBottom: '1px solid #F4F5F7' }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#6B778C', textTransform: 'uppercase' }}>Atlassian account</p>
              <p style={{ margin: '4px 0 0', fontSize: 14, fontWeight: 500, color: '#172B4D' }}>{user?.name}</p>
              <p style={{ margin: 0, fontSize: 12, color: '#5E6C84' }}>{user?.email}</p>
            </div>
            <div style={{ padding: '8px 0' }}>
              <div 
                onClick={() => { setProfileOpen(false); onSwitchAccount('Administrator'); }}
                style={{ padding: '8px 16px', fontSize: 14, cursor: 'pointer', color: '#172B4D', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F4F5F7'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Switch to Admin
              </div>
              <div 
                onClick={() => { setProfileOpen(false); onSwitchAccount('Intern'); }}
                style={{ padding: '8px 16px', fontSize: 14, cursor: 'pointer', color: '#172B4D', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F4F5F7'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Switch to Intern
              </div>
            </div>
            <div style={{ padding: '8px 0', borderTop: '1px solid #F4F5F7' }}>
              <div 
                onClick={onLogout}
                style={{ padding: '8px 16px', fontSize: 14, cursor: 'pointer', color: '#172B4D', transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F4F5F7'}
                onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                Log out
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const NavSearch = () => (
  <div style={{ padding: '0 8px', minWidth: 240 }}>
    <Search
      onClick={() => {}}
      placeholder="Search inventory items, missions, partners..."
    />
  </div>
);

export default function TopNav({ user, onSwitchAccount, onLogout, onToggleMobileMenu }) {
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const navigate = useNavigate();

  async function fetchNotifications() {
    try {
      const { data, error } = await supabase
        .from('activity_log')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(5);

      if (error) {
        console.warn('[TopNav] Notification query failed:', error.message);
        return;
      }

      if (data) {
        setNotifications(data);
      }
    } catch (error) {
      console.warn('[TopNav] Notification fetch failed:', error);
    }
  }

  const feedItems = notifications.map((row) => ({
    id: String(row.id ?? row.created_at ?? row.title ?? row.message ?? 'activity'),
    type: row.type || 'info',
    title: row.title || 'Activity update',
    desc: row.message || row.description || 'A new activity was recorded.',
    time: row.created_at ? new Date(row.created_at).toLocaleString() : 'just now',
  }));

  useEffect(() => {
    fetchNotifications();

    let sub;
    try {
      sub = supabase
        .channel('activity-feed')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'activity_log' }, () => {
          fetchNotifications();
        })
        .subscribe();
    } catch (error) {
      console.warn('[TopNav] Realtime notifications unavailable:', error);
    }

    return () => {
      if (sub) {
        supabase.removeChannel(sub);
      }
    };
  }, []);

  return (
    <>
      <AtlassianNavigation
        label="Mending Kids Inventory"
        primaryItems={[]}
        renderProductHome={() => (
           <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
             <button 
               className="mobile-only"
               onClick={onToggleMobileMenu}
               style={{
                 background: 'none', border: 'none', cursor: 'pointer',
                 padding: '4px 8px', borderRadius: 4, display: 'none'
               }}
             >
               <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                 <path d="M4 6h16M4 12h16M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
               </svg>
             </button>
             <ProductHome />
           </div>
        )}
        renderSearch={() => (
          <div className="mobile-hide" style={{ padding: '0 8px', minWidth: 240 }}>
            <Search
              onClick={() => {}}
              placeholder="Search..."
              tooltip="Search ( / )"
            />
          </div>
        )}
        renderNotifications={() => <Notifications badge={NotificationBadge} onClick={() => setIsNotificationsOpen(!isNotificationsOpen)} tooltip="Notifications" />}
        renderSettings={() => <Settings onClick={() => navigate('/settings')} tooltip="Settings" />}
        renderProfile={() => <NavProfile user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
      />
      <NotificationsPopover isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} items={feedItems} />
      
      <style>{`
        @media (max-width: 768px) {
          .mobile-only { display: block !important; }
        }
      `}</style>
    </>
  );
}
