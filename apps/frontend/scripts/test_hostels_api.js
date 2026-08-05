async function testHostelsApi() {
  try {
    const response = await fetch('http://localhost:3000/api/hostels');
    const data = await response.json();
    console.log('Hostels API response for Hostel A:');
    const hostelA = data.hostels.find(h => h.name === 'Hostel A');
    console.log(JSON.stringify(hostelA, null, 2));
  } catch (error) {
    console.error('Error testing API:', error.message);
  }
}

testHostelsApi();
