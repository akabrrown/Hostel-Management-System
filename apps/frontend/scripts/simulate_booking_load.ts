
import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { v4 as uuidv4 } from 'uuid'

// Load environment variables
dotenv.config({ path: '.env.local' })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createTestUser(emailPrefix: string) {
  const email = `${emailPrefix}-${Date.now()}@test.com`
  const password = 'password123'
  
  const { data, error } = await supabase.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  })

  if (error || !data.user) {
    throw new Error(`Failed to create user: ${error?.message}`)
  }
  
  // Create public user record if trigger didn't catch it (sometimes fails in test envs)
  // Assuming trigger works, but let's be safe for fk constraints
  // Actually, usually triggers handle this.
  
  return data.user
}

async function runLoadTest() {
  console.log('🚀 Starting Atomic Booking Load Test...')
  
  // 1. Find an available bed
  const { data: bed } = await supabase
    .from('beds')
    .select('id, room_id, bed_number')
    .eq('is_available', true)
    .limit(1)
    .single()

  if (!bed) {
    console.error('❌ No available beds found to test')
    return
  }

  console.log(`🎯 Target Bed: ${bed.bed_number} (ID: ${bed.id})`)

  // 2. Create 5 test users
  const users = []
  console.log('Creating 5 test users...')
  for (let i = 0; i < 5; i++) {
    try {
      const user = await createTestUser(`loadtest-user-${i}`)
      users.push(user)
    } catch (e) {
      console.error(e)
    }
  }
  console.log(`✅ Created ${users.length} users`)

  // 3. Launch Concurrent Requests
  console.log('⚡ Launching 5 concurrent booking requests...')
  
  const promises = users.map(user => {
    return supabase.rpc('book_room_atomic', {
      p_user_id: user.id,
      p_room_id: bed.room_id,
      p_bed_id: bed.id,
      p_semester: 'First Semester',
      p_academic_year: '2024/2025'
    }).then(res => ({ userId: user.id, result: res }))
  })

  const results = await Promise.all(promises)

  // 4. Analyze Results
  const successes = results.filter(r => r.result.data?.success)
  const failures = results.filter(r => !r.result.data?.success)

  console.log('\n--- 📊 Test Results ---')
  console.log(`Total Requests: ${results.length}`)
  console.log(`Successes: ${successes.length}`)
  console.log(`Failures: ${failures.length}`)

  results.forEach((r, i) => {
    const status = r.result.data?.success ? '✅ SUCCESS' : '❌ FAILED'
    const msg = r.result.data?.message || r.result.error?.message
    console.log(`Req ${i+1}: ${status} - ${msg}`)
  })

  if (successes.length === 1 && failures.length === 4) {
    console.log('\n✅ TEST PASSED: Only 1 booking succeeded, race condition prevented.')
  } else {
    console.log('\n❌ TEST FAILED: Unexpected number of successes (Should be exactly 1).')
  }

  // 5. Cleanup
  console.log('\nCleaning up test data...')
  
  // Clear the booking if any succeeded
  if (successes.length > 0) {
      // Find the accommodation
      const userId = successes[0].userId
      await supabase.from('accommodations').delete().eq('user_id', userId)
      await supabase.from('beds').update({ is_available: true, current_student_id: null }).eq('id', bed.id)
      
      // Manual update room occupancy
      const { data: room } = await supabase.from('rooms').select('current_occupancy').eq('id', bed.room_id).single()
      if (room) {
        await supabase.from('rooms').update({ current_occupancy: Math.max(0, room.current_occupancy - 1) }).eq('id', bed.room_id)
      }
  }

  // Delete users
  for (const user of users) {
    await supabase.auth.admin.deleteUser(user.id)
  }
  console.log('Cleanup complete.')
}

runLoadTest().catch(console.error)
