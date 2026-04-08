import { useState } from 'react';
import { supabase } from '../utils/supabase';
import TextField from '@atlaskit/textfield';
import { token } from '@atlaskit/tokens';
import Modal, { ModalTransition, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button/new';

export default function LoginPage() {
  const [mode, setMode] = useState('login'); // 'login' or 'signup'
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!email || !password || (mode === 'signup' && !fullName)) {
      setError('Please fill in all fields.');
      setLoading(false);
      return;
    }

    try {
      if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              status: 'Pending'
            }
          }
        });
        if (error) throw error;
        setIsSuccessModalOpen(true);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        <h2 style={{ fontSize: 20, fontWeight: 600, color: '#172B4D', margin: '0 0 8px', textAlign: 'center' }}>
          {mode === 'login' ? 'Log in to your account' : 'Request access'}
        </h2>
        <p style={{ fontSize: 13, color: '#626F86', margin: '0 0 24px', textAlign: 'center' }}>
          {mode === 'login' 
            ? 'Enter your credentials to continue' 
            : 'Fill out the form below to request an account. An administrator will review your request.'}
        </p>
        
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {mode === 'signup' && (
            <div>
              <TextField 
                placeholder="Enter full name" 
                value={fullName} 
                onChange={e => setFullName(e.target.value)} 
              />
            </div>
          )}
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
            disabled={loading}
            style={{ 
              backgroundColor: '#422670', color: '#fff', border: 'none', 
              borderRadius: 3, padding: '10px', fontSize: 14, fontWeight: 600, 
              cursor: loading ? 'not-allowed' : 'pointer', marginTop: 8,
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Processing...' : (mode === 'login' ? 'Log in' : 'Submit Request')}
          </button>
        </form>

        <div style={{ marginTop: 24, paddingTop: 24, borderTop: '1px solid #DFE1E6', textAlign: 'center' }}>
          {mode === 'login' ? (
            <>
              <a href="#" style={{ color: '#0052CC', fontSize: 14, textDecoration: 'none' }}>Can't log in?</a>
              <span style={{ margin: '0 8px', color: '#8590A2' }}>•</span>
              <a 
                href="#" 
                onClick={(e) => { e.preventDefault(); setMode('signup'); setError(''); }}
                style={{ color: '#0052CC', fontSize: 14, textDecoration: 'none' }}
              >
                Request an account
              </a>
            </>
          ) : (
            <a 
              href="#" 
              onClick={(e) => { e.preventDefault(); setMode('login'); setError(''); }}
              style={{ color: '#0052CC', fontSize: 14, textDecoration: 'none' }}
            >
              Already have an account? Log in
            </a>
          )}
        </div>
      </div>

      <div style={{ marginTop: 32, textAlign: 'center' }}>
        <p style={{ fontSize: 12, color: '#626F86' }}>Privacy Policy • Terms of Service</p>
      </div>

      <ModalTransition>
        {isSuccessModalOpen && (
          <Modal onClose={() => { setIsSuccessModalOpen(false); setMode('login'); }}>
            <ModalHeader>
              <ModalTitle>Request Submitted</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p>Your request for an account has been received and is waiting for administrator approval.</p>
              <p>You will receive an email once your account is active.</p>
            </ModalBody>
            <ModalFooter>
              <Button appearance="primary" onClick={() => { setIsSuccessModalOpen(false); setMode('login'); }}>
                Return to Login
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
    </div>
  );
}

