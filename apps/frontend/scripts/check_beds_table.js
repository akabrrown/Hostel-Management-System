const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function checkBedsTable() {
  const { data, error } = await supabase
    .from('beds')
    .select('*', { count: 'exact', head: true })
  
  if (error) {
    console.error('Beds table error:', error.message)
  } else {
    console.log('Beds table exists!')
  }
}

checkBedsTable()
