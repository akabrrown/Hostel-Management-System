const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.error('❌ Missing Supabase credentials in .env.local')
  process.exit(1)
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
)

async function createTestUser(emailPrefix) {
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
  
  // Also create a record in public.users to satisfy foreign key constraints
  // Note: role_id 3 = student (based on typical setup: 1=admin, 2=porter, 3=student, 4=director)
  const { error: publicUserError } = await supabase
    .from('users')
    .insert({
      id: data.user.id,
      email: email,
      password_hash: 'dummy_hash_for_test', // Not used since auth is handled by auth.users
      role_id: 3, // Student role
      is_active: true,
      email_verified: true
    })
  
  if (publicUserError) {
    // If user already exists, that's okay - might be from a previous failed test
    if (!publicUserError.message.includes('duplicate key')) {
      throw new Error(`Failed to create public user record: ${publicUserError.message}`)
    }
  }
  
  return data.user
}

async function runLoadTest() {
  console.log('🚀 Starting Atomic Booking Load Test...\n')
  
  // 1. Find an available bed
  const { data: bed, error: bedError } = await supabase
    .from('beds')
    .select('id, room_id, bed_number')
    .eq('is_available', true)
    .limit(1)
    .single()

  if (bedError || !bed) {
    console.error('❌ No available beds found to test')
    console.error('Error:', bedError)
    return
  }

  console.log(`🎯 Target Bed: ${bed.bed_number} (ID: ${bed.id})`)
  console.log(`   Room ID: ${bed.room_id}\n`)

  // 2. Create 5 test users
  const users = []
  console.log('👥 Creating 5 test users...')
  for (let i = 0; i < 5; i++) {
    try {
      const user = await createTestUser(`loadtest-user-${i}`)
      users.push(user)
      console.log(`   ✓ User ${i + 1} created`)
    } catch (e) {
      console.error(`   ✗ Failed to create user ${i + 1}:`, e.message)
    }
  }
  console.log(`✅ Created ${users.length} users\n`)

  if (users.length === 0) {
    console.error('❌ No users created, cannot proceed with test')
    return
  }

  // 3. Launch Concurrent Requests
  console.log('⚡ Launching concurrent booking requests...\n')
  
  const promises = users.map((user, index) => {
    return supabase.rpc('book_room_atomic', {
      p_user_id: user.id,
      p_room_id: bed.room_id,
      p_bed_id: bed.id,
      p_semester: 'First Semester',
      p_academic_year: '2024/2025'
    }).then(res => ({ 
      userId: user.id, 
      userIndex: index + 1,
      result: res 
    }))
  })

  const results = await Promise.all(promises)

  // 4. Analyze Results
  const successes = results.filter(r => r.result.data?.success)
  const failures = results.filter(r => !r.result.data?.success)

  console.log('--- 📊 Test Results ---')
  console.log(`Total Requests: ${results.length}`)
  console.log(`Successes: ${successes.length}`)
  console.log(`Failures: ${failures.length}\n`)

  results.forEach((r) => {
    const status = r.result.data?.success ? '✅ SUCCESS' : '❌ FAILED'
    const msg = r.result.data?.message || r.result.error?.message || 'Unknown error'
    console.log(`User ${r.userIndex}: ${status} - ${msg}`)
  })

  console.log('\n--- 🎯 Test Verdict ---')
  if (successes.length === 1 && failures.length === users.length - 1) {
    console.log('✅ TEST PASSED: Only 1 booking succeeded, race condition prevented!')
    console.log('   The atomic booking function is working correctly.')
  } else {
    console.log('❌ TEST FAILED: Unexpected number of successes.')
    console.log(`   Expected: 1 success, ${users.length - 1} failures`)
    console.log(`   Got: ${successes.length} success(es), ${failures.length} failure(s)`)
  }

  // 5. Cleanup
  console.log('\n🧹 Cleaning up test data...')
  
  // Clear the booking if any succeeded
  if (successes.length > 0) {
      const userId = successes[0].userId
      await supabase.from('accommodations').delete().eq('user_id', userId)
      await supabase.from('beds').update({ is_available: true }).eq('id', bed.id)
      
      // Manual update room occupancy
      const { data: room } = await supabase.from('rooms').select('current_occupancy').eq('id', bed.room_id).single()
      if (room) {
        await supabase.from('rooms').update({ current_occupancy: Math.max(0, room.current_occupancy - 1) }).eq('id', bed.room_id)
      }
      console.log('   ✓ Removed test booking')
  }

  // Delete users from both auth and public tables
  for (const user of users) {
    await supabase.from('users').delete().eq('id', user.id)
    await supabase.auth.admin.deleteUser(user.id)
  }
  console.log('   ✓ Deleted test users')
  console.log('✅ Cleanup complete.\n')
}

runLoadTest().catch(err => {
  console.error('❌ Test failed with error:', err)
  process.exit(1)
})
