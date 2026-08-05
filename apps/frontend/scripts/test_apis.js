const axios = require('axios')

async function testApi() {
  try {
    console.log('Testing /api/admin/rooms...')
    const res1 = await axios.get('http://localhost:3000/api/admin/rooms')
    console.log('Rooms status:', res1.status)
  } catch (err) {
    console.log('Rooms error:', err.response?.status, err.response?.data || err.message)
  }

  try {
    console.log('\nTesting /api/admin/hostels/171e4f8e-4b24-433b-b3e5-db369627bd74/floor-config...')
    const res2 = await axios.get('http://localhost:3000/api/admin/hostels/171e4f8e-4b24-433b-b3e5-db369627bd74/floor-config')
    console.log('Floor config status:', res2.status)
  } catch (err) {
    console.log('Floor config error:', err.response?.status, err.response?.data || err.message)
  }
}

testApi()
