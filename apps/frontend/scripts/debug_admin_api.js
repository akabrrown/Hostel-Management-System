const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

async function testQueries() {
  console.log('--- Testing Admin Stats Queries ---')

  // 1. Role Lookup
  const { data: roleData, error: roleError } = await supabase
    .from('roles')
    .select('id')
    .eq('name', 'student')
    .single()
  
  if (roleError) console.error('Role Lookup Error:', roleError)
  else console.log('Student Role ID:', roleData.id)

  if (roleData) {
    // 2. Total Students
    const { count: totalStudents, error: studentError } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('role_id', roleData.id)

    if (studentError) console.error('Total Students Query Error:', studentError)
    else console.log('Total Students:', totalStudents)

    // 3. Recent Students (Stats)
    const { data: recent, error: recentError } = await supabase
      .from('users')
      .select(`
        id, 
        created_at,
        profiles(first_name, last_name)
      `)
      .eq('role_id', roleData.id)
      .limit(2)
      
    if (recentError) console.error('Recent Students Stats Error:', recentError)
    else console.log('Recent Students (Stats): OK', recent.length)
  }

  // 4. Rooms Headers
  const { data: rooms, error: roomError } = await supabase
    .from('rooms')
    .select('capacity, current_occupancy')
    .limit(1)
    
  if (roomError) console.error('Room Stats Error:', roomError)
  else console.log('Room Stats: OK')

  console.log('\n--- Testing Admin Students List Queries ---')
  if (roleData) {
    // 5. Students List Query (as used in users endpoint)
    // Note: Removed !inner to see if that's the issue, or keep it to reproduce
    const { data: list, error: listError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        index_number,
        created_at,
        profiles (
          first_name,
          last_name,
          phone_number,
          date_of_birth,
          program,
          year_of_study,
          academic_year
        ),
        accommodations (
          id,
          bed_number,
          room:rooms (
            room_number,
            floor_number,
            hostel:hostels (name)
          )
        ),
        bookings (
          status
        )
      `)
      .eq('role_id', roleData.id)
      .limit(5)

    if (listError) {
        console.error('Students List Query Error:', listError)
    } else {
        console.log('Students List Query: OK', list.length)
        if (list.length > 0) {
            console.log('First student sample:', JSON.stringify(list[0], null, 2))
        }
    }
  }
}

testQueries()
