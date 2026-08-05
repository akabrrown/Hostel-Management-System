import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });
dotenv.config({ path: './.env' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkColumns() {
  const { data, error } = await supabase.from('rooms').select('*').limit(1);
  if (error) {
    console.log('Error fetching rooms:', error.message);
  } else if (data.length > 0) {
    console.log('rooms columns:', Object.keys(data[0]));
  } else {
    console.log('rooms table is empty, cannot infer columns.');
  }
}
checkColumns();
