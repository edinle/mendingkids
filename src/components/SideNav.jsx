import { useState } from 'react';
import PropTypes from 'prop-types';
import {
  SideNavigation,
  NavigationContent,
  Section,
  ButtonItem,
  Header,
} from '@atlaskit/side-navigation';
import DashboardIcon from '@atlaskit/icon/core/dashboard';
import GlobeIcon from '@atlaskit/icon/core/globe';
import GroupIcon from '@atlaskit/icon/core/people-group';
import MediaIcon from '@atlaskit/icon/core/archive-box';
import GraphLineIcon from '@atlaskit/icon/core/chart-trend';
import InventoryIcon from '@atlaskit/icon/core/assets';
import FolderIcon from '@atlaskit/icon/core/folder-open';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { id: 'inventory', label: 'Inventory', Icon: InventoryIcon },
  { id: 'missions', label: 'Missions', Icon: GlobeIcon },
  { id: 'donors', label: 'Donors & Partners', Icon: GroupIcon },
  { id: 'requests', label: 'Item Requests', Icon: MediaIcon },
  { id: 'volunteers', label: 'Volunteers', Icon: GroupIcon },
  { id: 'reports', label: 'Reports', Icon: GraphLineIcon },
];

export default function SideNav({ active = 'inventory', onNavigate, user, onSwitchAccount, onLogout, accountOnly = false }) {
  const [profileOpen, setProfileOpen] = useState(false);

  const accountSwitcher = (
    <div style={{ padding: '8px 16px', borderTop: accountOnly ? 'none' : '1px solid #DFE1E6', marginTop: accountOnly ? 0 : 'auto', backgroundColor: accountOnly ? 'transparent' : '#F4F5F7' }}>
      <div 
        onClick={() => setProfileOpen(!profileOpen)}
        style={{ 
          display: 'flex', alignItems: 'center', gap: 12, padding: '8px', cursor: 'pointer',
          borderRadius: 4, transition: 'background 0.1s', position: 'relative'
        }}
        onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(9, 30, 66, 0.08)'}
        onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
      >
        <div style={{ 
          width: 32, height: 32, backgroundColor: '#6554C0', color: '#fff', 
          borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 14, fontWeight: 600, flexShrink: 0
        }}>
          {user?.name?.charAt(0).toUpperCase() || 'U'}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#172B4D', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name || 'User'}</p>
          <p style={{ margin: 0, fontSize: 11, color: '#626F86', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.role || 'Guest'}</p>
        </div>
      </div>

      {profileOpen && (
        <>
          <div onClick={() => setProfileOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 1000 }} />
          <div style={{
            position: 'fixed', bottom: 64, left: 16, width: 220,
            backgroundColor: '#fff', borderRadius: 4, zIndex: 1001,
            boxShadow: '0 8px 16px rgba(0,0,0,0.2), 0 0 1px rgba(0,0,0,0.1)',
            padding: '8px 0',
            border: '1px solid #DFE1E6'
          }}>
            <div style={{ padding: '8px 16px', borderBottom: '1px solid #F4F5F7', marginBottom: 4 }}>
              <p style={{ margin: 0, fontSize: 11, fontWeight: 700, color: '#626F86', textTransform: 'uppercase' }}>Account Profile</p>
            </div>
            <div 
              onClick={() => { setProfileOpen(false); onSwitchAccount('Administrator'); }}
              style={{ padding: '10px 16px', fontSize: 13, cursor: 'pointer', color: '#172B4D', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F4F5F7'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Switch to Administrator
            </div>
            <div 
              onClick={() => { setProfileOpen(false); onSwitchAccount('Intern'); }}
              style={{ padding: '10px 16px', fontSize: 13, cursor: 'pointer', color: '#172B4D', transition: 'background 0.1s' }}
              onMouseEnter={e => e.currentTarget.style.backgroundColor = '#F4F5F7'}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
            >
              Switch to Intern
            </div>
            <div style={{ borderTop: '1px solid #F4F5F7', marginTop: 4, paddingTop: 4 }}>
              <div 
                onClick={onLogout}
                style={{ padding: '10px 16px', fontSize: 13, cursor: 'pointer', color: '#d32f2f', fontWeight: 500, transition: 'background 0.1s' }}
                onMouseEnter={e => e.currentTarget.style.backgroundColor = '#FFF5F5'}
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

  if (accountOnly) return accountSwitcher;

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: '#F4F5F7', borderRight: '1px solid #DFE1E6' }}>
      <SideNavigation label="Main Navigation" testId="side-navigation">
        <NavigationContent>
          <Section>
            {NAV_ITEMS.map(({ id, label, Icon }) => {
              const isActive = active === id;
              return (
                <ButtonItem
                  key={id}
                  onClick={() => onNavigate?.(id)}
                  iconBefore={<Icon label="" size="medium" />}
                  isSelected={isActive}
                >
                  {label}
                </ButtonItem>
              );
            })}
          </Section>
        </NavigationContent>
        {accountSwitcher}
      </SideNavigation>
    </div>
  );
}

SideNav.propTypes = {
  active: PropTypes.string,
  onNavigate: PropTypes.func,
};
