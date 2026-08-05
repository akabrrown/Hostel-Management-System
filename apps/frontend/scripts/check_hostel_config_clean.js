const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function checkHostel() {
  const hostelId = '171e4f8e-4b24-433b-b3e5-db369627bd74'
  const { data: hostel, error } = await supabase
    .from('hostels')
    .select('name, total_floors, floor_gender_config')
    .eq('id', hostelId)
    .single()
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Hostel:', hostel.name)
  console.log('Total Floors:', hostel.total_floors)
  console.log('Floor Config:', JSON.stringify(hostel.floor_gender_config, null, 2))
}

checkHostel()
