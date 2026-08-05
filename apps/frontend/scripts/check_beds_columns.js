const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function checkBedsColumns() {
  const { data, error } = await supabase
    .from('beds')
    .select('*')
    .limit(1)
  
  if (error) {
    console.error('Beds error:', error.message)
    return
  }
  
  if (data.length > 0) {
    console.log('Beds columns:', Object.keys(data[0]))
  } else {
    console.log('Beds table is empty, trying to get schema info...')
    // We can try to insert a fake record and see errors if we want, or rely on other scripts
  }
}

checkBedsColumns()
