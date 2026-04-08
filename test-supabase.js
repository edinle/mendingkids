import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || import.meta.env?.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY || import.meta.env?.VITE_SUPABASE_PUBLISHABLE_DEFAULT_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase URL or Key missing. Check .env file.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('Testing Supabase connection...');
  try {
    // Try to fetch one row from any likely table or just check the client
    const { data, error } = await supabase.from('inventory').select('*').limit(1);
    
    if (error) {
      console.log('Connected to Supabase project, but encountered an error querying "inventory":');
      console.log('Error Message:', error.message);
      console.log('Error Code:', error.code);
      
      if (error.code === 'PGRST116' || error.message.includes('not found')) {
        console.log('\nSUCCESS: Connection works, but the "inventory" table does not exist yet or is empty.');
      }
    } else {
      console.log('\nSUCCESS: Successfully connected and retrieved data!');
      console.log('Sample data:', data);
    }
  } catch (err) {
    console.error('Unexpected error:', err.message);
  }
}

testConnection();
