import { useState, useRef, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import SlidePanel from './SlidePanel';

// ─── Sample inventory for suggested items ─────────────────────────────────────

const SUGGESTED_ITEMS = [
  { id: 1,  description: 'i-Stat User guide',          company: 'Abbott',  qty: 10,   ref: '609874325', warning: false },
  { id: 2,  description: 'Eclipse Needle 18G x 1.5in', company: 'Abbott',  qty: 2433, ref: '305766',    warning: false },
  { id: 3,  description: 'Sterilizable Gas + Steam...', company: 'Nipro',   qty: 342,  ref: 'IS-170/AVF/RL/H-WB', warning: true },
  { id: 4,  description: 'Text',                        company: 'Text',    qty: 10,   ref: '',          warning: false },
  { id: 5,  description: 'Text',                        company: 'Text',    qty: 10,   ref: '',          warning: false },
  { id: 6,  description: 'Text',                        company: 'Text',    qty: 10,   ref: '',          warning: false },
  { id: 7,  description: 'Text',                        company: 'Text',    qty: 10,   ref: '',          warning: false },
  { id: 8,  description: 'Text',                        company: 'Text',    qty: 0,    ref: '',          warning: false },
  { id: 9,  description: 'Text',                        company: 'Text',    qty: 0,    ref: '',          warning: false },
  { id: 10, description: 'Text',                        company: 'Text',    qty: 0,    ref: '',          warning: false },
];

const CATEGORIES = ['ENT', 'Cardiac', 'General', 'Ortho', 'Plastics', 'Infections', 'Dental'];
const LOCATIONS  = ['Dar es Salaam', 'Kampala', 'Guatemala City', 'Lima', 'Hanoi'];

// ─── Shared Form Primitives ───────────────────────────────────────────────────

function Label({ children, required }) {
  return (
    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#172B4D', marginBottom: 4 }}>
      {children}{required && <span style={{ color: '#c62828' }}> *</span>}
    </label>
  );
}

function TextInput({ placeholder, value, onChange, type = 'text' }) {
  const [focused, setFocused] = useState(false);
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={e => onChange(e.target.value)}
      onFocus={() => setFocused(true)}
      onBlur={() => setFocused(false)}
      style={{
        width: '100%', height: 36, padding: '0 10px',
        border: `1px solid ${focused ? '#422670' : '#d9d9d9'}`,
        borderRadius: 4, fontSize: 14, fontFamily: 'inherit',
        outline: 'none', boxSizing: 'border-box',
        backgroundColor: '#fff',
      }}
    />
  );
}

function SelectInput({ placeholder, options, value, onChange }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ position: 'relative' }}>
      <select
        value={value}
        onChange={e => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{
          width: '100%', height: 36, padding: '0 10px',
          border: `1px solid ${focused ? '#422670' : '#d9d9d9'}`,
          borderRadius: 4, fontSize: 14, fontFamily: 'inherit',
          outline: 'none', appearance: 'none', cursor: 'pointer',
          backgroundColor: '#fff', color: value ? '#172B4D' : '#8590A2',
        }}
      >
        <option value="">{placeholder}</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
      <span style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#626F86' }}>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
          <path d="M3 4l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      </span>
    </div>
  );
}

// ─── Step 1: Mission Details Form ─────────────────────────────────────────────

function Step1({ form, setForm, onCancel, onNext }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #e8e8e8' }}>
        <button onClick={onCancel} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 12, color: '#44546F', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700, color: '#000' }}>New Mission</h2>
        <p style={{ margin: 0, fontSize: 12, color: '#626F86' }}>* indicates a required field</p>
      </div>

      {/* Form body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ marginBottom: 16 }}>
          <Label required>Name</Label>
          <TextInput placeholder="Placeholder" value={form.name} onChange={v => setForm(f => ({ ...f, name: v }))} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label>Description</Label>
          <TextInput placeholder="Placeholder" value={form.description} onChange={v => setForm(f => ({ ...f, description: v }))} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <Label required>Date</Label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="12/18/22 - 12/24/22"
                value={form.date}
                onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
                style={{
                  width: '100%', height: 36, padding: '0 30px 0 10px',
                  border: '1px solid #d9d9d9', borderRadius: 4,
                  fontSize: 13, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
                }}
              />
              <span style={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', pointerEvents: 'none', color: '#626F86' }}>
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                  <rect x="1" y="2" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                  <path d="M5 1v2M9 1v2M1 5h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                </svg>
              </span>
            </div>
          </div>
          <div>
            <Label required>Category</Label>
            <SelectInput placeholder="Select" options={CATEGORIES} value={form.category} onChange={v => setForm(f => ({ ...f, category: v }))} />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label required>Location</Label>
          <SelectInput placeholder="Placeholder" options={LOCATIONS} value={form.location} onChange={v => setForm(f => ({ ...f, location: v }))} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label required>Doctor Name</Label>
          <TextInput placeholder="Placeholder" value={form.doctorName} onChange={v => setForm(f => ({ ...f, doctorName: v }))} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label required>Doctor's Email</Label>
          <TextInput placeholder="Placeholder" type="email" value={form.doctorEmail} onChange={v => setForm(f => ({ ...f, doctorEmail: v }))} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label>Doctor's Phone</Label>
          <TextInput placeholder="555-555-5555" type="tel" value={form.doctorPhone} onChange={v => setForm(f => ({ ...f, doctorPhone: v }))} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label>Team Members</Label>
          <SelectInput placeholder="Placeholder" options={['Dr. Smith', 'Dr. Jones', 'Nurse Joy', 'Dr. Kim']} value={form.teamMembers} onChange={v => setForm(f => ({ ...f, teamMembers: v }))} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label>Budget</Label>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', fontSize: 14, color: '#626F86' }}>$</span>
            <input
              type="text"
              value={form.budget}
              onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
              style={{
                width: '100%', height: 36, paddingLeft: 22, paddingRight: 10,
                border: '1px solid #d9d9d9', borderRadius: 4,
                fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label>Documents</Label>
          <button style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            height: 32, padding: '0 12px',
            border: '1px solid #d9d9d9', borderRadius: 4,
            background: '#fff', cursor: 'pointer',
            fontSize: 13, fontFamily: 'inherit', color: '#172B4D',
          }}>
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M7 1v8M4 4l3-3 3 3M2 10v2a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-2" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            Upload
          </button>
        </div>
      </div>

      {/* Footer */}
      <div style={{
        padding: '16px 24px', borderTop: '1px solid #e8e8e8',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}>
        <button onClick={onCancel} style={{ height: 36, padding: '0 16px', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', color: '#172B4D' }}>
          Cancel
        </button>
        <button
          onClick={onNext}
          style={{
            height: 36, padding: '0 16px',
            border: 'none', borderRadius: 4,
            background: form.name && form.category && form.doctorName && form.doctorEmail ? '#422670' : '#e8e8e8',
            color: form.name && form.category && form.doctorName && form.doctorEmail ? '#fff' : '#8590A2',
            cursor: 'pointer', fontSize: 14, fontFamily: 'inherit',
            display: 'flex', alignItems: 'center', gap: 6,
          }}
        >
          Next
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </button>
      </div>
    </div>
  );
}

// ─── Step 2: Add Suggested Items ──────────────────────────────────────────────

function Step2({ form, onCancel, onBack, onSkip }) {
  const [search, setSearch]   = useState('');
  const [selected, setSelected] = useState({});
  const [qtys, setQtys]       = useState({});

  const toggle = (id) => setSelected(s => ({ ...s, [id]: !s[id] }));
  const setQty = (id, v) => setQtys(q => ({ ...q, [id]: v }));

  const filtered = SUGGESTED_ITEMS.filter(i =>
    !search || i.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid #e8e8e8' }}>
        <button onClick={onBack} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, marginBottom: 12, color: '#44546F', display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
        <h2 style={{ margin: '0 0 6px', fontSize: 22, fontWeight: 700, color: '#000' }}>Add Suggested Items</h2>
        <p style={{ margin: 0, fontSize: 13, color: '#626F86' }}>Choose from Items in current inventory to quickly add</p>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#172B4D', marginBottom: 4 }}>Search</label>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <span style={{ position: 'absolute', left: 10, color: '#8590A2', display: 'flex' }}>
              <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: '100%', height: 36, paddingLeft: 32, paddingRight: 10,
                border: '1px solid #d9d9d9', borderRadius: 4,
                fontSize: 14, fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box',
              }}
            />
          </div>
        </div>

        {/* Recommended table */}
        <h3 style={{ margin: '0 0 10px', fontSize: 14, fontWeight: 600, color: '#000' }}>
          Recommended for {form.category || 'ENT'}
        </h3>
        <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
          {/* Table head */}
          <div style={{ display: 'grid', gridTemplateColumns: '32px 60px 1fr 80px', backgroundColor: '#FAFBFC', borderBottom: '1px solid #e8e8e8', padding: '8px 10px', gap: 8 }}>
            {['Select', 'Quantity', 'Item Description', 'Manufacturer'].map(h => (
              <span key={h} style={{ fontSize: 11, fontWeight: 700, color: '#626F86', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</span>
            ))}
          </div>
          {filtered.map(item => (
            <div
              key={item.id}
              style={{
                display: 'grid', gridTemplateColumns: '32px 60px 1fr 80px',
                padding: '8px 10px', gap: 8, alignItems: 'center',
                borderBottom: '1px solid #f0f0f0',
                backgroundColor: selected[item.id] ? '#F8F6FF' : '#fff',
              }}
            >
              <input
                type="checkbox"
                checked={!!selected[item.id]}
                onChange={() => toggle(item.id)}
                style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#422670' }}
              />
              {item.qty > 0 ? (
                <span style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  minWidth: 36, padding: '1px 6px',
                  backgroundColor: item.qty >= 1000 ? '#FFBE33' : item.qty >= 100 ? '#F8E6A0' : '#F1F2F4',
                  borderRadius: 10, fontSize: 12, fontWeight: 600, color: '#172B4D',
                }}>
                  {item.qty}
                </span>
              ) : <span />}
              <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
                {item.warning && (
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" style={{ flexShrink: 0 }}>
                    <circle cx="7" cy="7" r="6.25" stroke="#FF991F" strokeWidth="1.2"/>
                    <path d="M7 4v3.5M7 9v.5" stroke="#FF991F" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                )}
                <span style={{ fontSize: 13, color: '#172B4D' }}>{item.description}</span>
              </div>
              <span style={{ fontSize: 12, color: '#626F86', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{item.company}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div style={{ padding: '16px 24px', borderTop: '1px solid #e8e8e8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button onClick={onCancel} style={{ height: 36, padding: '0 16px', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
          Cancel
        </button>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={onBack} style={{ height: 36, padding: '0 16px', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}>
            Back
          </button>
          <button
            onClick={onSkip}
            style={{ height: 36, padding: '0 16px', border: 'none', borderRadius: 4, background: '#422670', color: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', fontWeight: 500 }}
          >
            Skip
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Exported Panel ──────────────────────────────────────────────────────────

const EMPTY_FORM = { name: '', description: '', date: '', category: '', location: '', doctorName: '', doctorEmail: '', doctorPhone: '', teamMembers: '', budget: '' };

export default function CreateMissionPanel({ isOpen, onClose }) {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState(EMPTY_FORM);

  const handleClose = () => { onClose(); setStep(1); setForm(EMPTY_FORM); };
  const handleNext  = () => setStep(2);
  const handleBack  = () => setStep(1);
  const handleSkip  = async () => {
    try {
      const { error } = await supabase.from('missions').insert({
        name: form.name,
        description: form.description,
        location: form.location,
        start_date: form.date.split(' - ')[0], // Rough parsing
        end_date: form.date.split(' - ')[1],
        specialty: form.category,
        doctor_name: form.doctorName,
        status: 'CURRENT'
      });
      if (error) throw error;
      handleClose();
    } catch (err) {
      console.error('Failed to create mission:', err);
      alert('Failed to create mission');
    }
  };

  return (
    <SlidePanel isOpen={isOpen} onClose={handleClose} width={420}>
      {step === 1 && <Step1 form={form} setForm={setForm} onCancel={handleClose} onNext={handleNext} />}
      {step === 2 && <Step2 form={form} onCancel={handleClose} onBack={handleBack} onSkip={handleSkip} />}
    </SlidePanel>
  );
}
