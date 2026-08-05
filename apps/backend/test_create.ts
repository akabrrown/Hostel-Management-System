import { supabase } from './src/lib/supabase';
import { mockFetchStudentDetails } from './src/services/schoolDbMock';
import bcrypt from 'bcryptjs';

async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12
  return await bcrypt.hash(password, saltRounds)
}

async function run() {
    try {
        const password = '2000-01-01';
        const studentData = await mockFetchStudentDetails('12345678', password);
        const hashedPassword = await hashPassword(password);
        
        console.log('Inserting into users...');
        const { data: newUser, error: userError } = await supabase.from('users').insert({
            email: studentData.email,
            password_hash: hashedPassword,
            index_number: studentData.indexNumber,
            role: 'student',
            status: 'active',
        }).select().single();
        
        if (userError) {
            console.error('User Insert Error:', userError);
            return;
        }

        console.log('Inserting into students...');
        const { error: studentError } = await supabase.from('students').insert({
            user_id: newUser.id,
            full_name: `${studentData.firstName} ${studentData.lastName}`,
            programme: studentData.programOfStudy || 'Unknown',
            level: studentData.level || '100',
            date_of_birth: studentData.dateOfBirth || '2000-01-01',
            gender: 'unknown',
            next_of_kin_name: 'Unknown',
            next_of_kin_phone: 'Unknown'
        });

        if (studentError) {
            console.error('Student Insert Error:', studentError);
        } else {
            console.log('Success!');
        }

    } catch (err) {
        console.error('Exception:', err);
    }
}

run();
