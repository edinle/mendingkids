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
        <button
          onClick={onClose}
          style={{
            position: 'absolute', top: 16, left: -48,
            width: 32, height: 32, borderRadius: '50%',
            backgroundColor: 'transparent', border: 'none',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: '#fff',
            transition: 'background-color 0.2s', zIndex: 10,
          }}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(255,255,255,0.2)'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
          aria-label="Close panel"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
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
