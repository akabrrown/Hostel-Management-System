const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function cleanStaffProfiles() {
  console.log('Cleaning mock data from staff profiles...')
  
  // Find profiles with mock data
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, user_id, first_name, last_name, phone_number')
    .or('last_name.eq.TestUser,phone_number.eq.0555555555')
    
  if (error) {
    console.error('Error finding profiles:', error)
    return
  }
  
  if (profiles.length === 0) {
    console.log('No profiles with mock data found.')
    return
  }

  console.log(`Found ${profiles.length} profiles to clean.`)

  for (const p of profiles) {
    console.log(`Cleaning profile ${p.id} (User: ${p.user_id})`)
    
    // Check if first_name looks like just the email prefix (match regex or just assume?)
    // The user didn't explicitly ask to remove first name, but "and others" implies it.
    // However, removing first name leaves them nameless. The user said "fetch the information I provide and leave the rest".
    // If they provided the email, maybe the first name coming from the email is okay? 
    // But "TestUser" is definitely added.
    // I'll clear last_name and phone_number.
    
    const updates = {
      last_name: null,
      phone_number: null,
      // I'll also check if first_name is the email handle and if they want that gone too?
      // Based on previous interaction, they seem to care about "wrong" data.
      // "akayetb" as first name is derived from email. It's not "MockName".
      // "TestUser" is definitely mock.
    }

    const { error: updateError } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', p.id)
      
    if (updateError) {
      console.error(`Failed to update profile ${p.id}:`, updateError)
    } else {
      console.log(`Successfully cleaned profile ${p.id}`)
    }
  }
}

cleanStaffProfiles()
