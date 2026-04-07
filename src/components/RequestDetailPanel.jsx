import { token } from '@atlaskit/tokens';
import SlidePanel from './SlidePanel';

export default function RequestDetailPanel({ isOpen, onClose, request, onUpdateStatus }) {
  if (!request) return null;

  const labelSt = { fontSize: 12, color: token('color.text.subtle', '#505258'), margin: '0 0 4px', display: 'block' };
  const valSt = { fontSize: 14, color: token('color.text', '#172B4D'), margin: 0, fontWeight: 500 };

  return (
    <SlidePanel isOpen={isOpen} onClose={onClose} width={480}>
      <div style={{ padding: '32px 24px', flex: 1, overflowY: 'auto' }}>
        <h2 style={{ margin: '0 0 8px', fontSize: 24, fontWeight: 700, color: token('color.text', '#172B4D') }}>
          {request.id}
        </h2>
        <p style={{ margin: '0 0 24px', fontSize: 14, color: '#626F86' }}>Requested by {request.requester}</p>
        
        {request.status === 'Pending' && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 32 }}>
            <button 
              onClick={() => onUpdateStatus(request.id, 'Approved')} 
              style={{ flex: 1, padding: '8px 16px', backgroundColor: '#1F845A', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              Approve
            </button>
            <button 
              onClick={() => onUpdateStatus(request.id, 'Declined')} 
              style={{ flex: 1, padding: '8px 16px', backgroundColor: '#AE2E24', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer' }}>
              Deny
            </button>
          </div>
        )}
        {(request.status === 'Approved' || request.status === 'Declined') && (
           <div style={{ marginBottom: 32, padding: '12px 16px', borderRadius: 4, backgroundColor: request.status === 'Approved' ? '#E3FCEF' : '#FFEBE6', color: request.status === 'Approved' ? '#006644' : '#BF2600', fontWeight: 500 }}>
             This request has been {request.status.toLowerCase()}.
           </div>
        )}

        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#172B4D', marginBottom: 16, borderBottom: '1px solid #e8e8e8', paddingBottom: 8 }}>Request Details</h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
          <div>
            <span style={labelSt}>Mission</span>
            <p style={valSt}>{request.mission}</p>
          </div>
          <div>
            <span style={labelSt}>Priority</span>
            <p style={valSt}>{request.priority}</p>
          </div>
          <div>
            <span style={labelSt}>Status</span>
            <p style={valSt}>{request.status}</p>
          </div>
          <div>
            <span style={labelSt}>Date Created</span>
            <p style={valSt}>{request.date}</p>
          </div>
        </div>

        <h3 style={{ fontSize: 16, fontWeight: 600, color: '#172B4D', marginBottom: 16, borderBottom: '1px solid #e8e8e8', paddingBottom: 8 }}>Items Requested</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
          <thead>
            <tr>
              <th style={{ textAlign: 'left', padding: '8px 0', borderBottom: '1px solid #e8e8e8', color: '#626F86', fontWeight: 600 }}>Item Description</th>
              <th style={{ textAlign: 'right', padding: '8px 0', borderBottom: '1px solid #e8e8e8', color: '#626F86', fontWeight: 600 }}>Quantity</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td style={{ padding: '12px 0', borderBottom: '1px solid #e8e8e8', color: '#172B4D' }}>Pulse Oximeter</td>
              <td style={{ textAlign: 'right', padding: '12px 0', borderBottom: '1px solid #e8e8e8', color: '#172B4D', fontWeight: 500 }}>5</td>
            </tr>
            <tr>
              <td style={{ padding: '12px 0', borderBottom: '1px solid #e8e8e8', color: '#172B4D' }}>Surgical Masks (Box of 50)</td>
              <td style={{ textAlign: 'right', padding: '12px 0', borderBottom: '1px solid #e8e8e8', color: '#172B4D', fontWeight: 500 }}>20</td>
            </tr>
            <tr>
              <td style={{ padding: '12px 0', borderBottom: '1px solid #e8e8e8', color: '#172B4D' }}>IV Cannula 20G</td>
              <td style={{ textAlign: 'right', padding: '12px 0', borderBottom: '1px solid #e8e8e8', color: '#172B4D', fontWeight: 500 }}>100</td>
            </tr>
          </tbody>
        </table>
      </div>
    </SlidePanel>
  );
}
