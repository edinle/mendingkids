import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Select from '@atlaskit/select';
import Textfield from '@atlaskit/textfield';
import { token } from '@atlaskit/tokens';
import SlidePanel from './SlidePanel';

const MISSIONS = [
  { label: 'Benin Cleft Lip & Palate', value: 'benin' },
  { label: 'Guatemala Orthopedic 2026', value: 'guatemala' },
  { label: 'Tanzania Cardiac Relief', value: 'tanzania' },
  { label: 'Honduras General Surgical', value: 'honduras' },
];

export default function AssignToMissionPanel({ isOpen, onClose, item, onAssign }) {
  const [selectedMission, setSelectedMission] = useState(null);
  const [quantity, setQuantity] = useState('');

  useEffect(() => {
    if (isOpen && item) {
      setQuantity(String(item.quantity || ''));
      setSelectedMission(null);
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  return (
    <SlidePanel isOpen={isOpen} onClose={onClose}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div style={{ padding: '12px 20px 12px 48px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', height: 53, boxSizing: 'border-box', backgroundColor: '#fff' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: token('color.text', '#172B4D') }}>
            Assign to Mission
          </h2>
        </div>

        {/* Content */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 24px 24px' }}>
          <p style={{ margin: '0 0 24px', fontSize: 14, color: '#505258', lineHeight: 1.5 }}>
            Deploy <strong>{item?.description}</strong> to a specific mission. This will update the status of these units to "In Use".
          </p>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44546F', marginBottom: 8 }}>
              Select Mission
            </label>
            <Select
              options={MISSIONS}
              value={selectedMission}
              onChange={setSelectedMission}
              placeholder="Choose a mission..."
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44546F', marginBottom: 8 }}>
              Quantity to Assign
            </label>
            <Textfield
              type="number"
              placeholder={`Available: ${item?.quantity || 0}`}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              elemBeforeInput={
                <span style={{ paddingLeft: 10, display: 'flex', color: '#626F86' }}>
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                    <circle cx="5" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" />
                    <circle cx="11" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" />
                    <path d="M7.5 8h1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
                  </svg>
                </span>
              }
            />
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: `1px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`,
          backgroundColor: '#fff',
          display: 'flex', justifyContent: 'flex-end', gap: 8
        }}>
          <button
            onClick={onClose}
            style={{
              padding: '6px 16px', borderRadius: 4, border: '1px solid #DFE1E6',
              background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500
            }}
          >
            Cancel
          </button>
          <button
            onClick={() => onAssign?.(selectedMission, quantity)}
            disabled={!selectedMission || !quantity}
            style={{
              padding: '6px 16px', borderRadius: 4, border: 'none',
              background: (!selectedMission || !quantity) ? '#F1F2F4' : '#A12654',
              color: '#fff', cursor: (!selectedMission || !quantity) ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 500
            }}
          >
            Assign Items
          </button>
        </div>
      </div>
    </SlidePanel>
  );
}

AssignToMissionPanel.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item: PropTypes.object,
  onAssign: PropTypes.func,
};
