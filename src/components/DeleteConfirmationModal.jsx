import Modal, { ModalBody, ModalFooter, ModalHeader, ModalTitle, ModalTransition } from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button';

export default function DeleteConfirmationModal({ isOpen, onClose, onConfirm, title, message, itemName, appearance = 'danger', confirmLabel = 'Delete' }) {
  return (
    <ModalTransition>
      {isOpen && (
        <Modal onClose={onClose}>
          <ModalHeader>
            <ModalTitle appearance={appearance === 'primary' ? 'none' : appearance}>{title}</ModalTitle>
          </ModalHeader>
          <ModalBody>
            <p>{message} <strong>{itemName}</strong>?</p>
            {appearance === 'danger' && (
              <p style={{ marginTop: '12px', color: '#626F86', fontSize: '13px' }}>
                This action is irreversible and will remove high-level associations.
              </p>
            )}
          </ModalBody>
          <ModalFooter>
            <Button appearance="subtle" onClick={onClose}>
              Cancel
            </Button>
            <Button appearance={appearance} onClick={onConfirm} autoFocus>
              {confirmLabel}
            </Button>
          </ModalFooter>
        </Modal>
      )}
    </ModalTransition>
  );
}
