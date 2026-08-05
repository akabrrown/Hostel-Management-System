const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function findCorruptedProfiles() {
  console.log('Scanning for corrupted profiles (FirstName == IndexNumber)...')
  
  const { data: profiles, error } = await supabase
    .from('profiles')
    .select('id, user_id, first_name, last_name, student_id')
    
  if (error) {
    console.error('Error fetching profiles:', error)
    return
  }

  const suspicious = profiles.filter(p => {
    // Check if first_name looks like an index number (8 digits) or matches student_id
    const isDigitName = /^\d+$/.test(p.first_name)
    const matchesStudentId = p.first_name === p.student_id
    const matchesIndexInName = p.student_id && p.first_name && p.student_id.includes(p.first_name)
    
    return isDigitName || matchesStudentId || matchesIndexInName
  })

  console.log(`Found ${suspicious.length} suspicious profiles.`)
  
  if (suspicious.length > 0) {
    console.log('Suspicious Profiles:')
    suspicious.forEach(p => {
      console.log(`- User: ${p.user_id}, Name: ${p.first_name} ${p.last_name}, StudentID: ${p.student_id}`)
    })
    
    // Save to file for review
    const fs = require('fs')
    fs.writeFileSync('suspicious_profiles.txt', JSON.stringify(suspicious, null, 2))
    console.log('List saved to suspicious_profiles.txt')
  }
}

findCorruptedProfiles()
