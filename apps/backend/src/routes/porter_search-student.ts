import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const router = Router();





router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Search params mapped to req.query
    const query = req.query['query'] as string

    if (!query) {
      return res.json({ data: null });
    }

    // Search for student by index number, first name, or last name
    // We join students and users
    const { data: searchResults, error } = await supabaseAdmin
      .from('students')
      .select(`
        user_id,
        full_name,
        user:users!inner (
          id,
          email,
          index_number
        ),
        bookings (
          status,
          room:rooms (
            room_number,
            hostel:hostels (name)
          )
        )
      `)
      .or(`full_name.ilike.%${query}%,user.index_number.ilike.%${query}%`)
      .limit(1)

    if (error || !searchResults || searchResults.length === 0) {
      return res.json({ data: null });
    }

    const student = searchResults[0] as any
    const userRec = student.user || {}
    const activeBooking = (student.bookings || []).find((b: any) => b.status === 'checked_in' || b.status === 'allocated')
    const room = activeBooking?.room as any

    const transformedStudent = {
      id: userRec.id || student.user_id,
      firstName: student.full_name?.split(' ')[0] || '',
      lastName: student.full_name?.split(' ').slice(1).join(' ') || '',
      indexNumber: userRec.index_number,
      email: userRec.email,
      room: room ? {
        roomNumber: room.room_number,
        hostel: room.hostel?.name
      } : null
    }

    return res.json({ data: transformedStudent });

  } catch (error) {
    console.error('Search student error:', error)
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
