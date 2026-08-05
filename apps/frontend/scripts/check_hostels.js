const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function checkHostels() {
  console.log('Fetching hostels from database...\n')
  
  const { data: hostels, error } = await supabase
    .from('hostels')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(5)
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Found', hostels.length, 'hostels:\n')
  
  hostels.forEach((hostel, index) => {
    console.log(`\n=== Hostel ${index + 1}: ${hostel.name} ===`)
    console.log('ID:', hostel.id)
    console.log('Code:', hostel.code)
    console.log('Address:', hostel.address)
    console.log('Description:', hostel.description)
    console.log('Gender:', hostel.gender)
    console.log('Total Floors:', hostel.total_floors)
    console.log('Warden Name:', hostel.warden_name)
    console.log('Warden Email:', hostel.warden_email)
    console.log('Warden Phone:', hostel.warden_phone)
    console.log('Is Active:', hostel.is_active)
    console.log('Amenities:', hostel.amenities)
    console.log('Room Pricing:', JSON.stringify(hostel.room_pricing, null, 2))
    console.log('Floor Gender Config:', JSON.stringify(hostel.floor_gender_config, null, 2))
    console.log('Created At:', hostel.created_at)
  })
}

checkHostels()
