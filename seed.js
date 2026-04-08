import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL,
  process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY
);

async function seed() {
  console.log('🌱 Seeding database with realistic Mending Kids data...');

  try {
    // 1. CLEAR EXISTING DATA (optional, but good for clean seed)
    // Note: Don't clear profiles if they are linked to real auth users
    await supabase.from('requests').delete().neq('id', '0');
    await supabase.from('shipments').delete().neq('status', 'non-existent');
    await supabase.from('inventory').delete().neq('description', 'non-existent');
    await supabase.from('missions').delete().neq('name', 'non-existent');
    await supabase.from('donors').delete().neq('name', 'non-existent');

    // 2. MISSIONS
    const { data: missions, error: mErr } = await supabase.from('missions').insert([
      { name: 'Benin Cleft Lip & Palate', location: 'Cotonou, Benin', specialty: 'Plastics', status: 'PENDING', doctor_name: 'Dr. Sarah Jenkins', dates: 'Oct 12 - Oct 28, 2025', item_count: 124, people_count: 8 },
      { name: 'Guatemala Orthopedic 2026', location: 'Guatemala City', specialty: 'Ortho', status: 'ONGOING', doctor_name: 'Dr. Robert Chen', dates: 'Jan 05 - Jan 20, 2026', item_count: 450, people_count: 12 },
      { name: 'Tanzania Cardiac Relief', location: 'Dar es Salaam', specialty: 'Cardiac', status: 'ONGOING', doctor_name: 'Dr. Elena Rodriguez', dates: 'Mar 15 - Mar 30, 2026', item_count: 89, people_count: 6 },
      { name: 'Honduras General Surgical', location: 'Tegucigalpa', specialty: 'General', status: 'COMPLETED', doctor_name: 'Dr. Marcus Thorne', dates: 'May 10 - May 25, 2025', item_count: 210, people_count: 15 },
      { name: 'Vietnam Eye Mission 2024', location: 'Ho Chi Minh City', specialty: 'General', status: 'ARCHIVED', doctor_name: 'Dr. Nguyen Van', dates: 'Nov 01 - Nov 15, 2024', item_count: 320, people_count: 20 },
      { name: 'Peru Dental Outreach', location: 'Lima, Peru', specialty: 'Plastics', status: 'ARCHIVED', doctor_name: 'Dr. Sofia Ricci', dates: 'Sep 10 - Sep 22, 2023', item_count: 150, people_count: 10 },
    ]).select();
    if (mErr) throw mErr;
    console.log('✅ Created 6 Missions (including 2 Archived)');

    // 3. DONORS / PARTNERS / VOLUNTEERS
    const { error: dErr } = await supabase.from('donors').insert([
      { name: 'Global Health Corp', email: 'contact@ghc.org', role: 'Corporate', organization: 'GHC', status: 'Active' },
      { name: 'Direct Relief', email: 'aid@directrelief.org', role: 'Partner', organization: 'Direct Relief', status: 'Active' },
      { name: 'Stryker Medical', email: 'sales@stryker.com', role: 'Donor', organization: 'Stryker', status: 'Active' },
      { name: 'Meredith Grey', email: 'meredith@grey-sloan.edu', role: 'Individual', organization: 'Grey Sloan', status: 'Active' },
    ]);
    if (dErr) throw dErr;
    console.log('✅ Created 4 Donors/Partners');

    // 4. INVENTORY + SHIPMENTS
    const items = [
      { description: 'Pulse Oximeter', company: 'Masimo', reference_number: 'PX-101', uom: 'unit', qty: 50, location: 'Cabinet 14A', exp: '2026-12-31' },
      { description: 'Surgical Masks (Box of 50)', company: '3M', reference_number: 'MSK-77', uom: 'box', qty: 200, location: 'Warehouse', exp: '2027-06-15' },
      { description: 'IV Cannula 20G', company: 'B. Braun', reference_number: 'IVC-20', uom: 'box', qty: 500, location: 'Storage B', exp: '2026-04-22' },
      { description: 'Anesthesia Machine', company: 'GE Healthcare', reference_number: 'GE-900', uom: 'unit', qty: 2, location: 'Storage A', exp: '2028-01-01' },
      { description: 'Surgical Blade #15', company: 'Swann-Morton', reference_number: 'BLD-15', uom: 'box', qty: 100, location: 'Cabinet 12 Shelf 1A', exp: '2026-05-10' },
    ];

    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      const { data: inv, error: iErr } = await supabase.from('inventory').insert({
        description: item.description,
        company: item.company,
        reference_number: item.reference_number,
        unit_of_measure: item.uom
      }).select().single();
      if (iErr) throw iErr;

      // Create 2 shipments per inventory item: one Available, one In Use (for even indices)
      await supabase.from('shipments').insert({
        inventory_id: inv.id,
        quantity: item.qty,
        location: item.location,
        expiration_date: item.exp,
        status: 'available'
      });

      if (i % 2 === 0) {
        await supabase.from('shipments').insert({
          inventory_id: inv.id,
          quantity: Math.floor(item.qty / 5),
          location: 'Field Site',
          expiration_date: item.exp,
          status: 'in-use',
          mission_id: missions[i % missions.length].id
        });
      }
    }
    console.log('✅ Created 5 Inventory Items & Shipments');

    // 5. ITEM REQUESTS
    // We link these to the first mission created
    const { error: rErr } = await supabase.from('requests').insert([
      { id: 'REQ-412', mission_id: missions[0].id, status: 'Pending', priority: 'High' },
      { id: 'REQ-881', mission_id: missions[1].id, status: 'Approved', priority: 'Medium' },
      { id: 'REQ-105', mission_id: missions[2].id, status: 'Pending', priority: 'Medium' },
    ]);
    if (rErr) throw rErr;
    console.log('✅ Created 3 Item Requests');

    console.log('\n🌟 Database seeding completed successfully!');
  } catch (err) {
    console.error('❌ Seeding failed:', err);
  }
}

seed();
