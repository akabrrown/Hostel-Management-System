import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
import bcrypt from 'bcryptjs';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Missing Supabase environment variables');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

async function createAdmin() {
  const email = 'akayetb@gmail.com';
  const password = 'Option#5';
  
  console.log(`Creating admin user: ${email}...`);

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase.from('users').insert({
      email: email,
      password_hash: passwordHash,
      role: 'admin',
      status: 'active'
    }).select().single();

    if (error) {
      if (error.code === '23505') {
        console.log('User already exists. Updating password and role to admin...');
        const { error: updateError } = await supabase.from('users').update({
          password_hash: passwordHash,
          role: 'admin',
          status: 'active'
        }).eq('email', email);
        
        if (updateError) {
          console.error('Failed to update existing user:', updateError);
        } else {
          console.log('Successfully updated existing user to admin.');
        }
      } else {
        console.error('Error creating user:', error);
      }
    } else {
      console.log('Successfully created admin user:', data.id);
      
      // Also try to create a profile just in case it's needed
      await supabase.from('profiles').insert({
        user_id: data.id,
        first_name: 'Admin',
        last_name: 'User'
      });
    }

    console.log('Done.');
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

createAdmin();
