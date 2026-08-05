const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function checkHostel() {
  const hostelId = '171e4f8e-4b24-433b-b3e5-db369627bd74'
  console.log(`Checking hostel ${hostelId}...\n`)
  
  const { data: hostel, error } = await supabase
    .from('hostels')
    .select('*')
    .eq('id', hostelId)
    .single()
  
  if (error) {
    console.error('Error:', error)
    return
  }
  
  console.log('Hostel data:', JSON.stringify(hostel, null, 2))
}

checkHostel()
