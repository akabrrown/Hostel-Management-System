const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function getUserEmail() {
  const userId = '9103b6fa-186e-4d6c-a684-6301ceee8895'
  
  const { data: user, error } = await supabase
    .from('users')
    .select('email')
    .eq('id', userId)
    .single()
    
  if (user) {
    console.log(`Email for user ${userId}: ${user.email}`)
  } else {
    console.log('User not found')
  }
}

getUserEmail()
