import {
  AtlassianNavigation,
  CustomProductHome,
  Settings,
  Notifications,
  Profile,
} from '@atlaskit/atlassian-navigation';
import NotificationIcon from '@atlaskit/icon/core/notification';

// Inline SVG data URLs for logo (purple box with "MK" text)
const LOGO_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='81' height='32' viewBox='0 0 81 32'%3E%3Crect width='81' height='32' rx='6' fill='%23251343'/%3E%3Ctext x='40' y='21' font-family='Arial' font-size='13' font-weight='700' fill='white' text-anchor='middle'%3EMENDING KIDS%3C/text%3E%3C/svg%3E";

const ICON_URL =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='32' height='32' viewBox='0 0 32 32'%3E%3Crect width='32' height='32' rx='6' fill='%23251343'/%3E%3Ctext x='16' y='21' font-family='Arial' font-size='11' font-weight='700' fill='white' text-anchor='middle'%3EMK%3C/text%3E%3C/svg%3E";

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

const ProductHome = () => (
  <CustomProductHome
    iconUrl={ICON_URL}
    iconAlt="Mending Kids"
    logoUrl={LOGO_URL}
    logoAlt="Mending Kids"
    siteTitle="Inventory Management System"
    href="/"
  />
);

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

const NavProfile = () => (
  <Profile
    icon={() => (
      <span style={{
        width: 24, height: 24, borderRadius: '50%',
        backgroundColor: '#6554C0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 11, fontWeight: 600, color: '#fff',
      }}>U</span>
    )}
    onClick={() => {}}
    tooltip="Your profile"
  />
);

export default function TopNav() {
  return (
    <AtlassianNavigation
      label="Mending Kids Inventory"
      primaryItems={[]}
      renderProductHome={ProductHome}
      renderNotifications={NavNotifications}
      renderSettings={NavSettings}
      renderProfile={NavProfile}
    />
  );
}
