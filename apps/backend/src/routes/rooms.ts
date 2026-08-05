import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';
import { getIO } from '../socket';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

const router = Router();

// Schema for room validation
const roomSchema = z.object({
  hostelId: z.string().uuid('Invalid hostel ID'),
  floorNumber: z.number().min(1, 'Floor number must be at least 1').max(10, 'Floor number too high'),
  roomNumber: z.string().min(1, 'Room number is required').max(10, 'Room number too long'),
  roomType: z.string().optional(), // In reality we should reference room_types table ID
  capacity: z.number().min(1, 'Capacity must be at least 1').max(6, 'Capacity too high'),
  monthlyFee: z.number().min(0, 'Monthly fee must be positive').optional(),
  gender: z.enum(['male', 'female', 'mixed', 'Male', 'Female', 'Any']).optional(),
  isActive: z.boolean().default(true),
  amenities: z.array(z.string()).optional(),
  bookingCategory: z.string().optional(),
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || '1');
    const limit = Math.min(parseInt((req.query.limit as string) || '10'), 50);
    const hostelId = req.query.hostelId as string;
    const floorNumber = req.query.floorNumber as string;
    // const roomType = req.query.roomType as string; // needs to match room_types
    const isActive = req.query.isActive as string;
    const available = req.query.available as string;

    let query = supabaseAdmin
      .from('rooms')
      .select(`
        *,
        floor:floors!inner(
          floor_number,
          block:blocks!inner(
            hostel:hostels(id, name, location, gender_allowed)
          )
        ),
        room_type:room_types(name, price)
      `, { count: 'exact' })
      .order('room_number', { ascending: true });

    if (hostelId) query = query.eq('floor.block.hostel.id', hostelId);
    if (floorNumber) query = query.eq('floor.floor_number', parseInt(floorNumber));
    if (isActive !== undefined) query = query.eq('status', isActive === 'true' ? 'available' : 'locked');
    // if (available === 'true') query = query.lt('current_occupancy', 'capacity'); // Need raw sql for column comparison or filter in memory

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: rooms, error, count } = await query;

    if (error) {
      console.warn('[Rooms API] Error fetching rooms:', error);
      return res.json({ data: [], pagination: { page, limit, total: 0, pages: 0 } });
    }

    let processedRooms = rooms?.map((room: any) => {
      const floorInfo = room.floor || {};
      const blockInfo = floorInfo.block || {};
      const hostelInfo = blockInfo.hostel || {};
      return {
        id: room.id,
        hostelId: hostelInfo.id,
        hostel: {
           name: hostelInfo.name,
           address: hostelInfo.location,
           gender: hostelInfo.gender_allowed
        },
        floorNumber: floorInfo.floor_number,
        roomNumber: room.room_number,
        capacity: room.capacity,
        current_occupancy: room.current_occupancy,
        availableBeds: Math.max(0, room.capacity - (room.current_occupancy || 0)),
        occupiedBeds: room.current_occupancy || 0,
        totalBeds: room.capacity,
        status: room.status,
        roomType: room.room_type?.name || 'Standard',
        monthlyFee: room.monthly_fee || room.room_type?.price || 0,
        amenities: room.amenities || [],
        gender: room.gender_allowed || hostelInfo.gender_allowed
      }
    }) || [];

    if (available === 'true') {
      processedRooms = processedRooms.filter(r => r.availableBeds > 0);
    }

    res.json({
      data: processedRooms,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// POST /api/rooms - Create new room (requires finding/creating floor and room_type)
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role || req.session?.role;
    if (userRole !== 'admin') return res.status(403).json({ error: 'Insufficient permissions' });

    const validatedData = roomSchema.parse(req.body);

    // Verify hostel exists
    const { data: hostel, error: hostelError } = await supabaseAdmin.from('hostels').select('id, capacity, room_pricing').eq('id', validatedData.hostelId).single();
    if (hostelError || !hostel) return res.status(404).json({ error: 'Hostel not found' });

    // 1. Get or Create Block (default 'Block A')
    let blockId;
    const { data: block } = await supabaseAdmin.from('blocks').select('id').eq('hostel_id', hostel.id).limit(1).maybeSingle();
    if (block) {
      blockId = block.id;
    } else {
      const { data: newBlock, error: be } = await supabaseAdmin.from('blocks').insert({ hostel_id: hostel.id, name: 'Block A' }).select().single();
      if (be) throw be;
      blockId = newBlock.id;
    }

    // 2. Get or Create Floor
    let floorId;
    const { data: floor } = await supabaseAdmin.from('floors').select('id').eq('block_id', blockId).eq('floor_number', validatedData.floorNumber).maybeSingle();
    if (floor) {
      floorId = floor.id;
    } else {
      const { data: newFloor, error: fe } = await supabaseAdmin.from('floors').insert({ block_id: blockId, floor_number: validatedData.floorNumber }).select().single();
      if (fe) throw fe;
      floorId = newFloor.id;
    }

    // Auto-assign monthly fee based on hostel pricing if not provided
    let finalFee = validatedData.monthlyFee;
    if (finalFee === undefined || finalFee === 0) {
      if (hostel.room_pricing) {
        if (validatedData.capacity === 1) finalFee = hostel.room_pricing.single || 0;
        else if (validatedData.capacity === 2) finalFee = hostel.room_pricing.double || 0;
        else finalFee = hostel.room_pricing.quadruple || 0;
      } else {
        finalFee = 0;
      }
    }

    // 3. Get or Create Room Type
    let roomTypeId;
    const rTypeName = validatedData.roomType || 'Standard';
    const { data: rt } = await supabaseAdmin.from('room_types').select('id').eq('hostel_id', hostel.id).eq('name', rTypeName).maybeSingle();
    if (rt) {
      roomTypeId = rt.id;
    } else {
      const { data: newRt, error: rte } = await supabaseAdmin.from('room_types').insert({ hostel_id: hostel.id, name: rTypeName, capacity: validatedData.capacity, price: finalFee }).select().single();
      if (rte) throw rte;
      roomTypeId = newRt.id;
    }

    // Check duplicate
    const { data: existingRoom } = await supabaseAdmin.from('rooms').select('id').eq('floor_id', floorId).eq('room_number', validatedData.roomNumber).maybeSingle();
    if (existingRoom) return res.status(409).json({ error: 'Room number already exists on this floor' });

    // Insert Room
    const { data: room, error } = await supabaseAdmin.from('rooms').insert({
      floor_id: floorId,
      room_type_id: roomTypeId,
      room_number: validatedData.roomNumber,
      capacity: validatedData.capacity,
      current_occupancy: 0,
      status: validatedData.isActive ? 'available' : 'maintenance',
      monthly_fee: finalFee,
      amenities: validatedData.amenities || [],
      booking_category: validatedData.bookingCategory || 'Student',
      gender_allowed: validatedData.gender ? (validatedData.gender.toLowerCase() === 'mixed' ? 'Any' : (validatedData.gender.charAt(0).toUpperCase() + validatedData.gender.slice(1).toLowerCase())) : null
    }).select().single();

    if (error) throw error;
    
    // Update hostel total capacity (not mandatory, but good to keep synced)
    await supabaseAdmin.from('hostels').update({ capacity: (hostel.capacity || 0) + validatedData.capacity }).eq('id', hostel.id)

    res.json({ message: 'Room created successfully', data: room });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Validation failed', details: error.errors });
    res.status(500).json({ error: 'Failed to create room' });
  }
});

router.put('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role || req.session?.role;
    if (userRole !== 'admin') return res.status(403).json({ error: 'Insufficient permissions' });

    const roomId = req.query.id as string;
    if (!roomId) return res.status(400).json({ error: 'Room ID is required' });

    const validatedData = roomSchema.partial().parse(req.body);

    const updatePayload: any = {};
    if (validatedData.capacity !== undefined) updatePayload.capacity = validatedData.capacity;
    if (validatedData.isActive !== undefined) updatePayload.status = validatedData.isActive ? 'available' : 'maintenance';
    if (validatedData.roomNumber) updatePayload.room_number = validatedData.roomNumber;
    if (validatedData.monthlyFee !== undefined) updatePayload.monthly_fee = validatedData.monthlyFee;
    if (validatedData.amenities !== undefined) updatePayload.amenities = validatedData.amenities;
    if (validatedData.bookingCategory !== undefined) updatePayload.booking_category = validatedData.bookingCategory;
    if (validatedData.gender !== undefined) {
      updatePayload.gender_allowed = validatedData.gender.toLowerCase() === 'mixed' ? 'Any' : (validatedData.gender.charAt(0).toUpperCase() + validatedData.gender.slice(1).toLowerCase());
    }

    const { data: room, error } = await supabaseAdmin.from('rooms').update(updatePayload).eq('id', roomId).select().single();
    if (error) throw error;

    res.json({ message: 'Room updated successfully', data: room });
  } catch (error) {
    if (error instanceof z.ZodError) return res.status(400).json({ error: 'Validation failed', details: error.errors });
    res.status(500).json({ error: 'Failed to update room' });
  }
});

router.delete('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role || req.session?.role;
    if (userRole !== 'admin') return res.status(403).json({ error: 'Insufficient permissions' });

    const roomId = req.query.id as string;
    if (!roomId) return res.status(400).json({ error: 'Room ID is required' });

    const { data: roomCheck } = await supabaseAdmin.from('rooms').select('current_occupancy, capacity, floors(blocks(hostel_id))').eq('id', roomId).single();
    if (!roomCheck) return res.status(404).json({ error: 'Room not found' });

    if (roomCheck.current_occupancy > 0) {
      return res.status(400).json({ error: 'Cannot delete room with occupants' });
    }

    const { error } = await supabaseAdmin.from('rooms').delete().eq('id', roomId);
    if (error) throw error;
    
    // Decrement hostel capacity
    try {
       const hostelId = (roomCheck as any).floors?.blocks?.hostel_id;
       if (hostelId) {
          const { data: h } = await supabaseAdmin.from('hostels').select('capacity').eq('id', hostelId).single();
          if (h) {
              await supabaseAdmin.from('hostels').update({ capacity: Math.max(0, h.capacity - roomCheck.capacity) }).eq('id', hostelId);
          }
       }
    } catch(e) {}

    res.json({ message: 'Room deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete room' });
  }
});

// POST /api/rooms/book - Book a room
router.post('/book', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role || req.session?.role;
    if (userRole !== 'student') return res.status(403).json({ error: 'Only students can book rooms' });

    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

    const bookingSchema = z.object({
      hostelId: z.string().uuid(),
      roomId: z.string().uuid(),
      academicYear: z.string(),
      semester: z.string()
    });

    const validatedData = bookingSchema.parse(req.body);

    // Find or create academic session first so we can check for existing bookings in this session
    let sessionId = null;
    const { data: session } = await supabaseAdmin
      .from('academic_sessions')
      .select('id')
      .eq('name', validatedData.academicYear)
      .limit(1)
      .maybeSingle();

    if (session) {
      sessionId = session.id;
    } else {
      const { data: newSession } = await supabaseAdmin
        .from('academic_sessions')
        .insert({ 
          name: validatedData.academicYear, 
          start_date: new Date().toISOString(),
          end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
          is_active: true 
        })
        .select()
        .single();
      if (newSession) sessionId = newSession.id;
    }

    // Check for existing active bookings
    const { data: existingBookings, error: existingError } = await supabaseAdmin
      .from('bookings')
      .select('id, status')
      .eq('student_id', studentId)
      .eq('academic_session_id', sessionId)
      .in('status', ['pending_payment', 'paid', 'allocated', 'checked_in']);

    if (existingError) {
      return res.status(500).json({ error: 'Failed to verify existing bookings' });
    }

    if (existingBookings && existingBookings.length > 0) {
      return res.status(409).json({ error: 'You already have an active or pending booking for this academic session.' });
    }

    // Get room details with price
    const { data: room, error: roomError } = await supabaseAdmin
      .from('rooms')
      .select('room_type_id, capacity, current_occupancy, room_types(price)')
      .eq('id', validatedData.roomId)
      .single();

    if (roomError || !room) {
      return res.status(404).json({ error: 'Room not found' });
    }

    if (room.current_occupancy >= room.capacity) {
      return res.status(400).json({ error: 'Room is fully booked' });
    }

    // Insert booking
    const { data: booking, error: bookingError } = await supabaseAdmin
      .from('bookings')
      .insert({
        student_id: studentId,
        hostel_id: validatedData.hostelId,
        room_id: validatedData.roomId,
        room_type_id: room.room_type_id,
        academic_session_id: sessionId,
        status: 'pending_payment',
        amount_paid: 0
      })
      .select()
      .single();

    if (bookingError) throw bookingError;

    // Generate Invoice/Pending Payment
    const roomPrice = (room.room_types as any)?.price || 0;
    const { error: paymentError } = await supabaseAdmin
      .from('finance_invoices')
      .insert({
        booking_id: booking.id,
        student_id: studentId,
        invoice_reference: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        amount: roomPrice,
        status: 'pending'
      });
      
    if (paymentError) {
      console.error('Failed to create payment record:', paymentError);
      // We don't rollback booking for now, just log it.
    }

    // Update room occupancy
    await supabaseAdmin
      .from('rooms')
      .update({ current_occupancy: (room.current_occupancy || 0) + 1 })
      .eq('id', validatedData.roomId);

    // Notify Admins and Porters
    try {
      const { data: staff } = await supabaseAdmin.from('users').select('id').in('role', ['admin', 'porter']);
      if (staff && staff.length > 0) {
        const io = getIO();
        staff.forEach(u => {
          io.to(`user_${u.id}`).emit('new_notification', {
            title: 'New Room Booking',
            message: `A new booking has been made for Room ${room.room_number || 'N/A'}.`
          });
        });
      }
    } catch (err) {
      console.error('Failed to send notifications:', err);
    }

    return res.json({ message: 'Room booked successfully', data: booking });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Booking error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
// POST /api/rooms/reserve - Reserve a room (no specific room selected)
router.post('/reserve', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role || req.session?.role;
    if (userRole !== 'student') return res.status(403).json({ error: 'Only students can reserve rooms' });

    const studentId = req.user?.id;
    if (!studentId) return res.status(401).json({ error: 'Unauthorized' });

    const reserveSchema = z.object({
      hostelId: z.string().uuid(),
      floorId: z.string().uuid().optional(),
      roomTypeId: z.string().uuid(),
      academicYear: z.string(),
      semester: z.string(),
      specialRequests: z.string().optional()
    });

    const validatedData = reserveSchema.parse(req.body);

    // Find or create academic session first
    let sessionId = null;
    const { data: session } = await supabaseAdmin
      .from('academic_sessions')
      .select('id')
      .eq('name', validatedData.academicYear)
      .limit(1)
      .maybeSingle();

    if (session) {
      sessionId = session.id;
    } else {
      const { data: newSession } = await supabaseAdmin
        .from('academic_sessions')
        .insert({ 
          name: validatedData.academicYear, 
          start_date: new Date().toISOString(),
          end_date: new Date(new Date().setFullYear(new Date().getFullYear() + 1)).toISOString(),
          is_active: true 
        })
        .select()
        .single();
      if (newSession) sessionId = newSession.id;
    }

    // Check for existing active bookings/reservations
    const { data: existingBookings, error: existingError } = await supabaseAdmin
      .from('bookings')
      .select('id, status')
      .eq('student_id', studentId)
      .eq('academic_session_id', sessionId)
      .in('status', ['pending_payment', 'paid', 'allocated', 'checked_in']);

    if (existingError) {
      return res.status(500).json({ error: 'Failed to verify existing reservations' });
    }

    if (existingBookings && existingBookings.length > 0) {
      return res.status(409).json({ error: 'You already have an active or pending reservation for this academic session.' });
    }

    // Get room type price
    const { data: roomType, error: typeError } = await supabaseAdmin
      .from('room_types')
      .select('price')
      .eq('id', validatedData.roomTypeId)
      .single();

    if (typeError || !roomType) {
      return res.status(404).json({ error: 'Room type not found' });
    }

    // Insert reservation (booking with no room_id)
    const { data: reservation, error: resError } = await supabaseAdmin
      .from('bookings')
      .insert({
        student_id: studentId,
        hostel_id: validatedData.hostelId,
        room_id: null,
        room_type_id: validatedData.roomTypeId,
        academic_session_id: sessionId,
        status: 'pending_payment',
        amount_paid: 0
      })
      .select()
      .single();

    if (resError) throw resError;

    // Generate Invoice/Pending Payment
    const roomPrice = roomType.price || 0;
    const { error: paymentError } = await supabaseAdmin
      .from('finance_invoices')
      .insert({
        booking_id: reservation.id,
        student_id: studentId,
        invoice_reference: `INV-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        amount: roomPrice,
        status: 'pending'
      });
      
    if (paymentError) {
      console.error('Failed to create payment record:', paymentError);
    }

    // Notify Admins and Porters
    try {
      const { data: staff } = await supabaseAdmin.from('users').select('id').in('role', ['admin', 'porter']);
      if (staff && staff.length > 0) {
        const io = getIO();
        staff.forEach(u => {
          io.to(`user_${u.id}`).emit('new_notification', {
            title: 'New Room Reservation',
            message: `A new reservation has been made and is pending allocation.`
          });
        });
      }
    } catch (err) {
      console.error('Failed to send notifications:', err);
    }

    return res.json({ message: 'Room reserved successfully', data: reservation });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    console.error('Reservation error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
