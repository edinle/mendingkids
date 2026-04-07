import { useState } from 'react';
import { token } from '@atlaskit/tokens';
import SlidePanel from './SlidePanel';

export default function UserDetailPanel({ isOpen, onClose, user, onEdit }) {
  if (!user) return null;

  const labelSt = { fontSize: 12, color: token('color.text.subtle', '#505258'), margin: '0 0 4px', display: 'block' };
  const valSt = { fontSize: 14, color: token('color.text', '#172B4D'), margin: 0, fontWeight: 500 };

  return (
    <SlidePanel isOpen={isOpen} onClose={onClose} width={480}>
      <div style={{ padding: '32px 24px', flex: 1, overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32 }}>
          <div style={{ width: 64, height: 64, backgroundColor: '#0052CC', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 'bold' }}>
            {user.name.charAt(0)}
          </div>
          <div>
            <h2 style={{ margin: '0 0 4px', fontSize: 24, fontWeight: 700, color: token('color.text', '#172B4D') }}>
              {user.name}
            </h2>
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
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
          <div>
            <span style={labelSt}>Role</span>
            <p style={valSt}>{user.role}</p>
          </div>
          <div>
            <span style={labelSt}>Organization</span>
            <p style={valSt}>{user.organization}</p>
          </div>
          <div>
            <span style={labelSt}>Status</span>
            <span style={{ backgroundColor: user.status === 'Active' ? '#E3FCEF' : '#FFEBE6', color: user.status === 'Active' ? '#006644' : '#BF2600', padding: '2px 8px', borderRadius: 3, fontSize: 12, fontWeight: 600, display: 'inline-block' }}>
              {user.status}
            </span>
          </div>
          <div>
            <span style={labelSt}>Last Active</span>
            <p style={valSt}>{user.lastActive}</p>
          </div>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#172B4D', marginBottom: 16, borderBottom: '1px solid #e8e8e8', paddingBottom: 8 }}>Recent Activity</h3>
        <div style={{ color: '#626F86', fontSize: 14 }}>
          <p style={{ margin: '0 0 8px' }}>• Logged in from new device ({user.lastActive})</p>
          <p style={{ margin: '0 0 8px' }}>• Updated profile information (2 weeks ago)</p>
          <p style={{ margin: '0 0 8px' }}>• Donated 500 units of Surgical Masks (1 month ago)</p>
        </div>
      </div>
    </SlidePanel>
  );
}
