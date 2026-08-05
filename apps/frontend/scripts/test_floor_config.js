const http = require('http')

function test(url) {
  return new Promise((resolve) => {
    console.log(`Testing ${url}...`)
    http.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`)
        console.log(`Data: ${data.substring(0, 100)}...`)
        resolve()
      })
    }).on('error', (err) => {
      console.log(`Error: ${err.message}\n`)
      resolve()
    })
  })
}

async function run() {
  await test('http://localhost:3000/api/admin/hostels/171e4f8e-4b24-433b-b3e5-db369627bd74/floor-config')
}

run()
