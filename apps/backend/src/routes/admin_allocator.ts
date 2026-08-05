import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const router = Router();

export const dynamic = 'force-dynamic'

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ error: 'Forbidden - Admin access required' });
    }

    // Fetch bookings (acting as reservations/applications)
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select(`
        *,
        hostel:hostels (name),
        room_type:room_types (name),
        student:students (
          full_name,
          programme,
          level,
          user_id,
          user:users!inner (
            index_number,
            email,
            phone
          )
        )
      `)
      .is('room_id', null)
      .order('created_at', { ascending: false })

    if (bookingsError) {
      console.warn('[Admin Allocator Route] Error fetching bookings:', bookingsError);
      return res.json([]);
    }

    if (!bookings || bookings.length === 0) {
      return res.json([])
    }

    // Transform the data to match the frontend interface
    const formattedReservations = bookings.map((booking: any) => {
      const studentInfo = booking.student || {}
      const userInfo = studentInfo.user || {}
      
      return {
        id: booking.id, // Using booking ID as reservation ID
        studentId: booking.student_id,
        studentName: studentInfo.full_name || 'Unknown',
        indexNumber: userInfo.index_number || 'N/A',
        email: userInfo.email || 'N/A',
        phone: userInfo.phone || 'N/A',
        program: studentInfo.programme || 'N/A',
        yearOfStudy: studentInfo.level || 'N/A',
        
        // Preferences mapped from the booking choices
        preferredHostel: booking.hostel?.name || 'Any Hostel',
        preferredHostelId: booking.hostel_id || '',
        preferredFloor: 0, // Not explicitly captured in new bookings schema
        preferredFloorId: '', 
        preferredRoomType: booking.room_type?.name || 'Any Type',
        preferredRoomTypeId: booking.room_type_id || '',
        
        // Status and dates
        status: ['allocated', 'checked_in', 'checked_out'].includes(booking.status) ? 'allocated' : 'pending',
        submissionDate: booking.created_at,
        academicYear: 'Current', // Usually derived from academic_session_id
        semester: 'Current',
        
        // Additional info
        specialRequests: '',
        notes: ''
      }
    })

    return res.json(formattedReservations)
  } catch (error) {
    console.warn('[Admin Allocator Route] Unexpected error:', error);
    return res.json([]);
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body
    
    // reservationId is now mapping to booking.id
    const { 
      reservationId, 
      studentId, 
      hostelId, 
      roomNumber, 
      notes 
    } = body

    if (!reservationId || !studentId || !hostelId || !roomNumber) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // 1. Find the room_id and floor number
    const { data: room, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select('id, current_occupancy, capacity, floor_id, floors!inner(floor_number)')
      .eq('hostel_id', hostelId)
      .eq('room_number', roomNumber)
      .maybeSingle()

    if (roomError) {
      return res.status(500).json({ error: 'Database error searching for room' });
    }

    if (!room) {
      return res.status(404).json({ error: `Room "${roomNumber}" not found in this hostel.` });
    }

    if (room.current_occupancy >= room.capacity) {
      return res.status(400).json({ error: 'Room is already at full capacity' });
    }

    // 2. Fetch student gender to validate the allocation rule
    const { data: student, error: studentError } = await supabaseAdmin
      .from('students')
      .select('gender')
      .eq('user_id', studentId)
      .single()
      
    if (!studentError && student && student.gender) {
       const gender = student.gender.toLowerCase()
       const floorData = Array.isArray(room.floors) ? room.floors[0] : room.floors
       if (floorData && floorData.floor_number !== undefined) {
          const floorNumber = floorData.floor_number
          const isOddFloor = floorNumber % 2 !== 0
          
          if (gender === 'female' && !isOddFloor) {
            return res.status(400).json({ error: `Gender allocation rule violated: Female students must be allocated to odd-numbered floors (Floor ${floorNumber} is not allowed).` })
          }
          if (gender === 'male' && isOddFloor) {
            return res.status(400).json({ error: `Gender allocation rule violated: Male students must be allocated to even-numbered floors (Floor ${floorNumber} is not allowed).` })
          }
       }
    }

    // 3. Update Booking status and attach room (Replaces creating accommodations)
    const { error: updateBookingError } = await supabaseAdmin
      .from('bookings')
      .update({ 
        status: 'allocated', 
        room_id: room.id
      })
      .eq('id', reservationId)

    if (updateBookingError) throw updateBookingError

    // 4. Update room occupancy with atomic lock (Risk 5.1)
    const { data: updatedRoom, error: updateRoomError } = await supabaseAdmin
      .from('rooms')
      .update({ current_occupancy: room.current_occupancy + 1 })
      .eq('id', room.id)
      .lt('current_occupancy', room.capacity)
      .select()
      .maybeSingle()

    if (updateRoomError) throw updateRoomError
    
    if (!updatedRoom) {
      // Revert booking status if room update fails due to race condition
      await supabaseAdmin.from('bookings').update({ status: 'pending', room_id: null }).eq('id', reservationId);
      return res.status(409).json({ error: 'Room reached full capacity before allocation completed.' });
    }

    return res.json({ message: 'Room allocated successfully' });
  } catch (error: any) {
    console.error('Error in allocation API:', error)
    return res.status(500).json({ error: error.message || 'Internal server error' });
  }
});

export default router;
