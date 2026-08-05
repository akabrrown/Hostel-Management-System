import * as dotenv from 'dotenv';
dotenv.config(); // Loads .env

import { authenticateUser } from './src/lib/auth';

async function run() {
    try {
        console.log('Testing authenticateUser...');
        const result = await authenticateUser('12345678@upsamail.edu.gh', '20000101', 'student');
        console.log('Success!', result);
    } catch (err: any) {
        console.error('Test Failed with Error:', err.message);
        console.error(err);
    }
}

run();
