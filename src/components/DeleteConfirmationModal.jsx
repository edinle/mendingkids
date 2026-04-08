import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button';

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, message, itemName }) {
  return (
    <ModalTransition>
      {isOpen && (
        <Modal onClose={onClose}>
          <ModalHeader>
            <ModalTitle appearance="danger">{title}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p>{message} <strong>{itemName}</strong>?</p>
            <p style={{ marginTop: '12px', color: '#626F86', fontSize: '13px' }}>
              This action is irreversible and will remove high-level associations.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button appearance="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button appearance="danger" onClick={onConfirm} autoFocus>
              Delete
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </ModalTransition>
  );
}
