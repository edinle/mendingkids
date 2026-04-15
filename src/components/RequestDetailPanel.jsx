import { useState, useEffect } from 'react';
import { token } from '@atlaskit/tokens';
import { supabase } from '../utils/supabase';
import Select from '@atlaskit/select';
import SlidePanel from './SlidePanel';

export default function RequestDetailPanel({ isOpen, onClose, request, onUpdateStatus, onSave, user }) {
  const [items, setItems] = useState([]);
  const [editing, setEditing] = useState(null);
  const [tempVal, setTempVal] = useState('');
  const [hovered, setHovered] = useState(null);
  const [saved, setSaved] = useState(null);

  useEffect(() => {
    if (request && isOpen) {
      fetchRequestItems();
      const initial = { status: request.status, priority: request.priority };
      setSaved(initial);
    }
  }, [request, isOpen]);

  const fetchRequestItems = async () => {
    const { data } = await supabase
      .from('request_items')
      .select('*, inventory(description)')
      .eq('request_id', request.id);
    if (data) setItems(data);
  };

  if (!request || !saved) return null;

  const startEdit = (field) => {
    setEditing(field);
    setTempVal(saved[field]);
    setHovered(null);
  };

  const commitEdit = async () => {
    const field = editing;
    const value = tempVal;
    
    setSaved(prev => ({ ...prev, [field]: value }));
    setEditing(null);

    try {
      const { error } = await supabase.from('requests').update({ [field]: value }).eq('id', request.id);
      if (error) throw error;
      
      // Log Activity
      await supabase.from('activity_log').insert({
        profile_id: user?.id,
        action_text: `Updated Request ${request.id}: ${field} set to ${value}`,
        category: 'Requests'
      });
      
      onSave?.();
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

  const renderEditableDetail = (field, label, options) => {
    const isEditing = editing === field;
    const isHovered = hovered === field && !isEditing;

    if (isEditing) {
      return (
        <div>
          <span style={labelSt}>{label}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            <Select
              value={{ label: tempVal, value: tempVal }}
              onChange={v => setTempVal(v?.value || '')}
              options={options.map(o => ({ label: o, value: o }))}
              menuPortalTarget={document.body}
              styles={{ container: (base) => ({ ...base, flex: 1 }) }}
              autoFocus
            />
            <button onClick={commitEdit} style={{ border: 'none', background: '#1F845A', color: '#fff', borderRadius: 3, padding: '2px 8px', cursor: 'pointer' }}>✓</button>
            <button onClick={cancelEdit} style={{ border: 'none', background: '#AE2E24', color: '#fff', borderRadius: 3, padding: '2px 8px', cursor: 'pointer' }}>✕</button>
          </div>
        </div>
      );
    }

    return (
      <div 
        onMouseEnter={() => setHovered(field)}
        onMouseLeave={() => setHovered(null)}
        onClick={() => startEdit(field)}
        style={{ 
          cursor: 'pointer', padding: '4px 8px', borderRadius: 4, margin: '-4px -8px',
          backgroundColor: isHovered ? 'rgba(9,30,66,0.04)' : 'transparent',
          border: isHovered ? '1px solid rgba(9,30,66,0.08)' : '1px solid transparent'
        }}
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
          {request.id}
        </h2>
      </div>
      <div style={{ padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#626F86' }}>Requested by {request.requester}</p>
        
        {request.status === 'Pending' && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
            <button 
              onClick={() => onUpdateStatus(request.id, 'Approved')} 
              style={{ flex: 1, padding: '8px 16px', backgroundColor: '#1F845A', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              Approve
            </button>
            <button 
              onClick={() => onUpdateStatus(request.id, 'Declined')} 
              style={{ flex: 1, padding: '8px 16px', backgroundColor: '#AE2E24', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              Deny
            </button>
          </div>
        )}
        {(request.status === 'Approved' || request.status === 'Declined') && (
           <div style={{ marginBottom: 32, padding: '12px 16px', borderRadius: 4, backgroundColor: request.status === 'Approved' ? '#E3FCEF' : '#FFEBE6', color: request.status === 'Approved' ? '#006644' : '#BF2600', fontWeight: 500 }}>
             This request has been {request.status.toLowerCase()}.
           </div>
        )}

        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#172B4D', marginBottom: 16, borderBottom: '1px solid #e8e8e8', paddingBottom: 8 }}>Request Details</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24, marginBottom: 32 }}>
          <div>
            <span style={labelSt}>Mission</span>
            <p style={valSt}>{request.mission}</p>
          </div>
          <div>
            <span style={labelSt}>Date Created</span>
            <p style={valSt}>{request.date}</p>
          </div>
          {renderEditableDetail('status', 'Status', ['Pending', 'Approved', 'In Progress', 'Declined'])}
          {renderEditableDetail('priority', 'Priority', ['High', 'Medium', 'Low'])}
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#172B4D', marginBottom: 16, borderBottom: '1px solid #e8e8e8', paddingBottom: 8 }}>Items Requested</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 0', borderBottom: '1px solid #e8e8e8', color: '#626F86', fontWeight: 600 }}>Item Description</th>
              <th style={{ textAlign: 'right', padding: '8px 0', borderBottom: '1px solid #e8e8e8', color: '#626F86', fontWeight: 600 }}>Quantity</th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td colSpan="2" style={{ padding: '24px 0', textAlign: 'center', color: '#626F86' }}>
                  No items specified for this request.
                </td>
              </tr>
            ) : items.map((item, idx) => (
              <tr key={item.id || idx}>
                <td style={{ padding: '12px 0', borderBottom: '1px solid #e8e8e8', color: '#172B4D' }}>
                  {item.inventory?.description || 'Custom Item'}
                </td>
                <td style={{ textAlign: 'right', padding: '12px 0', borderBottom: '1px solid #e8e8e8', color: '#172B4D', fontWeight: 500 }}>
                  {item.quantity}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </SlidePanel>
  );
}
