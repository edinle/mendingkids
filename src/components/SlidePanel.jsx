import PropTypes from 'prop-types';

export default function SlidePanel({ isOpen, onClose, children, width = 480 }) {
  return (
    <>
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 200,
          backgroundColor: 'rgba(9,30,66,0.54)',
          opacity: isOpen ? 1 : 0,
          pointerEvents: isOpen ? 'auto' : 'none',
          transition: 'opacity 0.22s ease',
        }}
      />

      {/* Right-side panel */}
      <div
        style={{
          position: 'fixed', top: 0, right: 0, bottom: 0,
          width: width,
          zIndex: 201,
          display: 'flex', flexDirection: 'column',
          backgroundColor: '#F8F8F8',
          boxShadow: '-4px 0 24px rgba(9,30,66,0.18)',
          transform: isOpen ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.25s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      >
        {children}
      </div>
    </>
  );
}

SlidePanel.propTypes = {
  isOpen:   PropTypes.bool.isRequired,
  onClose:  PropTypes.func.isRequired,
  children: PropTypes.node,
  width:    PropTypes.number,
};
