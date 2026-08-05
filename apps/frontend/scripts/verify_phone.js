const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('Missing Supabase credentials')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function verifyUserProfile(email) {
  console.log(`Verifying profile for ${email}...`)
  
  // 1. Get User ID
  console.log(`Querying public.users for ${email}...`)
  const { data: publicUser, error: publicUserError } = await supabase
    .from('users')
    .select('id, email')
    .eq('email', email)
    .single()

  if (publicUserError || !publicUser) {
    console.error('User not found in public.users:', publicUserError)
    return
  }

  console.log('Found public user:', publicUser.id)

  // 2. Get Profile
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('*')
    .eq('user_id', publicUser.id)

  if (profileError) {
    console.error('Error fetching profile:', profileError)
  } else if (profiles.length === 0) {
    console.log('NO PROFILE FOUND for user', publicUser.id)
  } else {
    console.log('Profile Data:', profiles[0])
    console.log('Phone Number:', profiles[0].phone_number)
  }
}

const fs = require('fs')

// List recent users to debug
async function listUsers() {
  console.log('Listing recent users...')
  const { data: users, error } = await supabase
    .from('users')
    .select('email, id')
    .limit(10)
    
  if (error) {
    console.error('Error listing users:', error)
    return
  }
  
  const output = users.map(u => `- ${u.email} (${u.id})`).join('\n')
  fs.writeFileSync('users_list.txt', output)
  console.log('User list written to users_list.txt')
  
  const targetEmail = 'akayeteb@upsamail.edu.gh'
  await verifyUserProfile(targetEmail)
}

listUsers()
