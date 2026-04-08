import { useState } from 'react';
import { supabase } from '../utils/supabase';
import TextField from '@atlaskit/textfield';
import { token } from '@atlaskit/tokens';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    
    if (!email || !password) {
      setError('Please enter both email and password.');
      return;
    }

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
    }
  };

  return (
    <div style={{ 
      height: '100vh', width: '100vw', display: 'flex', flexDirection: 'column', 
      alignItems: 'center', backgroundColor: '#F4F5F7', fontFamily: 'inherit' 
    }}>
      <div style={{ marginTop: 64, marginBottom: 40, display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, backgroundColor: '#422670', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <span style={{ color: '#fff', fontWeight: 'bold', fontSize: 20 }}>MK</span>
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#422670', margin: 0 }}>MENDING KIDS</h1>
      </div>

      <div style={{ 
        width: 400, padding: '32px 40px', backgroundColor: '#fff', 
        borderRadius: 3, boxShadow: '0 10px 20px rgba(0,0,0,0.1)' 
      }}>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#172B4D', margin: '0 0 24px', textAlign: 'center' }}>Log in to your account</h2>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <TextField 
              placeholder="Enter email address" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
            />
          </div>
          <div>
            <TextField 
              type="password" 
              placeholder="Enter password" 
              value={password} 
              onChange={e => setPassword(e.target.value)} 
            />
          </div>
          
          {error && <p style={{ color: '#AE2E24', fontSize: 13, margin: 0 }}>{error}</p>}

          <button 
            type="submit"
            style={{ 
              backgroundColor: '#422670', color: '#fff', border: 'none', 
              borderRadius: 3, padding: '10px', fontSize: 14, fontWeight: 600, 
              cursor: 'pointer', marginTop: 8 
            }}
          >
            Log in
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #DFE1E6', textAlign: 'center' }}>
          <a href="#" style={{ color: '#0052CC', fontSize: 14, textDecoration: 'none' }}>Can't log in?</a>
          <span style={{ margin: '0 8px', color: '#8590A2' }}>•</span>
          <a href="#" style={{ color: '#0052CC', fontSize: 14, textDecoration: 'none' }}>Create an account</a>
        </div>
      </div>

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#626F86' }}>Privacy Policy • Terms of Service</p>
      </div>
    </div>
  );
}
