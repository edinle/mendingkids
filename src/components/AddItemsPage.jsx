import { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { supabase } from '../utils/supabase';
import { PageLayout, Content, Main, LeftSidebar, TopNavigation } from '@atlaskit/page-layout';
import TopNav from './TopNav';
import SideNav from './SideNav';
import FilterDropdown from './FilterDropdown';
import Modal, { ModalTransition, ModalHeader, ModalTitle, ModalBody, ModalFooter } from '@atlaskit/modal-dialog';
import Button from '@atlaskit/button';
import { IconButton } from '@atlaskit/button/new';

// ─── Constants ────────────────────────────────────────────────────────────────
const RECOMMENDED_LIMIT = 20;

// ─── Primitives ───────────────────────────────────────────────────────────────

function QtyBadge({ qty }) {
  const bg = qty >= 1000 ? '#FFBE33' : qty >= 100 ? '#F8E6A0' : '#F1F2F4';
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: 36, padding: '1px 8px',
      backgroundColor: bg, borderRadius: 10,
      fontSize: 12, fontWeight: 600, color: '#172B4D',
    }}>
      {qty}
    </span>
  );
}

// ─── Table component ──────────────────────────────────────────────────────────

const COL = '32px 2fr 1.4fr 1.4fr 80px 80px';

function TableHead() {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: COL, padding: '10px 14px', backgroundColor: '#FAFBFC', borderBottom: '1px solid #e8e8e8', gap: 8 }}>
      {['', 'Item Description', 'Manufacturing Company', 'Reference Number', 'Quantity', 'Expiration'].map((h, i) => (
        <span key={i} style={{ fontSize: 11, fontWeight: 700, color: '#626F86', textTransform: 'uppercase', letterSpacing: '0.04em', display: 'flex', alignItems: 'center', gap: 3 }}>
          {h}
          {h && <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M3 4l2-2 2 2M3 6l2 2 2-2" stroke="#8590A2" strokeWidth="1.2" strokeLinecap="round"/></svg>}
        </span>
      ))}
    </div>
  );
}

function TableRow({ item, checked, onToggle, showCheck = true }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: COL, padding: '10px 14px', gap: 8, alignItems: 'center', borderBottom: '1px solid #f4f4f4', backgroundColor: checked ? '#F8F6FF' : '#fff' }}>
      {showCheck
        ? <input type="checkbox" checked={checked} onChange={onToggle} style={{ width: 16, height: 16, cursor: 'pointer', accentColor: '#422670' }} />
        : <span />
      }
      <span style={{ fontSize: 13, color: '#172B4D' }}>{item.description}</span>
      <span style={{ fontSize: 13, color: '#172B4D' }}>{item.company}</span>
      <span style={{ fontSize: 13, color: '#44546F' }}>{item.ref}</span>
      <QtyBadge qty={item.qty} />
      <span style={{ fontSize: 13, color: '#44546F' }}>{item.exp}</span>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AddItemsPage({ user, onSwitchAccount, onLogout }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [mission, setMission] = useState(null);
  const [fetching, setFetching] = useState(true);
  const [inventory, setInventory] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedIds, setSelected] = useState(new Set());
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [saving, setSaving] = useState(false);
  const [isScanModalOpen, setIsScanModalOpen] = useState(false);

  useEffect(() => {
    fetchMission();
    fetchInventory();
    fetchCategories();
  }, [id]);

  const fetchMission = async () => {
    setFetching(true);
    const { data } = await supabase.from('missions').select('*').eq('id', id).single();
    if (data) setMission(data);
    setFetching(false);
  };

  const fetchInventory = async () => {
    const { data } = await supabase.from('inventory').select('*').limit(RECOMMENDED_LIMIT);
    if (data) {
      setInventory(data.map(i => ({
        id: i.id,
        description: i.description,
        company: i.company || 'Unknown',
        ref: i.reference_number || '—',
        qty: 10, // Default qty for initial selection
        exp: i.shelf_life || 'TBD'
      })));
    }
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('name');
    if (data) setCategories(data.map(c => c.name));
  };

  const handleAddItems = async () => {
    setSaving(true);
    const updates = Array.from(selectedIds).map(itemId => ({
      mission_id: id,
      inventory_id: itemId,
      quantity: 1, // Default quantity when bulk adding
      status: 'assigned',
      location: 'Transit'
    }));

    const { error } = await supabase.from('shipments').insert(updates);
    setSaving(false);
    
    if (error) {
      alert('Failed to add items: ' + error.message);
    } else {
      navigate(`/missions/${id}`);
    }
  };

  const handleScanOpen = () => setIsScanModalOpen(true);

  const toggleId = id => setSelected(s => {
    const next = new Set(s);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const filteredRec = inventory.filter(item => {
    if (categoryFilter && item.category !== categoryFilter)                             return false;
    if (search && !item.description.toLowerCase().includes(search.toLowerCase()))   return false;
    return true;
  });

  const selectedItems = inventory.filter(i => selectedIds.has(i.id));

  return (
    <PageLayout>
      <TopNavigation isFixed>
        <TopNav user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />
      </TopNavigation>
      <Content>
        <LeftSidebar width={240}>
          <SideNav user={user} onSwitchAccount={onSwitchAccount} onLogout={onLogout} />
        </LeftSidebar>
        <Main>
          <div style={{ padding: '32px 40px', maxWidth: 1200, margin: '0 auto', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
            {/* Header */}
            <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 }}>
              <div>
                <button 
                  onClick={() => navigate(`/missions/${id}`)}
                  style={{ background: 'none', border: 'none', color: 'var(--ds-link)', cursor: 'pointer', padding: 0, marginBottom: 8, fontSize: 14, fontWeight: 500 }}>
                  ← Back to Mission
                </button>
                <h1 style={{ margin: 0, fontSize: 24, fontWeight: 600, color: '#172B4D' }}>Add Items {mission ? `to ${mission.name}` : ''}</h1>
              </div>
              <button 
                onClick={handleScanOpen}
                style={{ height: 32, padding: '0 16px', backgroundColor: '#422670', color: '#fff', border: 'none', borderRadius: 4, fontSize: 14, fontWeight: 500, cursor: 'pointer', marginTop: 16, fontFamily: 'inherit' }}>
                Scan Barcode
              </button>
            </div>

            {/* Filter bar */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
              <div style={{ display: 'flex', gap: 8 }}>
                <FilterDropdown label="Category" options={categories} selected={categoryFilter} onSelect={setCategoryFilter} />
              </div>
              <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
                {/* Search input logic ... */}
              </div>
            </div>

            {/* Selected Items section */}
            <section style={{ marginBottom: 32 }}>
              <h2 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 600, color: '#000' }}>Selected Items</h2>
              <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
                <TableHead />
                {selectedIds.size === 0
                  ? <div style={{ padding: 20, textAlign: 'center', color: '#8590A2', fontSize: 14 }}>No items selected</div>
                  : inventory.filter(i => selectedIds.has(i.id)).map(item => (
                    <TableRow key={item.id} item={item} checked onToggle={() => toggleId(item.id)} />
                  ))
                }
              </div>
            </section>

            {/* Recommended Items section */}
            <section style={{ marginBottom: 80 }}>
              <h2 style={{ margin: '0 0 10px', fontSize: 15, fontWeight: 600, color: '#000' }}>
                Recommended Inventory
              </h2>
              <div style={{ border: '1px solid #e8e8e8', borderRadius: 4, overflow: 'hidden' }}>
                <TableHead />
                {filteredRec.map(item => (
                  <TableRow key={item.id} item={item} checked={selectedIds.has(item.id)} onToggle={() => toggleId(item.id)} />
                ))}
              </div>
            </section>
          </div>

          {/* Sticky footer */}
          <div style={{
            position: 'fixed', bottom: 0, right: 0,
            left: 240, padding: '14px 32px',
            backgroundColor: '#fff', borderTop: '1px solid #e8e8e8',
            display: 'flex', justifyContent: 'flex-end', gap: 10,
            zIndex: 50,
          }}>
            <button
              onClick={() => navigate(`/missions/${id}`)}
              style={{ height: 36, padding: '0 20px', border: '1px solid #d9d9d9', borderRadius: 4, background: '#fff', cursor: 'pointer', fontSize: 14, fontFamily: 'inherit' }}
            >
              Cancel
            </button>
            <button
              onClick={handleAddItems}
              disabled={selectedIds.size === 0 || saving}
              style={{
                height: 36, padding: '0 20px',
                border: 'none', borderRadius: 4,
                background: selectedIds.size > 0 && !saving ? '#422670' : '#e8e8e8',
                color: selectedIds.size > 0 && !saving ? '#fff' : '#8590A2',
                cursor: selectedIds.size > 0 && !saving ? 'pointer' : 'not-allowed',
                fontSize: 14, fontFamily: 'inherit', fontWeight: 500,
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {saving ? 'Adding...' : (
                <>
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                    <path d="M7 2v10M2 7h10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  </svg>
                  Add Items to Mission
                </>
              )}
            </button>
          </div>
        </Main>
      </Content>
      <ModalTransition>
        {isScanModalOpen && (
          <Modal onClose={() => setIsScanModalOpen(false)}>
            <ModalHeader>
              <ModalTitle>Scanner Coming Soon</ModalTitle>
            </ModalHeader>
            <ModalBody>
              <p>Barcode scanning functionality is currently being implemented. You will soon be able to scan medical items directly using your device camera.</p>
            </ModalBody>
            <ModalFooter>
              <Button appearance="subtle" onClick={() => setIsScanModalOpen(false)}>
                Close
              </Button>
            </ModalFooter>
          </Modal>
        )}
      </ModalTransition>
    </PageLayout>
  );
}
