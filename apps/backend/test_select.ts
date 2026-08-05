import * as dotenv from 'dotenv';
dotenv.config();

import { supabase } from './src/lib/supabase';

async function run() {
    const { data, error } = await supabase
        .from('users')
        .select('*');
    
    console.log('All Users:', data, error);
}

run();
