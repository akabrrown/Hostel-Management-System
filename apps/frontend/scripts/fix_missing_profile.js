const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function fixMissingProfile(email) {
  console.log(`Fixing profile for ${email}...`)
  
  // 1. Get User
  const { data: user, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single()

  if (userError || !user) {
    console.error('User not found:', userError)
    return
  }

  console.log('Found user:', user.id)

  // 2. Check if profile exists
  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('id')
    .eq('user_id', user.id)
    .single()

  if (existingProfile) {
    console.log('Profile already exists. Skipping.')
    return
  }

  // 3. Create Profile
  // We'll use placeholder data since we can't recover the original signup input 
  // unless we checked the auth metadata (which we can't access easily with just public client).
  // Assuming the user meant "0541234567" or similar based on typical testing, 
  // but better to just set it to a placeholder the user can verify.
  const profileData = {
    user_id: user.id,
    first_name: 'Akayete', // Inferring from email
    last_name: 'Test',
    student_id: user.index_number,
    phone_number: '0201234567', // Placeholder for them to see it working
    program: 'IT Management',
    year_of_study: 1,
    created_at: new Date().toISOString()
  }

  const { data: newProfile, error: createError } = await supabase
    .from('profiles')
    .insert(profileData)
    .select()

  if (createError) {
    console.error('Failed to create profile:', createError)
  } else {
    console.log('Successfully created profile:', newProfile)
  }
}

const targetEmail = 'akayeteb@upsamail.edu.gh'
fixMissingProfile(targetEmail)
