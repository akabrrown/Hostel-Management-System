const { createClient } = require('@supabase/supabase-js')
const { z } = require('zod')
require('dotenv').config({ path: '.env' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const supabase = createClient(supabaseUrl, supabaseServiceRoleKey)

const hostelSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  address: z.string().min(1, 'Address is required').max(200, 'Address too long'),
  description: z.string().optional(),
  gender: z.enum(['male', 'female', 'mixed']),
  totalFloors: z.number().min(1, 'At least 1 floor').max(10, 'Too many floors'),
  wardenName: z.string().min(1, 'Warden name is required').max(100, 'Warden name too long'),
  wardenEmail: z.string().email('Invalid email'),
  wardenPhone: z.string().min(10, 'Phone too short').max(15, 'Phone too long'),
  isActive: z.boolean().default(true),
  amenities: z.array(z.string()).optional(),
  roomPricing: z.object({
    single: z.number().min(0, 'Single room price must be positive'),
    double: z.number().min(0, 'Double room price must be positive'),
    quadruple: z.number().min(0, 'Quadruple room price must be positive')
  })
})

async function test() {
  console.log('--- Testing Floors Table Existence ---')
  const { error: tableError } = await supabase.from('floors').select('*').limit(1)
  if (tableError) {
      console.log('Floors table query error:', tableError.message)
  } else {
      console.log('Floors table exists.')
  }

  console.log('\n--- Testing Validation ---')
  // Mock data as per frontend logs
  const mockData = {
    name: 'Hostel A',
    address: 'IPS Road',
    description: 'Oldest hostel',
    gender: 'mixed', // Frontend sends 'mixed' (lowercase)
    totalFloors: 6,
    wardenName: 'Test Warden',
    wardenEmail: 'test.warden@upsamail.edu.gh',
    wardenPhone: '0555555555', // 10 digits
    isActive: true,
    amenities: ['WiFi', 'Security'],
    roomPricing: {
      single: 1200,
      double: 800,
      quadruple: 600
    }
  }

  try {
    const valid = hostelSchema.parse(mockData)
    console.log('Validation passed for mock data.')
  } catch (e) {
    console.error('Validation FAILED for mock data:', JSON.stringify(e.errors, null, 2))
  }
}

test()
