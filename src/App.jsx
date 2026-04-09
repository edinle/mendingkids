import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
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

const PlaceholderPage = ({ title, id, user, onSwitchAccount, onLogout }) => {
  const navigate = useNavigate();
  return (
    <PageLayout>
      <TopNavigation isFixed>
        <TopNav 
          onNavigate={(p) => navigate(`/${p}`)} 
          user={user} 
          onSwitchAccount={onSwitchAccount} 
          onLogout={onLogout} 
        />
      </TopNavigation>
      <Content>
        <LeftSidebar width={240} id="app-sidebar" isFixed={false}>
          <SideNav active={id} user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />
        </LeftSidebar>
        <Main>
          <div style={{ padding: 40, textAlign: 'center', marginTop: 100 }}>
            <h1 style={{ color: '#172B4D', fontSize: 32 }}>{title}</h1>
            <p style={{ color: '#6B778C', fontSize: 16 }}>This section is coming soon.</p>
            <button
              style={{ marginTop: 24, padding: '10px 20px', backgroundColor: '#422670', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer', fontWeight: 600 }}
              onClick={() => navigate('/dashboard')}
            >
              Back to Dashboard
            </button>
          </div>
        </Main>
      </Content>
    </PageLayout>
  );
};

export default function App() {
  const [session, setSession] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const location = useLocation();

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

  if (userProfile.status === 'Pending') {
    return (
      <div style={{ 
        height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', 
        alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F5F7',
        textAlign: 'center', padding: 20
      }}>
        <div style={{ width: 64, height: 64, backgroundColor: '#422670', borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 24 }}>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 32 }}>MK</span>
        </div>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: '#172B4D', margin: '0 0 12px' }}>Approval Pending</h1>
        <p style={{ fontSize: 16, color: '#626F86', maxWidth: 480, lineHeight: 1.5, margin: '0 0 32px' }}>
          Thank you for requesting access to Mending Kids. Your account (<strong>{userProfile.email}</strong>) is currently being reviewed by an administrator. You will be able to access the dashboard once approved.
        </p>
        <button 
          onClick={onLogout}
          style={{ 
            backgroundColor: '#fff', color: '#172B4D', border: '1px solid #DFE1E6', 
            borderRadius: 3, padding: '10px 24px', fontSize: 14, fontWeight: 600, 
            cursor: 'pointer'
          }}
        >
          Log out
        </button>
      </div>
    );
  }

  const user = {
    ...userProfile,
    id: session.user.id,
    email: session.user.email
  };

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/dashboard" element={<DashboardPage user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />} />
      <Route path="/inventory" element={<InventoryPage user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />} />
      <Route path="/missions" element={<MissionsPage user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />} />
      <Route path="/missions/:id" element={<MissionDetailPage user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />} />
      <Route path="/missions/:id/add-items" element={<AddItemsPage user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />} />
      <Route path="/donors" element={<DonorsPage user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />} />
      <Route path="/requests" element={<ItemRequestsPage user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />} />
      <Route path="/volunteers" element={<VolunteersPage user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />} />
      <Route path="/reports" element={<ReportsPage user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />} />
      <Route path="/settings" element={<SettingsPage user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />} />
      
      {/* Fallback */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
