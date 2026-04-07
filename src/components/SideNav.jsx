import PropTypes from 'prop-types';
import {
  SideNavigation,
  NavigationHeader,
  NavigationContent,
  Section,
  ButtonItem,
  Header,
} from '@atlaskit/side-navigation';
import DashboardIcon from '@atlaskit/icon/core/dashboard';
import GlobeIcon from '@atlaskit/icon/core/globe';
import AppsIcon from '@atlaskit/icon/core/menu';

// inventory icon (using a grid/list style icon)
const InventoryIcon = (props) => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
    <path d="M3 5h18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm0 6h18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Zm0 6h18a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1v-2a1 1 0 0 1 1-1Z" fill="currentColor" />
  </svg>
);

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { id: 'missions', label: 'Missions', Icon: GlobeIcon },
  { id: 'inventory', label: 'Inventory', Icon: InventoryIcon },
];

export default function SideNav({ active = 'inventory', onNavigate }) {
  return (
    <div style={{ padding: '16px 12px', display: 'flex', flexDirection: 'column', gap: 4 }}>
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const isActive = active === id;
        return (
          <button
            key={id}
            onClick={() => onNavigate?.(id)}
            style={{
              display: 'flex', alignItems: 'center', gap: 12,
              width: '100%', padding: '10px 12px',
              border: isActive ? 'none' : 'none',
              borderRadius: 4,
              backgroundColor: isActive ? '#F3F0FF' : 'transparent',
              color: isActive ? '#422670' : '#44546F',
              cursor: 'pointer', textAlign: 'left',
              fontSize: 14, fontWeight: isActive ? 600 : 500,
              fontFamily: 'inherit',
              transition: 'background-color 0.2s',
            }}
            onMouseEnter={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = 'rgba(9,30,66,0.04)';
            }}
            onMouseLeave={(e) => {
              if (!isActive) e.currentTarget.style.backgroundColor = 'transparent';
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', color: isActive ? '#422670' : '#44546F' }}>
              {id === 'inventory' ? <InventoryIcon /> : <Icon label={label} size="medium" />}
            </div>
            {label}
          </button>
        );
      })}
    </div>
  );
}

SideNav.propTypes = {
  active: PropTypes.string,
  onNavigate: PropTypes.func,
};
