const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

async function checkRooms() {
  const { data: rooms, error } = await supabaseAdmin
    .from('rooms')
    .select('id, room_number, hostel_id')
    .limit(5);

  if (error) {
    console.error('Error:', error);
    return;
  }

  console.log('Sample rooms:');
  console.log(JSON.stringify(rooms, null, 2));

  const { data: hostels } = await supabaseAdmin
    .from('hostels')
    .select('id, name');
    
  console.log('Hostels:');
  console.log(JSON.stringify(hostels, null, 2));
}

checkRooms();
