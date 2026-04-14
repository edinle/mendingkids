import React, { useState } from 'react';
import Modal, {
  ModalBody,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTransition,
} from '@atlaskit/modal-dialog';
import Select from '@atlaskit/select';
import Textarea from '@atlaskit/textarea';
import Button from '@atlaskit/button';
import { token } from '@atlaskit/tokens';

const STATUS_OPTIONS = [
  { label: 'Available', value: 'available' },
  { label: 'In Use', value: 'in-use' },
  { label: 'Reserved', value: 'reserved' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Expired / Disposed', value: 'expired' },
];

export default function ItemStatusModal({ isOpen, onClose, itemName = "Selected Item", currentStatus = "available", onSave }) {
  const [selectedStatus, setSelectedStatus] = useState(STATUS_OPTIONS.find(opt => opt.value === currentStatus));
  const [reason, setReason] = useState('');

  if (!isOpen) return null;

  return (
    <ModalTransition>
      <Modal onClose={onClose}>
        <ModalHeader>
          <ModalTitle>Update Item Status</ModalTitle>
        </ModalHeader>
        <ModalBody>
          <p style={{ margin: '0 0 20px', fontSize: 14, color: token('color.text.subtle', '#505258') }}>
            Change the current status for <strong>{itemName}</strong>.
          </p>

          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44546F', marginBottom: 8 }}>
              New Status
            </label>
            <Select
              inputId="status-select"
              options={STATUS_OPTIONS}
              value={selectedStatus}
              onChange={setSelectedStatus}
              menuPosition="fixed"
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: '#44546F', marginBottom: 8 }}>
              Internal Note / Reason (Optional)
            </label>
            <Textarea
              placeholder="E.g., Flagged for repair, or dispatched to Uganda Mission earlier today."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              minimumRows={3}
            />
          </div>
        </ModalBody>
        <ModalFooter>
          <Button appearance="subtle" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            appearance="primary" 
            onClick={() => onSave?.(selectedStatus?.value, reason)}
            style={{ backgroundColor: '#0747A6', color: '#fff' }}
          >
            Update Status
          </Button>
        </ModalFooter>
      </Modal>
    </ModalTransition>
  );
}
