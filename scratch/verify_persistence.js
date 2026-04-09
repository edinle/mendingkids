import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

const supabase = createClient(supabaseUrl, supabaseKey);

async function verifyAddBatch() {
  console.log('Testing Add Batch functionality...');
  
  const item = {
    description: 'Test Item ' + Date.now(),
    company: 'Test Co',
    reference_number: 'REF-' + Date.now()
  };

  try {
    // 1. Upsert should create new inventory item
    const { data: inv, error: invErr } = await supabase
      .from('inventory')
      .upsert(item, { onConflict: 'description,reference_number' })
      .select()
      .single();
    
    if (invErr) throw invErr;
    console.log('Inventory item created/found:', inv.id);

    // 2. Insert first shipment
    const { data: ship1, error: shipErr1 } = await supabase
      .from('shipments')
      .insert({ inventory_id: inv.id, quantity: 10, location: 'Loc A' })
      .select()
      .single();
    if (shipErr1) throw shipErr1;
    console.log('Shipment 1 created:', ship1.id);

    // 3. Insert second shipment (Add Batch)
    const { data: ship2, error: shipErr2 } = await supabase
      .from('shipments')
      .insert({ inventory_id: inv.id, quantity: 20, location: 'Loc B' })
      .select()
      .single();
    if (shipErr2) throw shipErr2;
    console.log('Shipment 2 created:', ship2.id);

    // 4. Verify count
    const { data: allShips, error: countErr } = await supabase
      .from('shipments')
      .select('*')
      .eq('inventory_id', inv.id);
    
    if (countErr) throw countErr;
    console.log(`Found ${allShips.length} shipments for inventory item.`);
    
    if (allShips.length === 2) {
      console.log('SUCCESS: Add Batch working correctly.');
    } else {
      console.log('FAILURE: Expected 2 shipments, found', allShips.length);
    }

  } catch (err) {
    console.error('Verification failed:', err.message);
  }
}

verifyAddBatch();
