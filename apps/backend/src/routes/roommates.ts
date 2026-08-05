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
    const user = req.user;
    
    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    // 1. Get current user's active accommodation with room and hostel details
    const { data: myAccommodation, error: accError } = await supabaseAdmin
      .from('bookings')
      .select(`
        room_id,
        hostel:hostels(name),
        room:rooms(room_number)
      `)
      .eq('student_id', user.id)
      .in('status', ['pending_payment', 'paid', 'allocated', 'checked_in'])
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle()

    if (accError) {
      console.warn('[Roommates Route] Error fetching accommodations, returning empty:', accError);
      return res.json({ 
        roommates: [],
        roomInfo: null,
        message: 'No active accommodation found for this user.'
      });
    }

    if (!myAccommodation || !myAccommodation.room_id) {
      return res.json({ 
        roommates: [],
        roomInfo: null,
        message: 'No active accommodation found for this user.'
      });
    }

    const roomInfo = {
      roomNumber: (myAccommodation.room as any)?.room_number,
      hostelName: (myAccommodation as any)?.hostel?.name
    }

    // 2. Fetch all students in the same room (including current user)
    const { data: rawRoommates, error: roomError } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        updated_at,
        student:students (
          user_id,
          full_name,
          programme,
          level,
          gender,
          date_of_birth,
          user:users (
            id,
            email,
            index_number,
            phone
          )
        )
      `)
      .eq('room_id', myAccommodation.room_id)
      .in('status', ['pending_payment', 'paid', 'allocated', 'checked_in'])

    if (roomError) throw roomError

    // 3. Fetch unread messages count for current user
    const { data: unreadMessages } = await supabaseAdmin
      .from('messages')
      .select('sender_id')
      .eq('recipient_id', user.id)
      .eq('is_read', false)

    // Create a map of sender_id -> count
    const unreadMap = new Map<string, number>()
    if (unreadMessages) {
      unreadMessages.forEach((msg: any) => {
        const count = unreadMap.get(msg.sender_id) || 0
        unreadMap.set(msg.sender_id, count + 1)
      })
    }

    // 4. Process and format roommate data
    const roommates = rawRoommates?.map((r: any) => {
      const student = r.student || {}
      const userRec = student.user || {}
      return {
        id: userRec.id || student.user_id,
        name: student.full_name || 'Anonymous Student',
        indexNumber: userRec.index_number || '',
        program: student.programme || 'Not stated',
        yearOfStudy: student.level ? `Level ${student.level}` : 'Not stated',
        email: userRec.email,
        phone: userRec.phone || 'Not provided',
        bedNumber: 'N/A', // Deprecated bed numbers
        checkInDate: r.updated_at,
        isAvailable: true,
        isMe: (userRec.id || student.user_id) === user.id,
        unreadCount: unreadMap.get(userRec.id || student.user_id) || 0
      }
    })
    
    // Sort so 'Me' is first
    roommates?.sort((a: any, b: any) => (a.isMe === b.isMe) ? 0 : a.isMe ? -1 : 1)

    return res.json({
      roommates: roommates || [],
      roomInfo
    });

  } catch (error) {
    console.error('Error fetching roommates:', error)
    return res.status(500).json({ error: 'Failed to fetch roommates' });
  }
});

export default router;
