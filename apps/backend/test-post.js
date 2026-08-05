const http = require('http');

const data = JSON.stringify([
  {
    roomNumber: "A-999",
    hostelId: "658b8bf8-a28c-44a8-a79a-cb41dc8e9a2f",
    floorNumber: "1",
    roomType: "Double",
    capacity: "2",
    condition: "good",
    amenities: []
  }
]);

const options = {
  hostname: 'localhost',
  port: 4000,
  path: '/api/admin/admin-rooms',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(data),
    // we need to mock auth if requireAuth is present, wait...
  }
};

const req = http.request(options, (res) => {
  console.log(`STATUS: ${res.statusCode}`);
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log(`BODY: ${chunk}`);
  });
});

req.on('error', (e) => {
  console.error(`problem with request: ${e.message}`);
});

req.write(data);
req.end();
