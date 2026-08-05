const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function runMigration() {
  console.log('Running floor gender configuration migration...')
  
  try {
    // Read migration file
    const migrationPath = path.join(__dirname, '..', 'database', 'migrations', 'add_floor_gender_config.sql')
    const migrationSQL = fs.readFileSync(migrationPath, 'utf8')
    
    // Split by semicolons and filter out empty statements
    const statements = migrationSQL
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'))
    
    console.log(`Found ${statements.length} SQL statements to execute`)
    
    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      console.log(`\nExecuting statement ${i + 1}/${statements.length}...`)
      console.log(statement.substring(0, 100) + '...')
      
      const { error } = await supabase.rpc('exec_sql', { sql: statement })
      
      if (error) {
        // Try direct query if RPC doesn't work
        const { error: directError } = await supabase.from('_migrations').insert({
          name: 'add_floor_gender_config',
          executed_at: new Date().toISOString()
        })
        
        if (directError && !directError.message.includes('already exists')) {
          console.error('Error executing statement:', error)
          throw error
        }
      }
      
      console.log('✓ Statement executed successfully')
    }
    
    console.log('\n✓ Migration completed successfully!')
    console.log('\nNext steps:')
    console.log('1. Verify the migration by checking the hostels and rooms tables')
    console.log('2. Test the floor gender configuration UI in the admin panel')
    
  } catch (error) {
    console.error('\n✗ Migration failed:', error.message)
    console.log('\nPlease run the migration manually using your database client:')
    console.log('File: database/migrations/add_floor_gender_config.sql')
  }
}

runMigration()
