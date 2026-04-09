import { useState, useRef, useEffect } from 'react';
import { supabase } from '../utils/supabase';
import PropTypes from 'prop-types';
import Select from '@atlaskit/select';
import { DatePicker } from '@atlaskit/datetime-picker';
import Textfield from '@atlaskit/textfield';
import { token } from '@atlaskit/tokens';
import SlidePanel from './SlidePanel';
import Modal, { ModalTransition, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button';

// ─── Options ───────────────────────────────────────────────────────────────

const UNIT_OPTIONS = [
  { label: 'Box',   value: 'box' },
  { label: 'Unit',  value: 'unit' },
  { label: 'Pack',  value: 'pack' },
  { label: 'Case',  value: 'case' },
];

const LOCATION_OPTIONS = [
  { label: 'Storage A',  value: 'Storage A' },
  { label: 'Storage B',  value: 'Storage B' },
  { label: 'Warehouse',  value: 'Warehouse' },
  { label: 'Cabinet 14 Shelf 2B', value: 'Cabinet 14 Shelf 2B' },
  { label: 'Cabinet 12 Shelf 1A', value: 'Cabinet 12 Shelf 1A' },
];

const ACQUISITION_OPTIONS = [
  { label: 'Donation', value: 'donation' },
  { label: 'Purchase', value: 'purchase' },
  { label: 'Grant',    value: 'grant' },
];

const AI_SUGGESTIONS = [
  'https://www.amazon.com/JorVet-Veterinary-Grad...',
  'https://www.abbott.com/en-us/products-solution...',
];

// ─── Initial state ──────────────────────────────────────────────────────────

const INIT_S1 = {
  description:   '',
  referenceNum:  '',
  company:       '',
  lotNumber:     '',
  unitOfMeasure: null,
  shelfLife:     '',
  quantity:      '',
  expirationDate:'',
  location:      null,
  notes:         '',
};

const INIT_S2 = {
  marketValue:      '',
  valuationSource:  '',
  acquisitionMethod:null,
  uploadedFile:     null,
};

// ─── Shared field label ─────────────────────────────────────────────────────

function FieldLabel({ text, required }) {
  return (
    <label style={{
      display: 'block', marginBottom: 4,
      fontSize: 12, fontWeight: 600,
      color: token('color.text', '#172B4D'),
    }}>
      {text}
      {required && <span style={{ color: '#AE2E24' }}>*</span>}
    </label>
  );
}

FieldLabel.propTypes = { text: PropTypes.string, required: PropTypes.bool };

// ─── Icon helpers ───────────────────────────────────────────────────────────

function DollarPrefix() {
  return (
    <span style={{ padding: '0 6px 0 10px', display: 'flex', alignItems: 'center', color: '#626F86' }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="8" cy="8" r="6.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M8 3.5v1M8 11.5v1M6 6c0-1 .9-1.5 2-1.5s2 .7 2 1.5c0 1-.9 1.5-2 1.5S6 8 6 9s.9 1.5 2 1.5 2-.5 2-1.5" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function LinkPrefix() {
  return (
    <span style={{ padding: '0 6px 0 10px', display: 'flex', alignItems: 'center', color: '#626F86' }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <path d="M6.5 8a2.5 2.5 0 0 0 2.5 2.5H11a2.5 2.5 0 0 0 0-5h-1M9.5 8a2.5 2.5 0 0 0-2.5-2.5H5a2.5 2.5 0 0 0 0 5h1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    </span>
  );
}

function AssetsPrefix() {
  return (
    <span style={{ padding: '0 6px 0 10px', display: 'flex', alignItems: 'center', color: '#626F86' }}>
      <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
        <circle cx="5" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" />
        <circle cx="11" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.3" />
        <path d="M7.5 8h1" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
      </svg>
    </span>
  );
}

// ─── Globe icon for AI suggestions ─────────────────────────────────────────

function GlobeIcon({ color = 'var(--ds-link)' }) {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke={color} strokeWidth="1.3" />
      <ellipse cx="8" cy="8" rx="2.2" ry="6" stroke={color} strokeWidth="1.3" />
      <path d="M2 8h12" stroke={color} strokeWidth="1.3" strokeLinecap="round" />
      <path d="M2.5 5.5h11M2.5 10.5h11" stroke={color} strokeWidth="1" strokeLinecap="round" />
    </svg>
  );
}

GlobeIcon.propTypes = { color: PropTypes.string };

// ─── Step 1: Item Details ───────────────────────────────────────────────────

function Step1({ values, onChange }) {
  const set = (field) => (val) => onChange({ ...values, [field]: val });
  const setE = (field) => (e) => onChange({ ...values, [field]: e.target.value });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div>
        <FieldLabel text="Item Description" required />
        <Textfield
          value={values.description}
          onChange={setE('description')}
          placeholder="Add item description"
        />
      </div>

      <div>
        <FieldLabel text="Reference Number #" />
        <Textfield
          value={values.referenceNum}
          onChange={setE('referenceNum')}
          placeholder="Add reference number"
        />
      </div>

      <div>
        <FieldLabel text="Manufacturing Company" />
        <Textfield
          value={values.company}
          onChange={setE('company')}
          placeholder="Add manufacturing company"
        />
      </div>

      <div>
        <FieldLabel text="Lot Number" />
        <Textfield
          value={values.lotNumber}
          onChange={setE('lotNumber')}
          placeholder="Add lot number"
        />
      </div>

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <FieldLabel text="Unit of Measure" required />
          <Select
            value={values.unitOfMeasure}
            onChange={set('unitOfMeasure')}
            options={UNIT_OPTIONS}
            placeholder="Select Unit"
          />
        </div>
        <div style={{ flex: 1 }}>
          <FieldLabel text="Typical Shelf Life" />
          <Textfield
            value={values.shelfLife}
            onChange={setE('shelfLife')}
            placeholder="Add Shelf Life"
          />
        </div>
      </div>

      <div>
        <FieldLabel text="Quantity" required />
        <Textfield
          value={values.quantity}
          onChange={setE('quantity')}
          placeholder="Add quantity"
          elemBeforeInput={<AssetsPrefix />}
        />
      </div>

      <div>
        <FieldLabel text="Expiration Date" />
        <DatePicker
          value={values.expirationDate}
          onChange={set('expirationDate')}
          placeholder="Select date"
        />
      </div>

      <div>
        <FieldLabel text="Location" required />
        <Select
          value={values.location}
          onChange={set('location')}
          options={LOCATION_OPTIONS}
          placeholder="Select Location"
        />
      </div>

    </div>
  );
}

Step1.propTypes = { values: PropTypes.object, onChange: PropTypes.func };

// ─── Step 2: Add Documentation ─────────────────────────────────────────────

function Step2({ values, onChange }) {
  const [aiVisible, setAiVisible] = useState(true);
  const [hoveredAi, setHoveredAi] = useState(null);
  const fileInputRef = useRef(null);

  const set = (field) => (val) => onChange({ ...values, [field]: val });
  const setE = (field) => (e) => onChange({ ...values, [field]: e.target.value });

  const handleAiClick = (url) => {
    onChange({ ...values, valuationSource: url });
    setAiVisible(false);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      onChange({
        ...values,
        uploadedFile: {
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          date: new Date().toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          }),
        },
      });
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files?.[0];
    if (file) {
      onChange({
        ...values,
        uploadedFile: {
          name: file.name,
          size: file.size,
          type: file.type,
          url: URL.createObjectURL(file),
          date: new Date().toLocaleString('en-GB', {
            day: '2-digit', month: 'short', year: 'numeric',
            hour: '2-digit', minute: '2-digit',
          }),
        },
      });
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <div>
        <FieldLabel text="Market Value per Unit" required />
        <Textfield
          value={values.marketValue}
          onChange={setE('marketValue')}
          placeholder="Add market value"
          elemBeforeInput={<DollarPrefix />}
        />
      </div>

      <div>
        <FieldLabel text="Valuation Source" />
        <Textfield
          value={values.valuationSource}
          onChange={setE('valuationSource')}
          placeholder="Add a valuation source"
          elemBeforeInput={<LinkPrefix />}
        />
      </div>

      {/* AI Suggested Sources */}
      {aiVisible && (
        <div>
          <p style={{
            fontSize: 12, fontWeight: 600, margin: '0 0 8px',
            color: token('color.text', '#172B4D'),
          }}>
            AI Suggested Sources
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {AI_SUGGESTIONS.map((url) => (
              <div
                key={url}
                onClick={() => handleAiClick(url)}
                onMouseEnter={() => setHoveredAi(url)}
                onMouseLeave={() => setHoveredAi(null)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 8,
                  padding: '9px 12px',
                  border: `1px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`,
                  borderRadius: 4,
                  backgroundColor: hoveredAi === url ? '#EAF2FF' : token('elevation.surface', '#fff'),
                  cursor: 'pointer',
                  transition: 'background-color 0.15s ease',
                }}
              >
                <GlobeIcon color="var(--ds-link)" />
                <span style={{
                  fontSize: 13, color: 'var(--ds-link)',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {url}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <FieldLabel text="Acquisition Method" required />
        <Select
          value={values.acquisitionMethod}
          onChange={set('acquisitionMethod')}
          options={ACQUISITION_OPTIONS}
          placeholder="Select acquisition method"
        />
      </div>

      {/* Upload Document */}
      <div>
        <FieldLabel text="Upload Document" />
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            padding: '16px 12px',
            border: `2px dashed ${token('color.border', 'rgba(9,30,66,0.2)')}`,
            borderRadius: 4,
            backgroundColor: token('elevation.surface', '#fff'),
          }}
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <path d="M8 11V5M5 8l3-3 3 3" stroke="#626F86" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M3 13h10" stroke="#626F86" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          <span style={{ fontSize: 14, color: token('color.text.subtle', '#505258') }}>
            Drop files to attach or
          </span>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            style={{
              display: 'flex', alignItems: 'center', gap: 5,
              padding: '4px 10px',
              border: `1px solid ${token('color.border', 'rgba(9,30,66,0.20)')}`,
              borderRadius: 4,
              background: token('elevation.surface', '#fff'),
              cursor: 'pointer', fontSize: 14,
              color: token('color.text', '#172B4D'), fontFamily: 'inherit',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
              <path d="M11 8.5l-3.5 3.5L4 8.5M7.5 2v10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Browse
          </button>
          <input
            ref={fileInputRef}
            type="file"
            style={{ display: 'none' }}
            onChange={handleFileSelect}
          />
        </div>

        {/* Uploaded file preview */}
        {values.uploadedFile && (
          <FilePreview file={values.uploadedFile} />
        )}
      </div>

    </div>
  );
}

Step2.propTypes = { values: PropTypes.object, onChange: PropTypes.func };

// ─── File Preview Card ──────────────────────────────────────────────────────

function FilePreview({ file }) {
  const isImage = file.type?.startsWith('image/');
  return (
    <div style={{
      display: 'inline-flex', flexDirection: 'column',
      width: 160, marginTop: 12,
      border: `1px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`,
      borderRadius: 4, overflow: 'hidden',
      backgroundColor: token('elevation.surface', '#fff'),
    }}>
      {/* Thumbnail */}
      <div style={{
        width: '100%', height: 100,
        backgroundColor: '#7B61FF',
        backgroundImage: isImage ? `url(${file.url})` : undefined,
        backgroundSize: 'cover', backgroundPosition: 'center',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
      }}>
        {!isImage && (
          <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
            <rect x="6" y="4" width="24" height="28" rx="2" fill="rgba(255,255,255,0.25)" stroke="white" strokeWidth="1.5" />
            <path d="M11 12h14M11 17h14M11 22h9" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        )}
      </div>
      {/* Metadata */}
      <div style={{ padding: '8px 10px' }}>
        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: token('color.text', '#172B4D'), whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {file.name}
        </p>
        <p style={{ margin: '2px 0 0', fontSize: 11, color: token('color.text.subtle', '#505258') }}>
          {file.date}
        </p>
      </div>
    </div>
  );
}

FilePreview.propTypes = { file: PropTypes.object };

// ─── Step 3: Review Your Inputs ─────────────────────────────────────────────

function ReviewField({ label, required, value, placeholder = 'Placeholder' }) {
  return (
    <div>
      <FieldLabel text={label} required={required} />
      <div style={{
        padding: '8px 12px', minHeight: 36,
        border: `1px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`,
        borderRadius: 3, fontSize: 14,
        color: value ? token('color.text', '#172B4D') : token('color.text.subtlest', '#8590A2'),
        backgroundColor: token('elevation.surface', '#fff'),
        boxSizing: 'border-box',
      }}>
        {value || placeholder}
      </div>
    </div>
  );
}

ReviewField.propTypes = {
  label: PropTypes.string, required: PropTypes.bool,
  value: PropTypes.string, placeholder: PropTypes.string,
};

function ReviewSelect({ label, required, value, placeholder = 'Placeholder' }) {
  return (
    <div>
      <FieldLabel text={label} required={required} />
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '8px 12px', minHeight: 36,
        border: `1px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`,
        borderRadius: 3, fontSize: 14,
        color: value ? token('color.text', '#172B4D') : token('color.text.subtlest', '#8590A2'),
        backgroundColor: token('elevation.surface', '#fff'),
      }}>
        <span>{value?.label || placeholder}</span>
        <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
          <path d="M3 5l4 4 4-4" stroke="#626F86" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}

ReviewSelect.propTypes = {
  label: PropTypes.string, required: PropTypes.bool,
  value: PropTypes.object, placeholder: PropTypes.string,
};

function Step3({ s1, s2 }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

      <ReviewField label="Item Description"    required value={s1.description} placeholder="Add item description" />
      <ReviewField label="Reference Number #"           value={s1.referenceNum}  placeholder="Add reference number" />
      <ReviewField label="Manufacturing Company"        value={s1.company}       placeholder="Add manufacturing company" />
      <ReviewField label="Lot Number"                   value={s1.lotNumber}     placeholder="Add lot number" />

      <div style={{ display: 'flex', gap: 12 }}>
        <div style={{ flex: 1 }}>
          <ReviewSelect label="Unit of Measure" required value={s1.unitOfMeasure} />
        </div>
        <div style={{ flex: 1 }}>
          <ReviewField label="Typical Shelf Life" value={s1.shelfLife} />
        </div>
      </div>

      {/* Quantity – keep the assets icon prefix for visual consistency */}
      <div>
        <FieldLabel text="Quantity" required />
        <div style={{
          display: 'flex', alignItems: 'center',
          border: `1px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`,
          borderRadius: 3, backgroundColor: token('elevation.surface', '#fff'),
          minHeight: 36,
        }}>
          <AssetsPrefix />
          <span style={{
            flex: 1, fontSize: 14, padding: '0 8px',
            color: s1.quantity ? token('color.text', '#172B4D') : token('color.text.subtlest', '#8590A2'),
          }}>
            {s1.quantity || 'Add quantity'}
          </span>
        </div>
      </div>

      {/* Expiration Date */}
      <div>
        <FieldLabel text="Expiration Date" />
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '8px 12px', minHeight: 36,
          border: `1px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`,
          borderRadius: 3, fontSize: 14,
          color: s1.expirationDate ? token('color.text', '#172B4D') : token('color.text.subtlest', '#8590A2'),
          backgroundColor: token('elevation.surface', '#fff'),
        }}>
          <span>{s1.expirationDate || 'Select date'}</span>
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <rect x="1.5" y="3.5" width="13" height="11" rx="1.5" stroke="#626F86" strokeWidth="1.3" />
            <path d="M5 2v3M11 2v3M1.5 7h13" stroke="#626F86" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
        </div>
      </div>

      <ReviewSelect label="Location" required value={s1.location} />

      <div style={{ height: 1, backgroundColor: 'rgba(9,30,66,0.08)' }} />

      <ReviewField label="Market Value per Unit" required value={s2.marketValue} placeholder="Add market value" />
      <ReviewField label="Upload Document"               value={s2.uploadedFile?.name} />
      <ReviewField label="Valuation Source"              value={s2.valuationSource} />

    </div>
  );
}

Step3.propTypes = { s1: PropTypes.object, s2: PropTypes.object };

// ─── Main Component ─────────────────────────────────────────────────────────

const STEP_TITLES = (isEdit) => ({
  1: isEdit ? 'Edit Item' : 'New Entry',
  2: 'Add documentation',
  3: 'Review your inputs',
});

const TOTAL_STEPS = 3;

export default function ItemPanel({ isOpen, onClose, onSave, isEdit, baseItem }) {
  const [step, setStep] = useState(1);
  const titles = STEP_TITLES(isEdit);
  const [s1, setS1] = useState(INIT_S1);
  const [s2, setS2] = useState(INIT_S2);
  const [isErrorModalOpen, setIsErrorModalOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Use effect to handle pre-filling when based on an existing item
  useEffect(() => {
    if (baseItem && isOpen) {
      if (isEdit) {
        // Edit mode: Pre-fill everything
        setS1({
          ...INIT_S1,
          description: baseItem.description || '',
          company: baseItem.company || '',
          referenceNum: baseItem.reference || '',
          lotNumber: baseItem.lot_number || '',
          unitOfMeasure: baseItem.unit_of_measure ? { label: baseItem.unit_of_measure, value: baseItem.unit_of_measure.toLowerCase() } : null,
          shelfLife: baseItem.shelf_life || '',
          quantity: baseItem.quantity?.toString() || '',
          expirationDate: baseItem.expiration || '',
          location: baseItem.location ? { label: baseItem.location, value: baseItem.location } : null,
          notes: baseItem.notes || '',
        });
        setS2({
          ...INIT_S2,
          marketValue: baseItem.market_value?.toString() || '',
          valuationSource: baseItem.valuation_source || '',
          acquisitionMethod: baseItem.acquisition_method ? { label: baseItem.acquisition_method, value: baseItem.acquisition_method.toLowerCase() } : null,
        });
      } else {
        // New Entry mode: Only pre-fill the "Catalog" info
        setS1({
          ...INIT_S1,
          description: baseItem.description || '',
          company: baseItem.company || '',
          referenceNum: baseItem.reference || '',
          unitOfMeasure: baseItem.unit_of_measure ? { label: baseItem.unit_of_measure, value: baseItem.unit_of_measure.toLowerCase() } : null,
          shelfLife: baseItem.shelf_life || '',
          notes: baseItem.notes || '',
        });
        setS2({
          ...INIT_S2,
          marketValue: baseItem.market_value?.toString() || '',
          valuationSource: baseItem.valuation_source || '',
          acquisitionMethod: baseItem.acquisition_method ? { label: baseItem.acquisition_method, value: baseItem.acquisition_method.toLowerCase() } : null,
        });
      }
    } else if (!isOpen) {
      reset();
    }
  }, [baseItem, isOpen, isEdit]);

  const reset = () => {
    setStep(1);
    setS1(INIT_S1);
    setS2(INIT_S2);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleNext = () => {
    if (step < TOTAL_STEPS) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSave = async () => {
    try {
      // 1. Ensure inventory item exists (Manual lookup to avoid constraint issues)
      let invId;
      const { data: existingInv, error: findError } = await supabase
        .from('inventory')
        .select('id')
        .eq('description', s1.description)
        .eq('reference_number', s1.referenceNum)
        .maybeSingle();

      if (findError) throw findError;

      if (existingInv) {
        invId = existingInv.id;
        // Optionally update the company/unit of measure if they changed
        await supabase
          .from('inventory')
          .update({
            company: s1.company,
            unit_of_measure: s1.unitOfMeasure?.label || 'units',
            shelf_life: s1.shelfLife,
            notes: s1.notes || ''
          })
          .eq('id', invId);
      } else {
        const { data: newInv, error: createError } = await supabase
          .from('inventory')
          .insert({
            description: s1.description,
            company: s1.company,
            reference_number: s1.referenceNum,
            unit_of_measure: s1.unitOfMeasure?.label || 'units',
            shelf_life: s1.shelfLife,
            notes: s1.notes || ''
          })
          .select()
          .single();
        if (createError) throw createError;
        invId = newInv.id;
      }

      // 2. Create or Update the shipment entry
      const shipmentData = {
        inventory_id: invId,
        quantity: s1.quantity ? Number(s1.quantity) : 0,
        location: s1.location?.value || '',
        expiration_date: s1.expirationDate || null,
        status: baseItem?.status || 'available',
        lot_number: s1.lotNumber,
        market_value: s2.marketValue ? Number(s2.marketValue) : null,
        valuation_source: s2.valuationSource,
        acquisition_method: s2.acquisitionMethod?.label || null,
      };

      let shipError;
      if (isEdit && baseItem?.id && typeof baseItem.id !== 'number') { 
        // Force update only if explicitly in edit mode and have a valid UUID
        const { error } = await supabase
          .from('shipments')
          .update(shipmentData)
          .eq('id', baseItem.id);
        shipError = error;
      } else {
        // Always insert if not in explicit edit mode
        const { error } = await supabase
          .from('shipments')
          .insert(shipmentData);
        shipError = error;
      }

      if (shipError) throw shipError;

      onSave?.(); // Notify parent to refresh
      reset();
      onClose();
    } catch (err) {
      console.error('Save failed:', err);
      setErrorMessage(err.message || 'Failed to save item. Please try again.');
      setIsErrorModalOpen(true);
    }
  };

  return (
    <>
      <SlidePanel isOpen={isOpen} onClose={handleClose}>

      {/* ── Header ────────────────────────────────────────────────── */}
      <div style={{ padding: '12px 20px 12px 48px', borderBottom: '1px solid #e8e8e8', display: 'flex', alignItems: 'center', height: 53, boxSizing: 'border-box', backgroundColor: '#fff' }}>
        <h2 style={{ margin: 0, fontSize: 18, fontWeight: 700, color: token('color.text', '#172B4D') }}>
          {titles[step]}
        </h2>
      </div>

      <div style={{ padding: '0 24px', backgroundColor: '#fff' }}>
        {/* Step progress bar */}
        <div style={{
          height: 3,
          backgroundColor: 'rgba(9,30,66,0.08)',
          borderRadius: 2, overflow: 'hidden',
          marginTop: -1,
        }}>
          <div style={{
            height: '100%',
            width: `${(step / TOTAL_STEPS) * 100}%`,
            backgroundColor: '#422670',
            transition: 'width 0.3s ease',
          }} />
        </div>
      </div>

      {/* ── Scrollable content ─────────────────────────────────────── */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '24px 24px 16px' }}>

        {/* Title */}
        <h2 style={{
          margin: '0 0 4px', fontSize: 24, fontWeight: 700,
          color: token('color.text', '#172B4D'),
        }}>
          {STEP_TITLES[step]}
        </h2>

        {step < 3 && (
          <p style={{ margin: '0 0 20px', fontSize: 13, color: '#AE2E24' }}>
            * indicates a required field
          </p>
        )}

        {step === 1 && <Step1 values={s1} onChange={setS1} />}
        {step === 2 && <Step2 values={s2} onChange={setS2} />}
        {step === 3 && <Step3 s1={s1} s2={s2} />}
      </div>

      {/* ── Footer ────────────────────────────────────────────────── */}
      <div style={{
        flexShrink: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
        padding: '12px 24px',
        borderTop: `1px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`,
        backgroundColor: token('elevation.surface', '#fff'),
      }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={handleBack}
            disabled={step === 1}
            style={footerBtnStyle(step === 1)}
          >
            Back
          </button>

          {step < TOTAL_STEPS ? (
            <button onClick={handleNext} style={footerBtnPrimary()}>
              Next
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 7h8M7 3l4 4-4 4" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : (
            <button onClick={handleSave} style={footerBtnPrimary()}>
              Save
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M2 10V4a1 1 0 0 1 1-1h7l2 2v7a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1z" stroke="white" strokeWidth="1.2" />
                <path d="M4 13V9h6v4M4 3V1h5v3" stroke="white" strokeWidth="1.2" strokeLinecap="round" />
              </svg>
            </button>
          )}
        </div>
      </div>

    </SlidePanel>

    <ModalTransition>
      {isErrorModalOpen && (
        <Modal onClose={() => setIsErrorModalOpen(false)}>
          <ModalHeader>
            <ModalTitle>Error Saving Item</ModalTitle>
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

ItemPanel.propTypes = {
  isOpen:  PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave:  PropTypes.func,
  isEdit:  PropTypes.bool,
  baseItem: PropTypes.object,
};

// ─── Footer button styles ───────────────────────────────────────────────────

function footerBtnStyle(disabled = false) {
  return {
    padding: '6px 14px', borderRadius: 4,
    border: `1px solid ${token('color.border', 'rgba(9,30,66,0.14)')}`,
    background: token('elevation.surface', '#fff'),
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 14, fontFamily: 'inherit',
    color: disabled ? '#8590A2' : token('color.text', '#172B4D'),
    opacity: disabled ? 0.6 : 1,
  };
}

function footerBtnPrimary() {
  return {
    display: 'flex', alignItems: 'center', gap: 6,
    padding: '6px 16px', borderRadius: 4,
    border: 'none', backgroundColor: '#422670',
    cursor: 'pointer', fontSize: 14, fontFamily: 'inherit', color: '#fff',
    fontWeight: 500,
  };
}
