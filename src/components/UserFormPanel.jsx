import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Textfield from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import { token } from '@atlaskit/tokens';
import SlidePanel from './SlidePanel';

const ROLE_OPTIONS = [
  { label: 'Donor', value: 'Donor' },
  { label: 'Partner', value: 'Partner' },
  { label: 'Corporate', value: 'Corporate' },
];

const STATUS_OPTIONS = [
  { label: 'Active', value: 'Active' },
  { label: 'Inactive', value: 'Inactive' },
];

export default function UserFormPanel({ isOpen, onClose, user, onSave }) {
  const [formData, setFormData] = useState({
    name: '', email: '', role: null, organization: '', status: null
  });

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        email: user.email || '',
        role: user.role ? { label: user.role, value: user.role } : null,
        organization: user.organization || '',
        status: user.status ? { label: user.status, value: user.status } : null,
      });
    } else {
      setFormData({ name: '', email: '', role: null, organization: '', status: null });
    }
  }, [user, isOpen]);

  const handleSave = () => {
    onSave({
      id: user ? user.id : Date.now(),
      name: formData.name,
      email: formData.email,
      role: formData.role?.value || 'Donor',
      organization: formData.organization || 'Individual',
      status: formData.status?.value || 'Active',
      lastActive: user ? user.lastActive : 'Just now',
    });
    onClose();
  };

  const labelSt = { display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600, color: token('color.text', '#172B4D') };

  return (
    <SlidePanel isOpen={isOpen} onClose={onClose} width={400}>
      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 700, color: token('color.text', '#172B4D') }}>
          {user ? 'Edit User' : 'Add User'}
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelSt}>Name *</label>
            <Textfield value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="e.g. John Doe" />
          </div>
          <div>
            <label style={labelSt}>Email *</label>
            <Textfield value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} placeholder="john@example.com" />
          </div>
          <div>
            <label style={labelSt}>Role</label>
            <Select value={formData.role} onChange={v => setFormData({...formData, role: v})} options={ROLE_OPTIONS} placeholder="Select role" />
          </div>
          <div>
            <label style={labelSt}>Organization</label>
            <Textfield value={formData.organization} onChange={e => setFormData({...formData, organization: e.target.value})} placeholder="e.g. Acme Corp" />
          </div>
          <div>
            <label style={labelSt}>Status</label>
            <Select value={formData.status} onChange={v => setFormData({...formData, status: v})} options={STATUS_OPTIONS} placeholder="Select status" />
          </div>
        </div>
      </div>
      
      <div style={{ padding: '16px 24px', borderTop: `1px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`, display: 'flex', gap: 8, justifyContent: 'flex-end', backgroundColor: '#fff' }}>
        <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
        <button onClick={handleSave} style={{ padding: '8px 16px', border: 'none', borderRadius: 4, background: '#422670', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
          {user ? 'Save Changes' : 'Add User'}
        </button>
      </div>
    </SlidePanel>
  );
}
