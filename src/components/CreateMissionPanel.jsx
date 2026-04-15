import { useState, useRef, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import SlidePanel from './SlidePanel';
import Modal, { ModalTransition, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button';
import Textfield from '@atlaskit/textfield';
import Select from '@atlaskit/select';
import { Checkbox } from '@atlaskit/checkbox';
import { token } from '@atlaskit/tokens';

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

const CATEGORIES = [
  { label: 'ENT', value: 'ENT' },
  { label: 'Cardiac', value: 'Cardiac' },
  { label: 'General', value: 'General' },
  { label: 'Ortho', value: 'Ortho' },
  { label: 'Plastics', value: 'Plastics' },
  { label: 'Infections', value: 'Infections' },
  { label: 'Dental', value: 'Dental' },
];
const LOCATIONS = [
  { label: 'Dar es Salaam', value: 'Dar es Salaam' },
  { label: 'Kampala', value: 'Kampala' },
  { label: 'Guatemala City', value: 'Guatemala City' },
  { label: 'Lima', value: 'Lima' },
  { label: 'Hanoi', value: 'Hanoi' },
];
const TEAM_MEMBERS = [
  { label: 'Dr. Smith', value: 'Dr. Smith' },
  { label: 'Dr. Jones', value: 'Dr. Jones' },
  { label: 'Nurse Joy', value: 'Nurse Joy' },
  { label: 'Dr. Kim', value: 'Dr. Kim' },
];

// ─── Shared Form Primitives ───────────────────────────────────────────────────

function Label({ children, required }) {
  return (
    <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#172B4D', marginBottom: 4 }}>
      {children}{required && <span style={{ color: '#c62828' }}> *</span>}
    </label>
  );
}

// ─── Step 1: Mission Details Form ─────────────────────────────────────────────

function Step1({ form, setForm, onCancel, onNext }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header */}
      {/* Header */}
      <div style={{ padding: '12px 20px 12px 48px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', height: 53, boxSizing: 'border-box' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#000' }}>New Mission</h2>
      </div>

      {/* Form body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px 24px' }}>
        <div style={{ marginBottom: 16 }}>
          <Label required>Name</Label>
          <Textfield placeholder="Placeholder" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label>Description</Label>
          <Textfield placeholder="Placeholder" value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 16 }}>
          <div>
            <Label required>Date</Label>
            <Textfield
              placeholder="12/18/22 - 12/24/22"
              value={form.date}
              onChange={e => setForm(f => ({ ...f, date: e.target.value }))}
              elemAfterInput={
                <span style={{ paddingRight: 8, display: 'flex', color: '#626F86' }}>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <rect x="1" y="2" width="12" height="11" rx="1" stroke="currentColor" strokeWidth="1.2"/>
                    <path d="M5 1v2M9 1v2M1 5h12" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </span>
              }
            />
          </div>
          <div>
            <Label required>Category</Label>
            <Select
              placeholder="Select"
              options={CATEGORIES}
              value={form.category ? CATEGORIES.find(c => c.value === form.category) : null}
              onChange={v => setForm(f => ({ ...f, category: v?.value || '' }))}
            />
          </div>
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label required>Location</Label>
          <Select
            placeholder="Placeholder"
            options={LOCATIONS}
            value={form.location ? LOCATIONS.find(l => l.value === form.location) : null}
            onChange={v => setForm(f => ({ ...f, location: v?.value || '' }))}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label required>Doctor Name</Label>
          <Textfield placeholder="Placeholder" value={form.doctorName} onChange={e => setForm(f => ({ ...f, doctorName: e.target.value }))} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label required>Doctor's Email</Label>
          <Textfield placeholder="Placeholder" type="email" value={form.doctorEmail} onChange={e => setForm(f => ({ ...f, doctorEmail: e.target.value }))} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label>Doctor's Phone</Label>
          <Textfield placeholder="555-555-5555" type="tel" value={form.doctorPhone} onChange={e => setForm(f => ({ ...f, doctorPhone: e.target.value }))} />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label>Team Members</Label>
          <Select
            placeholder="Placeholder"
            options={TEAM_MEMBERS}
            value={form.teamMembers ? TEAM_MEMBERS.find(t => t.value === form.teamMembers) : null}
            onChange={v => setForm(f => ({ ...f, teamMembers: v?.value || '' }))}
          />
        </div>

        <div style={{ marginBottom: 16 }}>
          <Label>Budget</Label>
          <Textfield
            value={form.budget}
            onChange={e => setForm(f => ({ ...f, budget: e.target.value }))}
            elemBeforeInput={
              <span style={{ paddingLeft: 10, display: 'flex', color: '#626F86', fontSize: 14 }}>$</span>
            }
          />
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
        <Button appearance="subtle" onClick={onCancel}>Cancel</Button>
        <Button
          appearance="primary"
          isDisabled={!(form.name && form.category && form.doctorName && form.doctorEmail)}
          onClick={onNext}
          iconAfter={() => (
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M3 7h8M8 4l3 3-3 3" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        >
          Next
        </Button>
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
      {/* Header */}
      <div style={{ padding: '12px 20px 12px 48px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', height: 53, boxSizing: 'border-box' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: '#000' }}>Add Suggested Items</h2>
      </div>

      {/* Body */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 24px' }}>
        {/* Search */}
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', fontSize: 13, fontWeight: 500, color: '#172B4D', marginBottom: 4 }}>Search</label>
          <Textfield
            placeholder="Search"
            value={search}
            onChange={e => setSearch(e.target.value)}
            elemBeforeInput={
              <span style={{ paddingLeft: 10, display: 'flex', color: '#8590A2' }}>
                <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                  <circle cx="7" cy="7" r="5" stroke="currentColor" strokeWidth="1.5"/>
                  <path d="M11 11l3 3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </span>
            }
          />
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
              <Checkbox
                isChecked={!!selected[item.id]}
                onChange={() => toggle(item.id)}
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
        <Button appearance="subtle" onClick={onCancel}>Cancel</Button>
        <div style={{ display: 'flex', gap: 8 }}>
          <Button appearance="default" onClick={onBack}>Back</Button>
          <Button appearance="primary" onClick={onSkip}>Skip</Button>
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
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
      setErrorMessage(err.message || 'Failed to create mission');
      setIsErrorModalOpen(true);
    }
  };

  return (
    <>
      <SlidePanel isOpen={isOpen} onClose={handleClose} width={420}>
        {step === 1 && <Step1 form={form} setForm={setForm} onCancel={handleClose} onNext={handleNext} />}
        {step === 2 && <Step2 form={form} onCancel={handleClose} onBack={handleBack} onSkip={handleSkip} />}
      </SlidePanel>

      <ModalTransition>
        {isErrorModalOpen && (
          <Modal onClose={() => setIsErrorModalOpen(false)}>
            <ModalHeader>
              <ModalTitle>Error Creating Mission</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p>{errorMessage}</p>
            </ModalBody>
            <ModalFooter>
              <Button appearance="danger" onClick={() => setIsErrorModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
    </>
  );
}
