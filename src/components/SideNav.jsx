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

import PeopleIcon from '@atlaskit/icon/core/people-group';
import MediaIcon from '@atlaskit/icon/core/archive-box';
import GroupIcon from '@atlaskit/icon/core/people-group';
import GraphLineIcon from '@atlaskit/icon/core/chart-trend';
import InventoryIcon from '@atlaskit/icon/core/assets';

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', Icon: DashboardIcon },
  { id: 'inventory', label: 'Inventory Management', Icon: InventoryIcon },
  { id: 'missions', label: 'Missions Tracking', Icon: GlobeIcon },
  { id: 'donors', label: 'Donors & Partners', Icon: PeopleIcon },
  { id: 'requests', label: 'Item Requests', Icon: MediaIcon },
  { id: 'volunteers', label: 'Volunteers', Icon: GroupIcon },
  { id: 'reports', label: 'Reports', Icon: GraphLineIcon },
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
              <Icon label={label} size="medium" />
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
