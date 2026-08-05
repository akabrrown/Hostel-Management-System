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

async function createUser(email: string, role: string, firstName: string, lastName: string) {
  const password = 'Option#5';
  
  console.log(`Creating ${role} user: ${email}...`);

  try {
    const passwordHash = await bcrypt.hash(password, 10);

    const { data, error } = await supabase.from('users').insert({
      email: email,
      password_hash: passwordHash,
      role: role,
      status: 'active'
    }).select().single();

    if (error) {
      if (error.code === '23505') {
        console.log(`User ${email} already exists. Updating password and role to ${role}...`);
        const { error: updateError } = await supabase.from('users').update({
          password_hash: passwordHash,
          role: role,
          status: 'active'
        }).eq('email', email);
        
        if (updateError) {
          console.error('Failed to update existing user:', updateError);
        } else {
          console.log(`Successfully updated existing user to ${role}.`);
        }
      } else {
        console.error('Error creating user:', error);
      }
    } else {
      console.log(`Successfully created ${role} user:`, data.id);
      
      await supabase.from('profiles').insert({
        user_id: data.id,
        first_name: firstName,
        last_name: lastName
      });
    }
  } catch (err) {
    console.error('Unexpected error:', err);
  }
}

async function run() {
  await createUser('akayetb@gmail.com', 'admin', 'Admin', 'User');
  await createUser('akayeteb@gmail.com', 'porter', 'Porter', 'User');
  console.log('Done.');
}

run();
