const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

const fs = require('fs')

async function listStaffProfiles() {
  console.log('Fetching staff users...')
  
  const { data: users, error } = await supabase
    .from('users')
    .select(`
      id, 
      email, 
      role_id, 
      role:roles(name),
      profile:profiles(id, first_name, last_name, phone_number)
    `)
    
  if (error) {
    console.error('Error fetching users:', error)
    return
  }
  
  const staff = users.filter(u => u.role?.name !== 'student')
  
  if (staff.length === 0) {
    console.log('No staff users found.')
    return
  }

  let output = `Found ${staff.length} staff users:\n`
  staff.forEach(u => {
    output += `- Role: ${u.role?.name}, Email: ${u.email}\n`
    if (u.profile && u.profile.length > 0) {
      output += `  Profile: ${JSON.stringify(u.profile[0])}\n`
    } else {
      output += `  Profile: [NONE]\n`
    }
  })
  
  fs.writeFileSync('staff_profiles.txt', output)
  console.log('Staff profiles written to staff_profiles.txt')
}

listStaffProfiles()
