import { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { isSupabaseConfigured, supabase, supabaseConfigMessage } from './utils/supabase';
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

  console.log('[App] Render:', { hasSession: !!session, hasProfile: !!userProfile, loading });

  useEffect(() => {
    console.log('[App] Initializing session...');
    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        console.log('[App] Session received:', !!session);
        if (error) throw error;
        
        setSession(session);
        if (session) {
          await fetchProfile(session.user.id, session.user.email);
        }
      } catch (err) {
        console.error('Auth check error:', err);
      } finally {
        setLoading(false);
      }
    };

    checkSession();

    // Fallback timeout to prevent permanent loading if checkSession hangs
    const timeoutId = setTimeout(() => {
      setLoading(currentLoading => {
        if (currentLoading) {
          console.warn('[App] Loading timed out after 5s. Forcing resolve.');
          return false;
        }
        return false;
      });
    }, 5000);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      console.log('[App] Auth state change:', _event, !!session);
      setSession(session);
      if (session) {
        await fetchProfile(session.user.id, session.user.email);
      } else {
        setUserProfile(null);
        setLoading(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeoutId);
    };
  }, []);

  const buildFallbackProfile = (id, email) => ({
    id,
    name: email?.split('@')[0] || 'User',
    email,
    role: 'Administrator',
    status: 'Active',
  });

  const withTimeout = (promise, ms, timeoutMessage) => {
    let timeoutId;
    const timeoutPromise = new Promise((_, reject) => {
      timeoutId = setTimeout(() => reject(new Error(timeoutMessage)), ms);
    });

    return Promise.race([promise, timeoutPromise]).finally(() => clearTimeout(timeoutId));
  };

  const fetchProfile = async (id, email) => {
    const fallbackProfile = buildFallbackProfile(id, email);
    // Never allow the UI to get stuck without a profile object.
    setUserProfile((current) => current || fallbackProfile);

    try {
      const { data, error } = await withTimeout(
        supabase.from('profiles').select('*').eq('id', id).single(),
        2500,
        'Profile lookup timed out'
      );
      
      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        setUserProfile(data);
      } else {
        // Create profile if missing; if DB write fails, continue with a local fallback profile.
        const newProfile = fallbackProfile;
        const { error: upsertError } = await withTimeout(
          supabase.from('profiles').upsert(newProfile),
          2500,
          'Profile upsert timed out'
        );
        if (upsertError) {
          console.warn('[App] Profile upsert failed; continuing with fallback profile.', upsertError);
        }
        setUserProfile(newProfile);
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
      // Never block the app on profile initialization issues.
      setUserProfile(fallbackProfile);
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
    return (
      <>
        {!isSupabaseConfigured && (
          <div style={{ backgroundColor: '#FFEDEB', color: '#5D1F1A', padding: '8px 12px', fontSize: 13, textAlign: 'center' }}>
            {supabaseConfigMessage}
          </div>
        )}
        <LoginPage />
      </>
    );
  }

  if (!userProfile) {
    return (
      <div style={{ display: 'flex', height: '100vh', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', backgroundColor: '#F4F5F7' }}>
        <p style={{ color: '#172B4D', fontSize: 18, marginBottom: 16 }}>Initializing Profile...</p>
        <p style={{ color: '#626F86', fontSize: 14, marginBottom: 24, maxWidth: 300, textAlign: 'center' }}>
          If this takes too long, please check your connection or try logging out.
        </p>
        <button 
          onClick={onLogout}
          style={{ padding: '8px 16px', backgroundColor: '#fff', border: '1px solid #DFE1E6', borderRadius: 3, cursor: 'pointer' }}
        >
          Logout
        </button>
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
    <>
      {!isSupabaseConfigured && (
        <div style={{ backgroundColor: '#FFEDEB', color: '#5D1F1A', padding: '8px 12px', fontSize: 13, textAlign: 'center' }}>
          {supabaseConfigMessage}
        </div>
      )}
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
    </>
  );
}
