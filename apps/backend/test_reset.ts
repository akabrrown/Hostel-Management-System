
import * as dotenv from 'dotenv';
dotenv.config();
import { authenticateUser, verifyMockOtp, completeInitialReset } from './src/lib/auth';

async function run() {
    try {
        console.log('1. Login with 12345678');
        const loginRes = await authenticateUser('12345678', '20000101');
        console.log('Login result:', loginRes);

        console.log('\n2. Verify OTP');
        const otpRes = await verifyMockOtp(loginRes.tempToken, '123456');
        console.log('OTP result:', otpRes);

        console.log('\n3. Complete Initial Reset');
        const resetRes = await completeInitialReset(otpRes.tempToken, 'NewSecurePassword123!');
        console.log('Reset result:', resetRes);
    } catch(err: any) {
        console.error('Error:', err.message);
    }
}
run();
