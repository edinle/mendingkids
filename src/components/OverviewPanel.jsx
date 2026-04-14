import { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import Button from '@atlaskit/button/new';
import Lozenge from '@atlaskit/lozenge';
import { token } from '@atlaskit/tokens';
import { supabase } from '../utils/supabase';
import SlidePanel from './SlidePanel';
import ItemStatusModal from './ItemStatusModal';

// ─── Static sample remains as fallback ─────────────────────────────────────

const ACTIVITY_LOG = [
  { id: 1, type: 'added',   label: 'Added inventory',      delta: '+500', reason: 'Purchase order received' },
  { id: 2, type: 'removed', label: 'Removed inventory',    delta: '-120', reason: '—' },
  { id: 3, type: 'mission', label: 'Assigned to mission',  delta: '-100', reason: 'Uganda Cardiac Mission' },
  { id: 4, type: 'expired', label: 'Expired automatically',delta: '-100', reason: 'Expired automatically' },
  { id: 5, type: 'updated', label: 'Updated item details', delta: '—',    reason: 'Corrected location' },
];

const DOCUMENTS = [
  { id: 1, filename: 'Nipro_Invoice...',   reason: 'Provided by donor',    initials: 'Ec' },
  { id: 2, filename: 'Notes_for_use...',   reason: '—',                    initials: 'Ka' },
  { id: 3, filename: 'IRS_valuation_s...', reason: 'Used for IRS valuation', initials: 'Ka' },
  { id: 4, filename: 'Donor_Grant_Le...',  reason: 'Grant letter',         initials: 'Li' },
  { id: 5, filename: 'Valuation_SS.pdf',   reason: 'Screenshot',           initials: 'Ac' },
];

// ─── Status dot ────────────────────────────────────────────────────────────

const STATUS_COLORS = {
  danger:  { bg: '#FFEDEB', dot: '#AE2E24' },
  warning: { bg: '#FDF3DC', dot: '#E56910' },
  success: { bg: '#DCFFF1', dot: '#216E4E' },
};

function StatusDot({ status }) {
  const c = STATUS_COLORS[status] || STATUS_COLORS.danger;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 20, height: 20, borderRadius: '50%', backgroundColor: c.bg, flexShrink: 0,
    }}>
      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
        <circle cx="5" cy="5" r="4" fill={c.dot} />
      </svg>
    </span>
  );
}

StatusDot.propTypes = { status: PropTypes.string };

// ─── Activity icon ─────────────────────────────────────────────────────────

const ACTIVITY_CONFIGS = {
  added:   { bg: '#DCFFF1', color: '#216E4E' },
  removed: { bg: '#FFEDEB', color: '#AE2E24' },
  mission: { bg: '#B3D4FF', color: '#0747A6' },
  expired: { bg: '#FFF3EB', color: '#E56910' },
  updated: { bg: '#DEEBFF', color: '#0747A6' },
};

function ActivityIcon({ type }) {
  const c = ACTIVITY_CONFIGS[type] || ACTIVITY_CONFIGS.updated;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 24, height: 24, borderRadius: '50%', backgroundColor: c.bg, flexShrink: 0,
    }}>
      {type === 'added' && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 10V2M2 6l4-4 4 4" stroke={c.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {type === 'removed' && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M6 2v8M2 6l4 4 4-4" stroke={c.color} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {type === 'mission' && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke={c.color} strokeWidth="1.2" />
          <ellipse cx="6" cy="6" rx="1.8" ry="4.5" stroke={c.color} strokeWidth="1.2" />
          <path d="M1.5 6h9" stroke={c.color} strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      )}
      {type === 'expired' && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <circle cx="6" cy="6" r="4.5" stroke={c.color} strokeWidth="1.2" />
          <path d="M6 3.5V6l2 1.5" stroke={c.color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
      {type === 'updated' && (
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M8.5 1.5a1 1 0 0 1 1.414 1.414L3.5 9.414 1.5 10l.586-2L8.5 1.5z" stroke={c.color} strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </span>
  );
}

ActivityIcon.propTypes = { type: PropTypes.string };

// ─── Delta badge ───────────────────────────────────────────────────────────

function DeltaBadge({ value }) {
  const isNeutral = value === '—';
  const isPositive = value.startsWith('+');
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 38, height: 20, padding: '0 6px', borderRadius: 3,
      fontSize: 11, fontWeight: 700,
      backgroundColor: isNeutral ? '#DFE1E6' : isPositive ? '#1F845A' : '#AE2E24',
      color: isNeutral ? '#172B4D' : '#fff',
    }}>
      {value}
    </span>
  );
}

DeltaBadge.propTypes = { value: PropTypes.string };

// ─── Document icon ─────────────────────────────────────────────────────────

function DocIcon() {
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      width: 24, height: 24, backgroundColor: '#579DFF', borderRadius: 4, flexShrink: 0,
    }}>
      <svg width="13" height="13" viewBox="0 0 13 13" fill="none">
        <rect x="1.5" y="0.5" width="10" height="12" rx="1" stroke="white" strokeWidth="0.8" fill="rgba(255,255,255,0.2)" />
        <path d="M3.5 3.5h6M3.5 6h6M3.5 8.5h4" stroke="white" strokeWidth="0.9" strokeLinecap="round" />
      </svg>
    </span>
  );
}

// ─── User icon ─────────────────────────────────────────────────────────────

function UserIcon() {
  return (
    <span style={{ display: 'inline-flex', color: '#626F86' }}>
      <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
        <circle cx="9" cy="6" r="3" stroke="currentColor" strokeWidth="1.3" />
        <path d="M3 16c0-3.314 2.686-5 6-5s6 1.686 6 5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    </span>
  );
}

// ─── Tab bar ───────────────────────────────────────────────────────────────

const TABS = ['Overview', 'Activity', 'Documentation', 'Details'];

function TabBar({ active, onChange }) {
  return (
    <div style={{
      display: 'flex',
      borderBottom: `2px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`,
    }}>
      {TABS.map((tab) => {
        const isActive = tab === active;
        return (
          <button
            key={tab}
            onClick={() => onChange(tab)}
            style={{
              flex: 1,
              padding: '10px 4px',
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: isActive ? 600 : 400,
              fontFamily: 'inherit',
              color: isActive ? '#0747A6' : token('color.text.subtle', '#505258'),
              position: 'relative', marginBottom: -2,
            }}
          >
            {tab}
            {isActive && (
              <span style={{
                position: 'absolute', bottom: 0, left: 4, right: 4,
                height: 3, backgroundColor: '#0747A6', borderRadius: '1px 1px 0 0',
              }} />
            )}
          </button>
        );
      })}
    </div>
  );
}

TabBar.propTypes = { active: PropTypes.string, onChange: PropTypes.func };

// ─── Shared table styles ───────────────────────────────────────────────────

const tHeader = {
  fontSize: 11, fontWeight: 700, color: token('color.text.subtle', '#505258'),
  padding: '4px 8px',
  borderBottom: `2px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`,
  height: 30, textAlign: 'left', whiteSpace: 'nowrap',
};

const tCell = {
  padding: '12px 8px',
  borderBottom: `1px solid ${token('color.border', 'rgba(9,30,66,0.06)')}`,
  fontSize: 13, color: token('color.text', '#172B4D'),
  verticalAlign: 'middle',
};

// ─── Overview tab ──────────────────────────────────────────────────────────

function OverviewTab({ totalQuantity, onAssign, onNewEntry, entries = [] }) {
  const hasWarning = entries.some(e => {
    if (!e.expiration) return false;
    const exp = new Date(e.expiration);
    const threeMonths = new Date();
    threeMonths.setMonth(threeMonths.getMonth() + 3);
    return exp < threeMonths;
  });

  return (
    <>
      {/* Warning banner */}
      {hasWarning && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 12px', backgroundColor: '#FBC828', marginBottom: 16,
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 2L14.928 14H1.072L8 2z" stroke="#292A2E" strokeWidth="1.2" fill="none" />
            <path d="M8 6.5v3M8 11.5v.5" stroke="#292A2E" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 14, fontWeight: 500, color: '#292A2E' }}>
            Some inventory expires within 3 months
          </span>
        </div>
      )}

      {/* Total Available (shown above buttons when warning is present) */}
      {hasWarning && (
        <div style={{ marginBottom: 16 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: token('color.text.subtle', '#505258'), margin: '0 0 8px' }}>
            Total Available
          </p>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '6px 14px', height: 40,
            backgroundColor: '#DDDEE1', borderRadius: 3,
            fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: '#292A2E',
          }}>
            {totalQuantity} UNITS
          </span>
        </div>
      )}

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
          <button
            onClick={onNewEntry}
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#043584'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0747A6'}
            style={{
            flex: 1, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
            backgroundColor: '#0747A6', color: '#fff', border: 'none', borderRadius: 4,
            fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
            transition: 'background-color 0.2s',
          }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
              <path d="M8 3v10M3 8h10" stroke="#fff" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
            New Entry
          </button>
        <button
          onClick={onAssign}
          onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#821E42'}
          onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#A12654'}
          style={{
          flex: 1, height: 48, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
          backgroundColor: '#A12654', color: '#fff', border: 'none', borderRadius: 4,
          fontSize: 14, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit',
          transition: 'background-color 0.2s',
        }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="8" cy="8" r="5.5" stroke="#fff" strokeWidth="1.3" />
            <ellipse cx="8" cy="8" rx="2.2" ry="5.5" stroke="#fff" strokeWidth="1.3" />
            <path d="M2.5 8h11" stroke="#fff" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          Assign to Mission
        </button>
      </div>

      {/* Total Available (shown below buttons when no warning) */}
      {!hasWarning && (
        <div style={{ marginBottom: 24 }}>
          <p style={{ fontSize: 14, fontWeight: 700, color: token('color.text.subtle', '#505258'), margin: '0 0 8px' }}>
            Total Available
          </p>
          <span style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            padding: '6px 14px', height: 40,
            backgroundColor: '#DDDEE1', borderRadius: 3,
            fontSize: 14, fontWeight: 700, textTransform: 'uppercase', color: '#292A2E',
          }}>
            {totalQuantity} UNITS
          </span>
        </div>
      )}

      {/* Inventory Entries Table */}
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color: token('color.text.subtle', '#505258'), margin: '0 0 8px' }}>
          Inventory Entries Table
        </p>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 380 }}>
            <thead>
              <tr>
                <th style={{ ...tHeader, width: 90 }}>Date Added</th>
                <th style={{ ...tHeader, width: 130 }}>Expiration Date</th>
                <th style={{ ...tHeader, width: 68 }}>Quantity</th>
                <th style={tHeader}>Location</th>
              </tr>
            </thead>
            <tbody>
              {entries.map((e) => {
                const isDanger = e.expiration && new Date(e.expiration) < new Date(new Date().setMonth(new Date().getMonth() + 3));
                return (
                  <tr key={e.id}>
                    <td style={tCell}>{new Date(e.created_at).toLocaleDateString()}</td>
                    <td style={tCell}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <StatusDot status={isDanger ? 'danger' : 'success'} />
                        {e.expiration || '—'}
                      </span>
                    </td>
                    <td style={tCell}>
                      <span style={{
                        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        minWidth: 36, padding: '1px 6px',
                        border: '1px solid #B7B9BE', borderRadius: 3,
                        fontSize: 12, fontWeight: 700, color: '#172B4D',
                      }}>
                        {e.quantity}
                      </span>
                    </td>
                    <td style={{ ...tCell, whiteSpace: 'nowrap' }}>{e.location}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  );
}

OverviewTab.propTypes = { totalQuantity: PropTypes.number, onAssign: PropTypes.func, onNewEntry: PropTypes.func };

// ─── Activity tab ──────────────────────────────────────────────────────────

const PAGE_NUMBERS = [1, 2, 3, 4, 5, '...', 12];

function ActivityTab() {
  const [page, setPage] = useState(1);

  const btnStyle = (active) => ({
    minWidth: 24, height: 24, padding: '0 5px',
    border: active ? '2px solid #0747A6' : '1px solid transparent',
    borderRadius: 3, background: 'none', cursor: 'pointer',
    fontSize: 12, fontWeight: active ? 700 : 400,
    color: active ? '#0747A6' : token('color.text', '#172B4D'),
    fontFamily: 'inherit',
  });

  return (
    <>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr>
            <th style={tHeader}>Activity</th>
            <th style={{ ...tHeader, width: 60 }}>Status</th>
            <th style={tHeader}>Reason</th>
          </tr>
        </thead>
        <tbody>
          {ACTIVITY_LOG.map((a) => (
            <tr key={a.id}>
              <td style={tCell}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <ActivityIcon type={a.type} />
                  {a.label}
                </span>
              </td>
              <td style={tCell}>
                <DeltaBadge value={a.delta} />
              </td>
              <td style={{ ...tCell, color: token('color.text.subtle', '#505258') }}>
                {a.reason}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Pagination */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 2, marginTop: 12 }}>
        <button onClick={() => setPage(p => Math.max(1, p - 1))} style={btnStyle(false)}>{'<'}</button>
        {PAGE_NUMBERS.map((p, i) => (
          <button
            key={i}
            onClick={() => typeof p === 'number' && setPage(p)}
            style={btnStyle(p === page)}
          >
            {p}
          </button>
        ))}
        <button onClick={() => setPage(p => Math.min(12, p + 1))} style={btnStyle(false)}>{'>'}</button>
      </div>
    </>
  );
}

// ─── Documentation tab ─────────────────────────────────────────────────────

function DocumentationTab({ totalQuantity, isEditMode, values, draft, onDraftChange }) {
  const marketValue = Number(isEditMode ? draft.marketValue : (values.marketValue || 0));
  const valuationSource = isEditMode ? draft.valuationSource : (values.valuationSource || '—');
  const totalValue = (marketValue * totalQuantity).toFixed(2);

  return (
    <>
      {/* Total Value */}
      <div style={{ marginBottom: 24 }}>
        <p style={{ fontSize: 14, fontWeight: 700, color: token('color.text', '#172B4D'), margin: '0 0 10px' }}>
          Total Value
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" aria-hidden="true">
            <circle cx="9" cy="9" r="7.5" stroke="#626F86" strokeWidth="1.3" />
            <path d="M9 4.5v1.2M9 12.3V13.5M6.8 7C6.8 5.9 7.8 5 9 5h.5C10.9 5 12 6.1 12 7.3c0 1-.6 1.8-1.5 2L9 9.5C8 10 6.8 11 6.8 12c0 1.1 1 2 2.2 2H9.5c1.2 0 2.2-.9 2.2-2" stroke="#626F86" strokeWidth="1.1" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 20, fontWeight: 700, color: token('color.text', '#172B4D') }}>${totalValue}</span>
        </div>

        <div style={{ display: 'flex', gap: 32, marginBottom: 14 }}>
          <div>
            <p style={{ fontSize: 12, color: token('color.text.subtle', '#505258'), margin: '0 0 3px' }}>Market Value per Unit</p>
            {isEditMode ? (
              <input
                type="number"
                min="0"
                step="0.01"
                value={draft.marketValue}
                onChange={(e) => onDraftChange('marketValue', e.target.value)}
                style={{
                  width: 140,
                  boxSizing: 'border-box',
                  padding: '6px 8px',
                  borderRadius: 3,
                  border: '2px solid #2684FF',
                  fontSize: 14,
                  fontFamily: 'inherit',
                  color: token('color.text', '#172B4D'),
                  backgroundColor: '#fff',
                  outline: 'none',
                }}
              />
            ) : (
              <p style={{ fontSize: 14, color: token('color.text', '#172B4D'), margin: 0 }}>${marketValue}</p>
            )}
          </div>
          <div>
            <p style={{ fontSize: 12, color: token('color.text.subtle', '#505258'), margin: '0 0 3px' }}>Date Value Researched</p>
            <p style={{ fontSize: 14, color: token('color.text', '#172B4D'), margin: 0 }}>{new Date().toISOString().split('T')[0]}</p>
          </div>
        </div>

        <div>
          <p style={{ fontSize: 12, color: token('color.text.subtle', '#505258'), margin: '0 0 4px' }}>Valuation Source</p>
          {isEditMode ? (
            <input
              type="text"
              value={draft.valuationSource}
              onChange={(e) => onDraftChange('valuationSource', e.target.value)}
              style={{
                width: '100%',
                boxSizing: 'border-box',
                padding: '6px 8px',
                borderRadius: 3,
                border: '2px solid #2684FF',
                fontSize: 14,
                fontFamily: 'inherit',
                color: token('color.text', '#172B4D'),
                backgroundColor: '#fff',
                outline: 'none',
              }}
            />
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M5.5 7a1.75 1.75 0 0 0 1.75 1.75h1.75a1.75 1.75 0 0 0 0-3.5H8.5M8.5 7a1.75 1.75 0 0 0-1.75-1.75H5a1.75 1.75 0 0 0 0 3.5h.75" stroke="var(--ds-link)" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
              <span style={{ fontSize: 14, color: 'var(--ds-link)', wordBreak: 'break-all' }}>{valuationSource}</span>
            </div>
          )}
        </div>
      </div>

      {/* Supporting Documents */}
      <div>
        <p style={{ fontSize: 14, fontWeight: 700, color: token('color.text', '#172B4D'), margin: '0 0 8px' }}>
          Supporting Documents
        </p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th style={tHeader}>Activity</th>
              <th style={tHeader}>Reason</th>
              <th style={{ ...tHeader, width: 40 }}>User</th>
            </tr>
          </thead>
          <tbody>
            {DOCUMENTS.map((doc) => (
              <tr key={doc.id}>
                <td style={tCell}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <DocIcon />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 110 }}>
                      {doc.filename}
                    </span>
                  </span>
                </td>
                <td style={{ ...tCell, color: token('color.text.subtle', '#505258') }}>
                  {doc.reason}
                </td>
                <td style={tCell}>
                  <UserIcon />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

// ─── Details tab ───────────────────────────────────────────────────────────

const DEFAULT_DETAIL_VALUES = {
  company:      'Nipro',
  reference:    'IS-170/AVF/RL/H-WB',
  lotNumber:    'N/A',
  unitOfMeasure:'Unit',
  shelfLife:    'Does Not Expire',
  location:     'Cabinet 15 Shelf 3A',
  notes:        'No notes for this item :)',
};

const SHELF_LIFE_OPTIONS = ['Does Not Expire', '1 Year', '2 Years', '3 Years', '5 Years'];

function DetailsTab({ isFullEdit, onExitFullEdit, item, onSave }) {
  const [saved, setSaved]         = useState({
    company:      item?.company || '',
    reference:    item?.reference || '',
    lotNumber:    item?.lot_number || 'N/A',
    unitOfMeasure:item?.unit_of_measure || 'Unit',
    shelfLife:    item?.shelf_life || 'Does Not Expire',
    location:     item?.location || '',
    notes:        item?.notes || '',
  });
  const [draft, setDraft]         = useState(saved);
  
  useEffect(() => {
    if (item) {
        const newState = {
            company:      item.company || '',
            reference:    item.reference || '',
            lotNumber:    item.lot_number || 'N/A',
            unitOfMeasure:item.unit_of_measure || 'Unit',
            shelfLife:    item.shelf_life || 'Does Not Expire',
            location:     item.location || '',
            notes:        item.notes || '',
        };
        setSaved(newState);
        setDraft(newState);
    }
  }, [item]);
  const [editing, setEditing]     = useState(null); // field key or null
  const [hovered, setHovered]     = useState(null); // field key or null
  const [tempVal, setTempVal]     = useState('');

  const startEdit = (field) => {
    setEditing(field);
    setTempVal(saved[field]);
    setHovered(null);
  };

  const commitEdit = async () => {
    const field = editing;
    const value = tempVal;
    setSaved(prev => ({ ...prev, [field]: value }));
    setDraft(prev => ({ ...prev, [field]: value }));
    setEditing(null);

    // Persist single-field edit to Supabase
    try {
      const inventoryFields = { company: 'company', reference: 'reference_number', unitOfMeasure: 'unit_of_measure', shelfLife: 'shelf_life', notes: 'notes' };
      const shipmentFields = { location: 'location', lotNumber: 'lot_number' };

      if (inventoryFields[field] && item?.inventory_id) {
        await supabase.from('inventory').update({ [inventoryFields[field]]: value }).eq('id', item.inventory_id);
      } else if (shipmentFields[field] && item?.id) {
        await supabase.from('shipments').update({ [shipmentFields[field]]: value }).eq('id', item.id);
      }
      onSave?.();
    } catch (err) {
      console.error('Inline save failed:', err);
    }
  };

  const cancelEdit = () => {
    setTempVal('');
    setEditing(null);
  };

  const setFullDraft = (field, val) => {
    setDraft(prev => ({ ...prev, [field]: val }));
  };

  const saveAll = async () => {
    try {
      // Update inventory table
      if (item.inventory_id) {
        await supabase
          .from('inventory')
          .update({
            company: draft.company,
            reference_number: draft.reference,
            unit_of_measure: draft.unitOfMeasure,
            shelf_life: draft.shelfLife,
            notes: draft.notes
          })
          .eq('id', item.inventory_id);
      }
      
      // Update shipments table (for location & lot_number)
      await supabase
        .from('shipments')
        .update({
          location: draft.location,
          lot_number: draft.lotNumber
        })
        .eq('id', item.id);

      setSaved({ ...draft });
      onSave?.(); // Refresh parent
      onExitFullEdit();
    } catch (err) {
      console.error('Save failed:', err);
    }
  };

  const cancelAll = () => {
    setDraft({ ...saved });
    onExitFullEdit();
  };

  const labelSt = {
    fontSize: 12,
    color: token('color.text.subtle', '#505258'),
    margin: '0 0 4px', display: 'block',
  };

  // Renders a field in read/hover/inline-edit mode (single field at a time)
  const renderField = (field, isTextArea = false) => {
    const isEditing = editing === field;
    const isHov = hovered === field && !editing;
    const value = saved[field];

    const boxBase = {
      width: '100%', boxSizing: 'border-box',
      height: isTextArea ? 'auto' : 40,
      padding: isTextArea ? '8px 10px' : '0 10px',
      borderRadius: 3, fontSize: 14, fontFamily: 'inherit',
      color: token('color.text', '#172B4D'),
      backgroundColor: isEditing ? '#fff' : isHov ? '#fff' : 'rgba(9,30,66,0.04)',
      border: isEditing
        ? '2px solid #2684FF'
        : isHov
        ? `1px solid rgba(9,30,66,0.25)`
        : `1px solid rgba(9,30,66,0.08)`,
      outline: 'none',
    };

    if (isEditing) {
      return (
        <div>
          {isTextArea ? (
            <textarea
              value={tempVal}
              onChange={e => setTempVal(e.target.value)}
              autoFocus
              rows={4}
              style={{ ...boxBase, resize: 'vertical', lineHeight: '1.5', display: 'block' }}
            />
          ) : (
            <input
              type="text"
              value={tempVal}
              onChange={e => setTempVal(e.target.value)}
              autoFocus
              style={{ ...boxBase, display: 'block' }}
            />
          )}
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 6 }}>
            <button onClick={commitEdit} style={iconBtnSt('#1F845A')}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button onClick={cancelEdit} style={iconBtnSt('#AE2E24')}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      );
    }

    if (isTextArea) {
      return (
        <div
          style={{ ...boxBase, minHeight: 56, cursor: 'pointer', whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}
          onClick={() => startEdit(field)}
          onMouseEnter={() => setHovered(field)}
          onMouseLeave={() => setHovered(null)}
        >
          {value}
        </div>
      );
    }

    return (
      <div
        style={{ ...boxBase, display: 'flex', alignItems: 'center', cursor: 'pointer' }}
        onClick={() => startEdit(field)}
        onMouseEnter={() => setHovered(field)}
        onMouseLeave={() => setHovered(null)}
      >
        {value}
      </div>
    );
  };

  // Renders a field in full-edit mode (all fields editable at once)
  const renderFullEditField = (field, isTextArea = false, isSelect = false) => {
    const inputSt = {
      width: '100%', boxSizing: 'border-box',
      height: 40, padding: '0 10px', borderRadius: 3,
      border: `1px solid rgba(9,30,66,0.20)`,
      fontSize: 14, fontFamily: 'inherit',
      color: token('color.text', '#172B4D'),
      backgroundColor: '#fff', outline: 'none',
    };

    if (isSelect) {
      return (
        <div style={{ position: 'relative' }}>
          <select
            value={draft[field]}
            onChange={e => setFullDraft(field, e.target.value)}
            style={{ ...inputSt, appearance: 'none', cursor: 'pointer', paddingRight: 28 }}
          >
            {SHELF_LIFE_OPTIONS.map(o => <option key={o}>{o}</option>)}
          </select>
          <svg style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
            width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 5l4 4 4-4" stroke="#626F86" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
      );
    }
    if (isTextArea) {
      return (
        <textarea
          value={draft[field]}
          onChange={e => setFullDraft(field, e.target.value)}
          rows={5}
          style={{ ...inputSt, resize: 'vertical', lineHeight: '1.5' }}
        />
      );
    }
    return (
      <input
        type="text"
        value={draft[field]}
        onChange={e => setFullDraft(field, e.target.value)}
        style={inputSt}
      />
    );
  };

  // Shelf-life field in read/hover/edit mode (always has dropdown chevron)
  const renderShelfLife = () => {
    if (isFullEdit) return renderFullEditField('shelfLife', false, true);
    if (editing === 'shelfLife') {
      return (
        <div>
          <div style={{ position: 'relative' }}>
            <select
              value={tempVal}
              onChange={e => setTempVal(e.target.value)}
              autoFocus
              style={{
                width: '100%', boxSizing: 'border-box',
                padding: '8px 28px 8px 10px', borderRadius: 3,
                border: '2px solid #2684FF',
                fontSize: 14, fontFamily: 'inherit', backgroundColor: '#fff',
                color: token('color.text', '#172B4D'), outline: 'none', appearance: 'none',
              }}
            >
              {SHELF_LIFE_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
            <svg style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none' }}
              width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 5l4 4 4-4" stroke="#626F86" strokeWidth="1.3" strokeLinecap="round" />
            </svg>
          </div>
          <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end', marginTop: 6 }}>
            <button onClick={commitEdit} style={iconBtnSt('#1F845A')}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2 6l3 3 5-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button onClick={cancelEdit} style={iconBtnSt('#AE2E24')}>
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M3 3l6 6M9 3l-6 6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      );
    }

    const isHov = hovered === 'shelfLife' && !editing;
    return (
      <div
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 10px', borderRadius: 3,
          border: isHov ? `1px solid rgba(9,30,66,0.25)` : `1px solid rgba(9,30,66,0.08)`,
          backgroundColor: isHov ? '#fff' : 'rgba(9,30,66,0.04)',
          cursor: 'pointer', fontSize: 14, color: token('color.text', '#172B4D'),
          minHeight: 36, boxSizing: 'border-box',
        }}
        onClick={() => startEdit('shelfLife')}
        onMouseEnter={() => setHovered('shelfLife')}
        onMouseLeave={() => setHovered(null)}
      >
        {saved.shelfLife}
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
          <path d="M3 5l4 4 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </div>
    );
  };

  const metaLabel = { fontSize: 12, color: token('color.text.subtle', '#505258'), margin: '0 0 2px', display: 'block' };
  const metaValue = { fontSize: 14, color: token('color.text', '#172B4D'), margin: 0 };
  const formatStamp = (value) => {
    if (!value) return '—';
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return '—';
    return d.toLocaleString();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>

      {/* Full-edit save/cancel bar */}
      {isFullEdit && (
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8 }}>
          <button onClick={cancelAll} style={{
            padding: '4px 12px', borderRadius: 3,
            border: `1px solid rgba(9,30,66,0.14)`, background: '#fff',
            cursor: 'pointer', fontSize: 13, fontFamily: 'inherit',
            color: token('color.text', '#172B4D'),
          }}>Cancel</button>
          <button onClick={saveAll} style={{
            padding: '4px 12px', borderRadius: 3,
            border: 'none', background: '#0747A6',
            cursor: 'pointer', fontSize: 13, fontFamily: 'inherit', color: '#fff',
          }}>Save</button>
        </div>
      )}

      {/* Manufacturing Company */}
      <div>
        <span style={labelSt}>Manufacturing Company</span>
        {isFullEdit ? renderFullEditField('company') : renderField('company')}
      </div>

      {/* Reference Number + Lot Number */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <span style={labelSt}>Reference Number #</span>
          {isFullEdit ? renderFullEditField('reference') : renderField('reference')}
        </div>
        <div style={{ flex: 1 }}>
          <span style={labelSt}>Lot Number #</span>
          {isFullEdit ? renderFullEditField('lotNumber') : renderField('lotNumber')}
        </div>
      </div>

      {/* Unit of Measure + Typical Shelf Life */}
      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <span style={labelSt}>Unit of Measure</span>
          {isFullEdit ? renderFullEditField('unitOfMeasure') : renderField('unitOfMeasure')}
        </div>
        <div style={{ flex: 1 }}>
          <span style={labelSt}>Typical Shelf Life</span>
          {renderShelfLife()}
        </div>
      </div>

      {/* Location */}
      <div>
        <span style={labelSt}>Location</span>
        {isFullEdit ? renderFullEditField('location') : renderField('location')}
      </div>

      <div style={{ height: 1, backgroundColor: 'rgba(9,30,66,0.08)', margin: '2px 0' }} />

      {/* Created By + Created Date (read-only metadata) */}
      <div style={{ display: 'flex', gap: 24 }}>
        <div style={{ flex: 1 }}>
          <span style={metaLabel}>Created By</span>
          <p style={metaValue}>Edin Le</p>
        </div>
        <div style={{ flex: 1 }}>
          <span style={metaLabel}>Created Date</span>
          <p style={metaValue}>{formatStamp(item?.created_at)}</p>
        </div>
      </div>

      {/* Last Updated */}
      <div>
        <span style={metaLabel}>Last Updated</span>
        <p style={metaValue}>{formatStamp(item?.updated_at)}</p>
      </div>

      {/* Internal Notes */}
      <div>
        <span style={labelSt}>Internal Notes</span>
        {isFullEdit ? renderFullEditField('notes', true) : renderField('notes', true)}
      </div>
    </div>
  );
}

DetailsTab.propTypes = {
  isFullEdit: PropTypes.bool,
  onExitFullEdit: PropTypes.func,
};

function iconBtnSt(color) {
  return {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: 26, height: 26, borderRadius: 3,
    border: `1px solid ${color}`, background: 'none',
    cursor: 'pointer', color, flexShrink: 0,
  };
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function OverviewPanel({ isOpen, onClose, item, onEdit, onAssign, onNewEntry, onSave }) {
  const [tab, setTab]             = useState('Overview');
  const [isFullEdit, setIsFullEdit] = useState(false);
  const [isDocEdit, setIsDocEdit] = useState(false);
  const [docValues, setDocValues] = useState({ marketValue: '', valuationSource: '' });
  const [docDraft, setDocDraft] = useState({ marketValue: '', valuationSource: '' });
  const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
  const [status, setStatus]       = useState('available');
  const [entries, setEntries]     = useState([]);
  const [loading, setLoading]     = useState(false);

  useEffect(() => {
    if (item && isOpen) {
      fetchEntries();
      setStatus(item.status || 'available');
      const nextDocValues = {
        marketValue: item.market_value != null ? String(item.market_value) : '',
        valuationSource: item.valuation_source || '',
      };
      setDocValues(nextDocValues);
      setDocDraft({
        marketValue: nextDocValues.marketValue,
        valuationSource: nextDocValues.valuationSource,
      });
      setIsDocEdit(false);
    }
  }, [item, isOpen]);

  const fetchEntries = async () => {
    if (!item?.inventory_id) return;
    setLoading(true);
    const { data } = await supabase
      .from('shipments')
      .select('*')
      .eq('inventory_id', item.inventory_id);
    if (data) setEntries(data);
    setLoading(false);
  };

  if (!item) return null;

  const totalQuantity = entries.reduce((sum, e) => sum + (e.quantity || 0), 0);
  const itemName  = item.description || 'Infusion Set';
  const refNumber = item.reference   || '—';
  const location  = item.location    || '—';
  const expDate   = item.expiration === '—' ? 'No Expiration' : `EXP ${item.expiration}`;

  const handleClose = () => {
    setTab('Overview');
    setIsFullEdit(false);
    setIsDocEdit(false);
    onClose();
  };

  const handleTabChange = (t) => {
    setTab(t);
    if (t !== 'Details') setIsFullEdit(false);
    if (t !== 'Documentation') setIsDocEdit(false);
  };

  const saveDocumentation = async () => {
    try {
      const { error } = await supabase
        .from('shipments')
        .update({
          market_value: docDraft.marketValue === '' ? null : Number(docDraft.marketValue),
          valuation_source: docDraft.valuationSource || null,
        })
        .eq('id', item.id);
      if (error) throw error;
      setDocValues({ ...docDraft });
      setIsDocEdit(false);
      onSave?.();
    } catch (err) {
      console.error('Documentation save failed:', err);
      const errMsg = String(err?.message || err);
      if (/market_value|valuation_source|does not exist/i.test(errMsg)) {
        alert('Failed to save valuation data because the database schema is missing valuation columns on shipments. Run the SQL migration in supabase/migrations/20260409_add_valuation_columns.sql, then try again.');
      } else {
        alert('Failed to save valuation data. Please check your permissions and try again.');
      }
    }
  };

  const handleEditItem = () => {
    if (tab === 'Details' && !isFullEdit) {
      setIsFullEdit(true);
    } else if (tab === 'Documentation' && !isDocEdit) {
      setIsDocEdit(true);
    } else if (tab === 'Documentation' && isDocEdit) {
      saveDocumentation();
    } else if (tab !== 'Details') {
      onEdit?.(item);
    }
  };

  return (
    <SlidePanel isOpen={isOpen} onClose={handleClose}>
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <div style={{ padding: '12px 20px 12px 48px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', height: 53, boxSizing: 'border-box', backgroundColor: '#fff' }}>
          <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: token('color.text', '#172B4D') }}>
            {itemName}
          </h2>
        </div>

        {/* Scrollable content */}
        <div style={{
          flex: 1, overflowY: 'auto',
          backgroundColor: token('elevation.surface.sunken', '#F8F8F8'),
          padding: '24px',
        }}>

          {/* Header badges */}
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 16,
          }}>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <button
                onClick={() => setIsStatusModalOpen(true)}
                style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 4,
                  height: 22, padding: '0 8px', borderRadius: 3,
                  backgroundColor: status === 'available' ? '#E3FCEF' : '#E9F2FF',
                  color: status === 'available' ? '#006644' : 'var(--ds-link)',
                  border: '1px solid transparent', cursor: 'pointer',
                  fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em',
                  fontFamily: 'inherit', transition: 'background-color 0.2s',
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = status === 'available' ? '#D3F1E7' : '#DEEBFF'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = status === 'available' ? '#E3FCEF' : '#E9F2FF'}
              >
                {status.replace('-', ' ')}
                <svg width="10" height="10" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span style={{
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                height: 22, padding: '0 8px', borderRadius: 3,
                backgroundColor: 'transparent', color: '#AE2E24',
                border: '1px solid #AE2E24',
                fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em',
              }}>
                {expDate}
              </span>
            </div>
            <span style={{
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              height: 22, padding: '0 8px', borderRadius: 3,
              backgroundColor: '#DFE1E6', color: '#44546F',
              border: '1px solid transparent',
              fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.03em',
            }}>
              {totalQuantity} Units
            </span>
          </div>

          {/* Subtitle */}
          <div style={{ marginBottom: 16 }}>
            <p style={{
              margin: 0, fontSize: 14,
              color: token('color.text.subtle', '#505258'),
            }}>
              {refNumber} · {location}
            </p>
          </div>

          {/* Tab bar */}
          <TabBar active={tab} onChange={handleTabChange} />

          {/* Tab content */}
          <div style={{ paddingTop: 20 }}>
            {tab === 'Overview'       && <OverviewTab totalQuantity={totalQuantity} onAssign={onAssign} onNewEntry={onNewEntry} entries={entries} />}
            {tab === 'Activity'       && <ActivityTab />}
            {tab === 'Documentation'  && (
              <DocumentationTab
                totalQuantity={totalQuantity}
                isEditMode={isDocEdit}
                values={docValues}
                draft={docDraft}
                onDraftChange={(field, value) => setDocDraft(prev => ({ ...prev, [field]: value }))}
              />
            )}
            {tab === 'Details'        && (
              <DetailsTab
                isFullEdit={isFullEdit}
                onExitFullEdit={() => setIsFullEdit(false)}
                item={item}
                onSave={() => { fetchEntries(); onSave?.(); }}
              />
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', justifyContent: 'flex-end', gap: 8,
          padding: '12px 16px',
          backgroundColor: token('elevation.surface', '#fff'),
          borderTop: `1px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`,
        }}>
          <button
            onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#043584'}
            onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#0747A6'}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              height: 32, padding: '0 12px',
              backgroundColor: '#0747A6', color: '#fff',
              border: 'none', borderRadius: 3,
              fontSize: 14, fontWeight: 500, fontFamily: 'inherit',
              cursor: 'pointer', transition: 'background-color 0.2s',
            }}
            onClick={handleEditItem}
          >
            {tab === 'Documentation' && isDocEdit
              ? '✏ Save Valuation'
              : isFullEdit
              ? '✏ Save Changes'
              : '✏ Edit Item'}
          </button>
        </div>
      </div>
      <ItemStatusModal
        isOpen={isStatusModalOpen}
        onClose={() => setIsStatusModalOpen(false)}
        itemName={itemName}
        currentStatus={status}
        onSave={(newStatus, _reason) => {
          setStatus(newStatus);
          setIsStatusModalOpen(false);
        }}
      />
    </SlidePanel>
  );
}

OverviewPanel.propTypes = {
  isOpen:  PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  item:    PropTypes.object,
  onEdit:  PropTypes.func,
};
