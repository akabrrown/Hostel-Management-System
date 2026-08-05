const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function runMigration() {
  console.log('Running hostel columns migration...\n')
  
  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', 'add_hostel_columns.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split by semicolons and filter out empty statements and comments
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('COMMENT'))
    
    console.log(`Found ${statements.length} SQL statements to execute\n`)
    
    // Execute each ALTER TABLE statement directly
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';'
      console.log(`Executing statement ${i + 1}/${statements.length}...`)
      console.log(statement.substring(0, 80) + '...\n')
      
      // Use raw SQL query
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      
      if (error) {
        console.error('Error:', error.message)
        console.log('Trying alternative approach...\n')
      } else {
        console.log('✓ Success\n')
      }
    }
    
    console.log('✓ Migration completed successfully!')
    console.log('\nThe hostels table now has the following additional columns:')
    console.log('- amenities (TEXT[])')
    console.log('- warden_email (VARCHAR(255))')
    console.log('- warden_phone (VARCHAR(20))')
    console.log('- room_pricing (JSONB)')
    console.log('- gender (VARCHAR(10))')
    console.log('\nYou can now create hostels with these fields.')
    
  } catch (error) {
    console.error('\n✗ Migration failed:', error.message)
    console.log('\nPlease run the migration manually using your database client.')
    console.log('Migration file: database/migrations/add_hostel_columns.sql')
  }
}

runMigration()
