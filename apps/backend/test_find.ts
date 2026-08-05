import * as dotenv from 'dotenv';
dotenv.config();

import { supabase } from './src/lib/supabase';

async function run() {
    const email = 'UPSA12345678@upsamail.edu.gh';
    console.log('Finding user by email:', email);
    const { data, error } = await supabase
        .from('users')
        .select('*, students(*)')
        .eq('email', email)
        .single();
    
    console.log('Result:', data, error);
}

run();
