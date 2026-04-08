import { useState, useRef, useEffect } from 'react';

export default function FilterDropdown({ label, options, selected, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref  = useRef(null);
  
  useEffect(() => {
    const h = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(o => !o)}
        style={{
          display: 'flex', alignItems: 'center', gap: 6,
          height: 32, padding: '0 10px',
          border: '1px solid #d9d9d9', borderRadius: 4,
          background: selected ? '#F3F0FF' : '#fff',
          color: selected ? '#422670' : '#172B4D',
          cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
          fontWeight: selected ? 500 : 400,
        }}
      >
        {selected || label}
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d={open ? 'M3 8l3-3 3 3' : 'M3 4l3 3 3-3'} stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </button>
      {open && (
        <div style={{
          position: 'absolute', top: '100%', left: 0, marginTop: 4,
          minWidth: 160, padding: '4px 0',
          background: '#fff', borderRadius: 4,
          boxShadow: '0 4px 16px rgba(9,30,66,0.16)',
          zIndex: 100,
        }}>
          <button
            onClick={() => { onSelect(''); setOpen(false); }}
            style={{
              display: 'block', width: '100%', padding: '7px 12px', border: 'none',
              background: !selected ? '#F3F0FF' : 'transparent',
              color: !selected ? '#422670' : '#172B4D',
              fontSize: 13, fontFamily: 'inherit', textAlign: 'left',
              fontWeight: !selected ? 600 : 400, cursor: 'pointer',
            }}
          >
            All
          </button>
          {options.map(o => (
            <button
              key={o}
              onClick={() => { onSelect(o); setOpen(false); }}
              style={{
                display: 'block', width: '100%', padding: '7px 12px', border: 'none',
                background: selected === o ? '#F3F0FF' : 'transparent',
                color: selected === o ? '#422670' : '#172B4D',
                fontSize: 13, fontFamily: 'inherit', textAlign: 'left',
                fontWeight: selected === o ? 600 : 400, cursor: 'pointer',
              }}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
