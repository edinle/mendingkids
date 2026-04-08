import { useState, useEffect } from 'react';
import { supabase } from './utils/supabase';
import VolunteersPage   from './components/VolunteersPage';
import InventoryPage     from './components/InventoryPage';
import MissionsPage      from './components/MissionsPage';
import MissionDetailPage from './components/MissionDetailPage';
import AddItemsPage      from './components/AddItemsPage';
import DashboardPage     from './components/DashboardPage';
import DonorsPage        from './components/DonorsPage';
import ItemRequestsPage  from './components/ItemRequestsPage';
import SettingsPage      from './components/SettingsPage';
import ReportsPage       from './components/ReportsPage';

import { PageLayout, Content, Main, LeftSidebar, TopNavigation } from '@atlaskit/page-layout';
import TopNav  from './components/TopNav';
import SideNav from './components/SideNav';
import LoginPage from './components/LoginPage';
import SlidePanel from './components/SlidePanel';

const PlaceholderPage = ({ title, onNavigate, id, user, onSwitchAccount, onLogout }) => (
  <PageLayout>
    <TopNavigation isFixed>
      <TopNav 
        onNavigate={onNavigate} 
        user={user} 
        onSwitchAccount={onSwitchAccount} 
        onLogout={onLogout} 
      />
    </TopNavigation>
    <Content>
      <LeftSidebar width={240} id="app-sidebar" isFixed={false}>
        <SideNav active={id} onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />
      </LeftSidebar>
      <Main>
        <div style={{ padding: 40, textAlign: 'center', marginTop: 100 }}>
          <h1 style={{ color: '#172B4D', fontSize: 32 }}>{title}</h1>
          <p style={{ color: '#6B778C', fontSize: 16 }}>This section is coming soon.</p>
          <button
            style={{ marginTop: 24, padding: '10px 20px', backgroundColor: '#422670', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
            onClick={() => onNavigate('dashboard')}
          >
            Back to Dashboard
          </button>
        </div>
      </Main>
    </Content>
  </PageLayout>
);

export default function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [nav, setNav] = useState({ page: 'missions' });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setLoading(false);
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        fetchProfile(session.user.id, session.user.email);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (id, email) => {
    try {
      const { data, error } = await supabase.from('profiles').select('*').eq('id', id).single();
      if (data) {
        setUserProfile(data);
      } else {
        // Create profile if missing
        const { data: { user } } = await supabase.auth.getUser();
        const newProfile = {
          id: id,
          name: user?.user_metadata?.full_name || email.split('@')[0],
          email: email,
          role: 'Administrator'
        };
        await supabase.from('profiles').upsert(newProfile);
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const onNavigate = (page, params) => setNav({ page, params });
  
  const onLogout = async () => {
    await supabase.auth.signOut();
  };

  const onSwitchAccount = async (role) => {
    // For prototype switching roles, we update the profile in Supabase
    const newRole = role === 'Intern' ? 'Intern' : 'Administrator';
    const { error } = await supabase
      .from('profiles')
      .update({ role: newRole })
      .eq('id', session.user.id);
    
    if (!error) {
      setUserProfile({ ...userProfile, role: newRole });
    }
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p>Initializing...</p>
      </div>
    );
  }

  if (!session) {
    return <LoginPage />;
  }

  if (!userProfile) {
    return (
      <div style={{ display: 'flex', height: '100vh', alignItems: 'center', justifyContent: 'center' }}>
        <p>Initializing Profile...</p>
      </div>
    );
  }

  const user = {
    ...userProfile,
    id: session.user.id,
    email: session.user.email
  };

  return (
    <>


      {nav.page === 'dashboard'      && <DashboardPage      onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
      {nav.page === 'inventory'      && <InventoryPage      onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
      {nav.page === 'missions'       && <MissionsPage       onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
      {nav.page === 'mission-detail' && <MissionDetailPage  mission={nav.params}  onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
      {nav.page === 'add-items'      && <AddItemsPage       mission={nav.params}  onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
      {nav.page === 'donors'         && <DonorsPage         onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
      {nav.page === 'requests'       && <ItemRequestsPage   onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
      {nav.page === 'volunteers'     && <VolunteersPage     onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
      {nav.page === 'reports'        && <ReportsPage        onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
      {nav.page === 'settings'       && <SettingsPage       onNavigate={onNavigate} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />}
    </>
  );
}
