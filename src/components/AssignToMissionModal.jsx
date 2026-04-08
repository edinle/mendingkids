import React, { useState } from 'react';
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from '@atlaskit/modal-dialog';
import Select from '@atlaskit/select';
import TextField from '@atlaskit/textfield';
import Button from '@atlaskit/button';
import { token } from '@atlaskit/tokens';

const MISSIONS = [
  { label: 'Benin Cleft Lip & Palate', value: 'benin' },
  { label: 'Guatemala Orthopedic 2026', value: 'guatemala' },
  { label: 'Tanzania Cardiac Relief', value: 'tanzania' },
  { label: 'Honduras General Surgical', value: 'honduras' },
];

export default function AssignToMissionModal({ isOpen, onClose, item, onAssign }) {
  const [selectedMission, setSelectedMission] = useState(null);
  const [quantity, setQuantity] = useState(String(item?.quantity || ''));

  if (!isOpen) return null;

  return (
    <ModalTransition>
      <Modal onClose={onClose}>
        <ModalHeader>
          <ModalTitle>Assign to Mission</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p style={{ margin: '0 0 20px', fontSize: 14, color: token('color.text.subtle', '#505258') }}>
            Deploy <strong>{item?.description}</strong> to a specific mission.
          </p>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44546F', marginBottom: 8 }}>
              Select Mission
            </label>
            <Select
              options={MISSIONS}
              value={selectedMission}
              onChange={setSelectedMission}
              menuPosition="fixed"
              placeholder="Choose a mission..."
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44546F', marginBottom: 8 }}>
              Quantity to Assign
            </label>
            <TextField
              type="number"
              placeholder={`Available: ${item?.quantity || 0}`}
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button appearance="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            appearance="primary" 
            onClick={() => onAssign?.(selectedMission, quantity)}
            style={{ backgroundColor: '#A12654', color: '#fff' }}
            isDisabled={!selectedMission || !quantity}
          >
            Assign Items
          </Button>
        </ModalFooter>
      </Modal>
    </ModalTransition>
  );
}
