const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { authenticateUser } = require('./lib/auth');

async function testAuth() {
  try {
    const result = await authenticateUser('akayetb@gmail.com', 'Option#5');
    console.log('Success:', result);
  } catch (error) {
    console.error('Test failed:', error);
  }
}
testAuth();
