import { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Select from '@atlaskit/select';
import Textfield from '@atlaskit/textfield';
import { token } from '@atlaskit/tokens';
import { supabase } from '../utils/supabase';
import SlidePanel from './SlidePanel';

export default function AssignToMissionPanel({ isOpen, onClose, item, onAssign }) {
  const [selectedMission, setSelectedMission] = useState(null);
  const [quantity, setQuantity] = useState('');
  const [missions, setMissions] = useState([]);
  const [saving, setSaving] = useState(false);
  const maxQuantity = Number(item?.quantity || 0);

  useEffect(() => {
    if (isOpen) {
      fetchMissions();
      if (item) {
        setQuantity(String(item.quantity || ''));
      }
      setSelectedMission(null);
    }
  }, [isOpen, item]);

  const fetchMissions = async () => {
    const { data } = await supabase.from('missions').select('id, name, location');
    if (data) {
      setMissions(data.map(m => ({
        label: m.name,
        value: m.id,
        location: m.location || m.name,
      })));
    }
  };

  const handleAssign = async () => {
    if (!selectedMission || !quantity || !item) return;
    const quantityToAssign = Number(quantity);
    if (Number.isNaN(quantityToAssign) || quantityToAssign <= 0 || quantityToAssign > maxQuantity) return;
    setSaving(true);

    try {
      if (quantityToAssign === maxQuantity) {
        const { error } = await supabase
          .from('shipments')
          .update({
            status: 'in-use',
            mission_id: selectedMission.value,
            quantity: quantityToAssign,
            location: selectedMission.location || selectedMission.label,
          })
          .eq('id', item.id);

        if (error) throw error;
      } else {
        const remainingQuantity = maxQuantity - quantityToAssign;

        const { error: updateError } = await supabase
          .from('shipments')
          .update({
            quantity: remainingQuantity,
          })
          .eq('id', item.id);

        if (updateError) throw updateError;

        const { error: insertError } = await supabase
          .from('shipments')
          .insert({
            inventory_id: item.inventory_id,
            quantity: quantityToAssign,
            status: 'in-use',
            mission_id: selectedMission.value,
            location: selectedMission.location || selectedMission.label,
            expiration_date: item.expiration && item.expiration !== '—' ? item.expiration : null,
            lot_number: item.lot_number === 'N/A' ? null : item.lot_number,
            market_value: item.market_value ?? null,
            valuation_source: item.valuation_source ?? null,
            acquisition_method: item.acquisition_method ?? null,
          });

        if (insertError) throw insertError;
      }

      onAssign?.(selectedMission, quantityToAssign);
    } catch (err) {
      console.error('Assign to mission failed:', err);
    } finally {
      setSaving(false);
    }
  };

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
            Deploy <strong>{item?.description}</strong> to a specific mission. This will update the status of these units to "In Use" and change the item's location to the mission.
          </p>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44546F', marginBottom: 8 }}>
              Select Mission
            </label>
            <Select
              options={missions}
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
              placeholder={`Available: ${maxQuantity}`}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              min={1}
              max={maxQuantity}
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
              background: '#fff', cursor: 'pointer', fontSize: 14, fontWeight: 500,
              fontFamily: 'inherit',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handleAssign}
            disabled={!selectedMission || !quantity || saving || Number(quantity) <= 0 || Number(quantity) > maxQuantity}
            style={{
              padding: '6px 16px', borderRadius: 4, border: 'none',
              background: (!selectedMission || !quantity || saving || Number(quantity) <= 0 || Number(quantity) > maxQuantity) ? '#F1F2F4' : '#A12654',
              color: '#fff', cursor: (!selectedMission || !quantity || saving || Number(quantity) <= 0 || Number(quantity) > maxQuantity) ? 'not-allowed' : 'pointer',
              fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
            }}
          >
            {saving ? 'Assigning...' : 'Assign Items'}
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
