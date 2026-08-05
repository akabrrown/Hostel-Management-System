import { Router, Response } from 'express';
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
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: porter } = await supabaseAdmin
      .from('porters')
      .select('assigned_hostel_id')
      .eq('user_id', userId)
      .single()

    let hostelId = porter?.assigned_hostel_id

    if (!hostelId) {
      const { data: firstHostel } = await supabaseAdmin.from('hostels').select('id').limit(1).maybeSingle()
      hostelId = firstHostel?.id
    }

    if (!hostelId) {
       return res.json({ data: [] });
    }

    // Fetch all rooms for this hostel
    const { data: rooms, error: roomsError } = await supabaseAdmin
      .from('rooms')
      .select('id, room_number, floor_number, capacity, current_occupancy, room_type')
      .eq('hostel_id', hostelId)
      .order('floor_number', { ascending: true })
      .order('room_number', { ascending: true })

    if (roomsError) {
      console.error('Error fetching porter rooms:', roomsError);
      return res.status(500).json({ error: 'Failed to fetch rooms' });
    }

    if (!rooms || rooms.length === 0) {
      return res.json({ data: [] });
    }

    const roomIds = rooms.map(r => r.id)

    // Fetch active bookings (allocated or checked_in) for these rooms, with student info
    const { data: bookings, error: bookingsError } = await supabaseAdmin
      .from('bookings')
      .select(`
        id,
        room_id,
        status,
        student:students (
          user_id,
          full_name,
          gender,
          user:users (
            index_number,
            phone
          )
        )
      `)
      .in('room_id', roomIds)
      .in('status', ['allocated', 'checked_in', 'paid'])

    if (bookingsError) {
      console.error('Error fetching bookings for rooms:', bookingsError);
    }

    // Build a map: room_id -> array of occupants
    const occupantsByRoom = new Map<string, any[]>();
    (bookings || []).forEach((booking: any) => {
      const studentProfile = booking.student;
      if (!studentProfile) return;
      
      const userInfo = studentProfile.user;
      const nameParts = (studentProfile.full_name || '').split(' ');
      
      const occupant = {
        firstName: nameParts[0] || '',
        lastName: nameParts.slice(1).join(' ') || '',
        indexNumber: userInfo?.index_number || '',
        phone: userInfo?.phone || '',
        gender: studentProfile.gender || '',
        bookingStatus: booking.status
      };

      const list = occupantsByRoom.get(booking.room_id) || [];
      list.push(occupant);
      occupantsByRoom.set(booking.room_id, list);
    });

    // Group rooms by floor
    const floorMap = new Map<number, any>();

    rooms.forEach(room => {
      const floorNum = room.floor_number ?? 0;

      if (!floorMap.has(floorNum)) {
        floorMap.set(floorNum, { floorNumber: floorNum, rooms: [] });
      }

      const occupants = occupantsByRoom.get(room.id) || [];

      // Build synthetic bed list from capacity
      const beds = [];
      for (let i = 0; i < room.capacity; i++) {
        beds.push({
          id: `${room.id}-bed-${i + 1}`,
          bedNumber: `${i + 1}`,
          isAvailable: i >= occupants.length,
          occupant: occupants[i] || null
        });
      }

      floorMap.get(floorNum).rooms.push({
        id: room.id,
        roomNumber: room.room_number,
        capacity: room.capacity,
        currentOccupancy: room.current_occupancy || occupants.length,
        roomType: room.room_type,
        beds
      });
    });

    const floorsArray = Array.from(floorMap.values()).sort((a, b) => a.floorNumber - b.floorNumber);

    return res.json({ data: floorsArray });

  } catch (error) {
    console.error('Porter rooms error:', error)
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
