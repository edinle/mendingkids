import { useState } from 'react';
import { token } from '@atlaskit/tokens';
import Textfield from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import SlidePanel from './SlidePanel';

const PRIORITY_OPTIONS = [
  { label: 'High', value: 'High' },
  { label: 'Medium', value: 'Medium' },
  { label: 'Low', value: 'Low' },
];

export default function RequestFormPanel({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    requester: '', mission: '', priority: null, note: ''
  });

  const handleSave = () => {
    onSave({
      id: `REQ-${Math.floor(Math.random() * 900) + 100}`, // random ID like REQ-XXX
      requester: formData.requester || 'Unknown User',
      mission: formData.mission || 'General Stock',
      priority: formData.priority?.value || 'Low',
      status: 'Pending',
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }),
    });
    setFormData({ requester: '', mission: '', priority: null, note: '' }); // reset
    onClose();
  };

  const labelSt = { display: 'block', marginBottom: 4, fontSize: 12, fontWeight: 600, color: token('color.text', '#172B4D') };

  return (
    <SlidePanel isOpen={isOpen} onClose={onClose} width={400}>
      <div style={{ padding: '24px', flex: 1, overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 24px', fontSize: 24, fontWeight: 700, color: token('color.text', '#172B4D') }}>
          New Item Request
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={labelSt}>Requester Name *</label>
            <Textfield value={formData.requester} onChange={e => setFormData({...formData, requester: e.target.value})} placeholder="e.g. Dr. Meredith Grey" />
          </div>
          <div>
            <label style={labelSt}>Mission / Use Case *</label>
            <Textfield value={formData.mission} onChange={e => setFormData({...formData, mission: e.target.value})} placeholder="e.g. Uganda Cardiac 2026" />
          </div>
          <div>
            <label style={labelSt}>Priority</label>
            <Select value={formData.priority} onChange={v => setFormData({...formData, priority: v})} options={PRIORITY_OPTIONS} placeholder="Select priority status" />
          </div>
          <div>
            <label style={labelSt}>Items Needed & Quantities</label>
            <textarea 
              value={formData.note} 
              onChange={e => setFormData({...formData, note: e.target.value})} 
              placeholder="e.g. 5x Pulse Oximeters, 20x Surgical Masks" 
              rows={5}
              style={{ width: '100%', boxSizing: 'border-box', padding: '8px', border: '2px solid #DFE1E6', borderRadius: 3, resize: 'vertical', fontFamily: 'inherit', fontSize: 14 }}
            />
          </div>
        </div>
      </div>
      
      <div style={{ padding: '16px 24px', borderTop: `1px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`, display: 'flex', gap: 8, justifyContent: 'flex-end', backgroundColor: '#fff' }}>
        <button onClick={onClose} style={{ padding: '8px 16px', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 14 }}>Cancel</button>
        <button onClick={handleSave} style={{ padding: '8px 16px', border: 'none', borderRadius: 4, background: '#422670', color: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500 }}>
          Create Request
        </button>
      </div>
    </SlidePanel>
  );
}
