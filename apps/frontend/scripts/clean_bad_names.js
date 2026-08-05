const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function cleanBadNames() {
  console.log('Scanning for profiles with invalid names to clean...')
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, user_id, first_name, last_name, student_id')
    
  if (error) {
    console.error('Error fetching profiles:', error)
    return
  }

  const suspicious = profiles.filter(p => {
    // Check if first_name looks like an index number (8 digits) or matches student_id
    // Also include cases where name is identical to part of student ID
    const isDigitName = /^\d+$/.test(p.first_name)
    const matchesStudentId = p.first_name === p.student_id
    const matchesIndexInName = p.student_id && p.first_name && p.student_id.includes(p.first_name)
    
    return isDigitName || matchesStudentId || matchesIndexInName
  })

  console.log(`Found ${suspicious.length} profiles to clean.`)
  
  if (suspicious.length === 0) {
    console.log('No records to clean.')
    return
  }

  for (const p of suspicious) {
    console.log(`Cleaning profile: ${p.id} (Name was: ${p.first_name})`)
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({
        first_name: null,
        last_name: null
      })
      .eq('id', p.id)
      
    if (updateError) {
      console.error(`Failed to update profile ${p.id}:`, updateError)
    } else {
      console.log(`Successfully cleaned profile ${p.id}`)
    }
  }
}

cleanBadNames()
