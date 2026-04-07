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
  { id: 'inventory', label: 'Inventory Management', Icon: InventoryIcon },
  { id: 'missions', label: 'Missions Tracking', Icon: GlobeIcon },
  { id: 'donors', label: 'Donors & Partners', Icon: GroupIcon },
  { id: 'requests', label: 'Item Requests', Icon: MediaIcon },
  { id: 'volunteers', label: 'Volunteers', Icon: GroupIcon },
  { id: 'reports', label: 'Reports', Icon: GraphLineIcon },
];

export default function SideNav({ active = 'inventory', onNavigate }) {
  return (
    <div style={{
      '--ds-background-selected': '#F3F0FF', 
      '--ds-text-selected': '#422670', 
      '--ds-icon-selected': '#422670',
      '--ds-background-neutral-hovered': 'rgba(66, 38, 112, 0.08)',
      height: '100%',
    }}>
      <SideNavigation label="Main Navigation" testId="side-navigation">
      <NavigationContent>
        <Header 
          iconBefore={<div style={{ width: 32, height: 32, backgroundColor: '#422670', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 4 }}><FolderIcon label="Logo" size="medium" /></div>}
          description="Inventory"
        >
          Mending Kids
        </Header>
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
      </SideNavigation>
    </div>
  );
}

SideNav.propTypes = {
  active: PropTypes.string,
  onNavigate: PropTypes.func,
};
