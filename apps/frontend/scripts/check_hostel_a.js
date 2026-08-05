const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function checkHostelA() {
  const { data: hostel, error: hError } = await supabase
    .from('hostels')
    .select('id, name, code')
    .eq('name', 'Hostel A')
    .single()
  
  if (hError) {
    console.error('Hostel A error:', hError.message)
    return
  }
  
  console.log('Hostel found:', hostel)
  
  const { data: rooms, error: rError } = await supabase
    .from('rooms')
    .select('id, room_number, capacity, current_occupancy')
    .eq('hostel_id', hostel.id)
  
  if (rError) {
    console.error('Rooms error:', rError.message)
    return
  }
  
  console.log(`Found ${rooms.length} rooms for Hostel A`)
  const totalBeds = rooms.reduce((sum, r) => sum + r.capacity, 0)
  const occupiedBeds = rooms.reduce((sum, r) => sum + (r.current_occupancy || 0), 0)
  console.log(`Total beds: ${totalBeds}, Occupied: ${occupiedBeds}`)
}

checkHostelA()
