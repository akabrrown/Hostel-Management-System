import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const router = Router();

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Search params mapped to req.query
    const page = parseInt(req.query['page'] as string || '1')
    const limit = parseInt(req.query['limit'] as string || '10')
    const status = req.query['status'] as string
    const search = req.query['search'] as string

    const offset = (page - 1) * limit

    // 1. Build Query against `students` joined with `users`, `bookings`, `finance_invoices` (for payments)
    let query = supabaseAdmin
      .from('students')
      .select(`
        user_id,
        full_name,
        programme,
        level,
        date_of_birth,
        created_at,
        user:users!inner (
          email,
          index_number,
          phone,
          status
        ),
        bookings (
          id,
          status,
          hostel:hostels (name),
          room:rooms (
            room_number,
            floor:floors(floor_number)
          )
        )
      `, { count: 'exact' })

    // 2. Apply Filters
    if (search) {
       // Note: To filter by index_number which is on the joined table, you can do:
       query = query.ilike('user.index_number', `%${search}%`)
    }

    // 3. Pagination
    query = query
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    const { data: studentsData, error, count } = await query

    if (error) throw error

    // Fetch payments for these students (join finance_invoices -> payments)
    // To simplify for the dashboard, let's just get any pending payments in the system to count them,
    // and for the specific students, we can query their bookings' payments.
    const bookingIds = (studentsData || []).flatMap(s => (s.bookings || []).map((b: any) => b.id))
    
    let studentPayments: any[] = []
    if (bookingIds.length > 0) {
      const { data: payData } = await supabaseAdmin
        .from('payments')
        .select('booking_id, status')
        .in('booking_id', bookingIds)
      if (payData) studentPayments = payData
    }

    // 4. Transform Data & Derive Status
    const transformedStudents = (studentsData || []).map((s: any) => {
      const allBookings = s.bookings || []
      const activeAccommodation = allBookings.find((b: any) => b.status === 'allocated' || b.status === 'checked_in')
      const pendingBooking = allBookings.some((b: any) => b.status === 'pending_payment' || b.status === 'paid')
      
      const userInfo = s.user || {}
      const nameParts = (s.full_name || '').split(' ')
      const firstName = nameParts[0] || 'N/A'
      const lastName = nameParts.slice(1).join(' ') || ''
      
      // Derive accommodation status
      let derivedAccStatus = 'none'
      if (activeAccommodation) derivedAccStatus = 'allocated'
      else if (pendingBooking) derivedAccStatus = 'pending'

      // Derive payment status
      const sPayments = studentPayments.filter(p => allBookings.some((b: any) => b.id === p.booking_id))
      const hasConfirmedPayment = sPayments.some((p: any) => p.status === 'paid')
      
      let derivedPaymentStatus = 'pending'
      if (hasConfirmedPayment) derivedPaymentStatus = 'paid'

      return {
        id: s.user_id,
        firstName,
        lastName,
        indexNumber: userInfo.index_number,
        email: userInfo.email,
        phoneNumber: userInfo.phone,
        phone: userInfo.phone,
        dateOfBirth: s.date_of_birth,
        programOfStudy: s.programme || 'N/A',
        yearOfStudy: s.level || '0',
        accommodationStatus: derivedAccStatus,
        paymentStatus: derivedPaymentStatus,
        status: userInfo.status || 'active',
        academicYear: 'N/A', // Deprecated in favor of academic_sessions
        accommodation: activeAccommodation ? {
           hostel: {
             name: activeAccommodation.hostel?.name
           },
           room: {
             roomNumber: activeAccommodation.room?.room_number
           },
           floorNumber: activeAccommodation.room?.floor?.floor_number
        } : null
      }
    })

    // 5. Fetch Global Stats for Dashboard
    const [{ count: allocatedCount }, { count: uniquePendingCount }] = await Promise.all([
      // Allocated count
      supabaseAdmin
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .in('status', ['allocated', 'checked_in']),
      
      // Pending payments count (unique invoices/bookings)
      supabaseAdmin
        .from('payments')
        .select('id', { count: 'exact', head: true })
        .eq('status', 'pending')
    ])

    // Filter by status in memory if requested 
    let finalStudents = transformedStudents
    if (status) {
      finalStudents = transformedStudents.filter((s: any) => s.accommodationStatus === status)
    }

    return res.json({
      students: finalStudents,
      stats: {
        total: count || 0,
        allocated: allocatedCount || 0,
        unallocated: Math.max(0, (count || 0) - (allocatedCount || 0)),
        overdue: uniquePendingCount || 0 
      },
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit)
      }
    });

  } catch (error) {
    console.warn('[Admin Students Route] Error fetching students, returning defaults:', error)
    return res.json({
      students: [],
      stats: {
        total: 0,
        allocated: 0,
        unallocated: 0,
        overdue: 0
      },
      pagination: { page: 1, limit: 10, total: 0, pages: 0 }
    });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body
    const { action, studentId, data } = body

    if (!action || !studentId) {
      return res.status(400).json({ error: 'Action and student ID are required' });
    }

    switch (action) {
      case 'allocate_room':
        if (!data.roomId) {
            return res.status(400).json({ error: 'Room ID required' });
        }

        const { data: roomInfo } = await supabaseAdmin.from('rooms').select('room_type_id, floors(block_id)').eq('id', data.roomId).single();
        const roomTypeId = roomInfo?.room_type_id;
        let hostelId = null;
        if (roomTypeId) {
            const { data: rt } = await supabaseAdmin.from('room_types').select('hostel_id').eq('id', roomTypeId).single();
            hostelId = rt?.hostel_id;
        }

        const { error: allocationError } = await supabaseAdmin
          .from('bookings')
          .insert({
            student_id: studentId,
            hostel_id: hostelId,
            room_type_id: roomTypeId,
            room_id: data.roomId,
            academic_session_id: data.academicSessionId || null,
            status: 'allocated'
          })

        if (allocationError) throw allocationError

        const { data: roomToInc } = await supabaseAdmin.from('rooms').select('current_occupancy').eq('id', data.roomId).single()
        if (roomToInc) {
             await supabaseAdmin.from('rooms').update({ current_occupancy: (roomToInc.current_occupancy || 0) + 1 }).eq('id', data.roomId)
        }

        return res.json({ message: 'Room allocated successfully' });

      case 'deallocate_room':
        const { data: bToDealloc } = await supabaseAdmin.from('bookings').select('room_id').eq('student_id', studentId).eq('status', 'allocated').single();
        
        const { error: deallocError } = await supabaseAdmin
          .from('bookings')
          .delete()
          .eq('student_id', studentId)
          .eq('status', 'allocated')
        
        if (deallocError) throw deallocError

        if (bToDealloc && bToDealloc.room_id) {
           const { data: roomToDec } = await supabaseAdmin.from('rooms').select('current_occupancy').eq('id', bToDealloc.room_id).single()
           if (roomToDec && roomToDec.current_occupancy > 0) {
               await supabaseAdmin.from('rooms').update({ current_occupancy: roomToDec.current_occupancy - 1 }).eq('id', bToDealloc.room_id)
           }
        }

        return res.json({ message: 'Room deallocated successfully' });

      default:
        return res.status(400).json({ error: 'Invalid action or not supported' });
    }

  } catch (error) {
    console.error('Student management error:', error)
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
