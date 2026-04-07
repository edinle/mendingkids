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
    <SideNavigation label="project">
      <NavigationContent>
        <Section>
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <ButtonItem
              key={id}
              iconBefore={<Icon label={label} />}
              isSelected={active === id}
              onClick={() => onNavigate?.(id)}
            >
              {label}
            </ButtonItem>
          ))}
        </Section>
      </NavigationContent>
    </SideNavigation>
  );
}

SideNav.propTypes = {
  active: PropTypes.string,
  onNavigate: PropTypes.func,
};
