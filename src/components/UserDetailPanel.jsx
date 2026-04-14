import { useState, useEffect } from 'react';
import { token } from '@atlaskit/tokens';
import { supabase } from '../utils/supabase';
import SlidePanel from './SlidePanel';

export default function UserDetailPanel({ isOpen, onClose, user, onEdit, onSave }) {
  const [saved, setSaved] = useState(null);
  const [draft, setDraft] = useState(null);
  const [editing, setEditing] = useState(null); // field key
  const [tempVal, setTempVal] = useState('');
  const [hovered, setHovered] = useState(null);
  const [userLogs, setUserLogs] = useState([]);

  useEffect(() => {
    if (user) {
      const userData = {
        role: user.role || '',
        organization: user.organization || '',
        status: user.status || 'Active',
      };
      setSaved(userData);
      setDraft(userData);
      fetchUserLogs(user.id);
    }
  }, [user]);

  const fetchUserLogs = async (profileId) => {
    const { data } = await supabase
      .from('activity_log')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(7);
    if (data) setUserLogs(data);
  };

  if (!user || !saved) return null;

  const startEdit = (field) => {
    setEditing(field);
    setTempVal(saved[field]);
    setHovered(null);
  };

  const commitEdit = async () => {
    const field = editing;
    const value = tempVal;
    
    // Update local state
    setSaved(prev => ({ ...prev, [field]: value }));
    setDraft(prev => ({ ...prev, [field]: value }));
    setEditing(null);

    // Persist to Supabase
    try {
      const { error } = await supabase
        .from('donors')
        .update({ [field]: value })
        .eq('id', user.id);
      
      if (error) throw error;
      
      // Log Activity
      await supabase.from('activity_log').insert({
        action_text: `Updated profile for ${user.name}: ${field} set to ${value}`,
        category: 'Users'
      });

      onSave?.(); // Refresh parent table
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const cancelEdit = () => {
    setEditing(null);
    setTempVal('');
  };

  const labelSt = { fontSize: 12, color: token('color.text.subtle', '#505258'), margin: '0 0 4px', display: 'block' };
  const valSt = { fontSize: 14, color: token('color.text', '#172B4D'), margin: 0, fontWeight: 500 };
  
  const renderEditableField = (field, label) => {
    const isEditing = editing === field;
    const isHovered = hovered === field && !editing;

    if (isEditing) {
      return (
        <div style={{ marginBottom: 20 }}>
          <span style={labelSt}>{label}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input 
              autoFocus
              value={tempVal}
              onChange={e => setTempVal(e.target.value)}
              style={{
                flex: 1, padding: '6px 10px', borderRadius: 3, border: '2px solid #2684FF',
                fontSize: 14, outline: 'none', fontFamily: 'inherit'
              }}
            />
            <button onClick={commitEdit} style={{ border: 'none', background: '#1F845A', color: '#fff', borderRadius: 3, padding: '4px 8px', cursor: 'pointer' }}>Save</button>
            <button onClick={cancelEdit} style={{ border: 'none', background: '#AE2E24', color: '#fff', borderRadius: 3, padding: '4px 8px', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
      );
    }

    return (
      <div 
        style={{ 
          marginBottom: 20, padding: '4px 8px', borderRadius: 4, 
          backgroundColor: isHovered ? 'rgba(9,30,66,0.04)' : 'transparent',
          border: isHovered ? '1px solid rgba(9,30,66,0.08)' : '1px solid transparent',
          cursor: 'pointer'
        }}
        onMouseEnter={() => setHovered(field)}
        onMouseLeave={() => setHovered(null)}
        onClick={() => startEdit(field)}
      >
        <span style={labelSt}>{label}</span>
        <p style={valSt}>{saved[field]}</p>
      </div>
    );
  };

  return (
    <SlidePanel isOpen={isOpen} onClose={onClose} width={480}>
        <div style={{ padding: '12px 20px 12px 48px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', height: 53, boxSizing: 'border-box' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: token('color.text', '#172B4D') }}>
            {user.name}
          </h2>
        </div>
        <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
            <div style={{ width: 64, height: 64, backgroundColor: '#422670', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 'bold' }}>
              {user.name.charAt(0)}
            </div>
            <div>
              <p style={{ margin: 0, fontSize: 14, color: '#626F86' }}>{user.email}</p>
            </div>
          </div>

        <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
          <button onClick={() => onEdit(user)} style={{ flex: 1, padding: '8px 16px', backgroundColor: '#422670', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            Edit Profile
          </button>
          <button style={{ flex: 1, padding: '8px 16px', backgroundColor: '#fff', color: '#172B4D', border: '1px solid #d9d9d9', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
            Reset Password
          </button>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#172B4D', marginBottom: 16, borderBottom: '1px solid #e8e8e8', paddingBottom: 8 }}>User Details</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0, marginBottom: 24 }}>
          {renderEditableField('role', 'Role')}
          {renderEditableField('organization', 'Organization')}
          {renderEditableField('status', 'Status')}
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#172B4D', marginBottom: 16, borderBottom: '1px solid #e8e8e8', paddingBottom: 8 }}>Recent Activity</h3>
        <div style={{ color: '#626F86', fontSize: 14 }}>
          {userLogs.length === 0 ? (
            <p style={{ fontStyle: 'italic' }}>No recent activity recorded.</p>
          ) : (
            userLogs.map((log, i) => (
              <p key={i} style={{ margin: '0 0 8px' }}>
                • {log.action_text} ({new Date(log.created_at).toLocaleDateString()})
              </p>
            ))
          )}
        </div>
      </div>
    </SlidePanel>
  );
}
