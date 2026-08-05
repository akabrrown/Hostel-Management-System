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




// GET /api/admin/rooms - Fetch all rooms with hostel information
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  console.log('GET /api/admin/rooms hit')
  try {
    // Search params mapped to req.query
    const hostelId = req.query['hostelId'] as string
    const page = parseInt(req.query['page'] as string || '1')
    const limit = parseInt(req.query['limit'] as string) || Number.MAX_SAFE_INTEGER;

    // Apply pagination logic bypassing Supabase 1000 row max limit
    const requestedFrom = (page - 1) * limit;
    const requestedTo = requestedFrom + limit - 1;
    
    let allRooms: any[] = [];
    let totalCount = 0;
    let currentFrom = requestedFrom;
    let keepFetching = true;
    
    while (keepFetching && allRooms.length < limit) {
      const currentTo = Math.min(currentFrom + 999, requestedTo);
      let query = supabaseAdmin
        .from('rooms')
        .select(`
          *,
          floor:floors(
            floor_number,
            block:blocks(
              hostel:hostels(id, name)
            )
          ),
          room_type:room_types(name, price)
        `, { count: 'exact' })
        .order('room_number', { ascending: true });

      if (hostelId) {
        query = query.eq('floor.block.hostel.id', hostelId);
      }

      query = query.range(currentFrom, currentTo);
      const { data, error, count } = await query;

      if (error) throw error;

      if (count !== null) totalCount = count;
      
      const fetchedRooms = data || [];
      allRooms = allRooms.concat(fetchedRooms);

      if (fetchedRooms.length < 1000) {
        keepFetching = false;
      }
      currentFrom += 1000;
    }

    const rooms = allRooms;
    const count = totalCount;

    // Transform data to match frontend Room interface
    let processedRooms = rooms?.map((room: any) => {
      const floorObj = room.floor || {};
      const blockObj = floorObj.block || {};
      const hostelObj = blockObj.hostel || {};
      return {
        id: room.id,
        roomNumber: room.room_number,
        hostel: hostelObj.name || 'Unknown',
        hostelId: hostelObj.id || '',
        floor: floorObj.floor_number ?? 1,
        type: room.room_type?.name || 'Double',
        capacity: room.capacity ?? 2,
        occupied: room.current_occupancy ?? 0,
        available: Math.max(0, (room.capacity || 0) - (room.current_occupancy || 0)),
        status: room.status === 'maintenance' 
          ? 'maintenance' 
          : ((room.current_occupancy || 0) >= (room.capacity || 1) 
              ? 'occupied' 
              : ((room.current_occupancy || 0) > 0 ? 'partially_occupied' : 'available')),
        condition: room.status === 'maintenance' ? 'poor' : 'good',
        lastMaintenance: room.updated_at || new Date().toISOString(),
        nextMaintenance: new Date(new Date(room.updated_at || Date.now()).getTime() + 180 * 24 * 60 * 60 * 1000).toISOString(),
        occupants: [],
        amenities: room.amenities || [],
        monthlyRent: room.monthly_fee || room.room_type?.price || 0,
        isActive: room.status !== 'maintenance',
        bookingCategory: room.booking_category || 'Student',
      };
    }) || []

    // Sort by floor number ascending, then naturally by room number
    processedRooms.sort((a: any, b: any) => {
      if (a.floor !== b.floor) {
        return (a.floor || 0) - (b.floor || 0);
      }
      const roomA = String(a.roomNumber || '');
      const roomB = String(b.roomNumber || '');
      return roomA.localeCompare(roomB, undefined, { numeric: true });
    });

    return res.json({
      rooms: processedRooms,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.warn('[Admin Rooms Route] Error fetching rooms, returning defaults:', error)
    return res.json({
      rooms: [],
      pagination: {
        page: 1,
        limit: 50,
        total: 0,
        pages: 0,
      },
    });
  }
});
// POST /api/admin/admin-rooms - Create new room(s)
router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const body = req.body
    const roomsToCreate = Array.isArray(body) ? body : [body]

    const results = []
    
    const isUuid = (str: string) => /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);

    // Fetch hostel room_pricing to auto-assign price
    const hostelIdToFetch = roomsToCreate.length > 0 && isUuid(roomsToCreate[0]?.hostelId) ? roomsToCreate[0].hostelId : null;
    let roomPricing: any = null;
    let floorGenderConfig: any = null;
    if (hostelIdToFetch) {
      const { data: hostelData } = await supabaseAdmin.from('hostels').select('room_pricing, floor_gender_config').eq('id', hostelIdToFetch).maybeSingle();
      if (hostelData) {
        if (hostelData.room_pricing) roomPricing = hostelData.room_pricing;
        if (hostelData.floor_gender_config) floorGenderConfig = hostelData.floor_gender_config;
      }
    }
    
    // Cache IDs to avoid N+1 queries during bulk insert
    let blockCache = new Map<string, string>();
    let floorCache = new Map<string, string>();
    let roomTypeCache = new Map<string, string>();
    let existingRoomsCache = new Map<string, Set<string>>();

    for (const roomData of roomsToCreate) {
      if (!roomData || typeof roomData !== 'object') continue;

      if (!roomData.hostelId || typeof roomData.hostelId !== 'string' || !isUuid(roomData.hostelId.trim())) {
        results.push({ success: false, roomNumber: roomData.roomNumber || 'Unknown', error: 'Please select a valid hostel' });
        continue;
      }

      if (roomData.floorNumber === undefined || roomData.floorNumber === null || roomData.floorNumber === '' || isNaN(parseInt(roomData.floorNumber))) {
        results.push({ success: false, roomNumber: roomData.roomNumber || 'Unknown', error: 'Valid floor number is required' });
        continue;
      }

      if (!roomData.roomNumber || typeof roomData.roomNumber !== 'string') {
        results.push({ success: false, roomNumber: 'Unknown', error: 'Room number is required' });
        continue;
      }

      const capacity = parseInt(roomData.capacity) || 2;
      let finalPrice = parseFloat(roomData.pricePerSemester);
      
      if (isNaN(finalPrice)) {
         finalPrice = 0;
         if (roomPricing) {
            if (capacity === 1) finalPrice = roomPricing.single || 0;
            else if (capacity === 2) finalPrice = roomPricing.double || 0;
            else finalPrice = roomPricing.quadruple || 0;
         }
      }

      // 1. Get or Create Block
      let blockId = blockCache.get(roomData.hostelId);
      if (!blockId) {
        const { data: block } = await supabaseAdmin.from('blocks').select('id').eq('hostel_id', roomData.hostelId).limit(1).maybeSingle();
        if (block) {
          blockId = block.id;
        } else {
          const { data: newBlock, error: be } = await supabaseAdmin.from('blocks').insert({ hostel_id: roomData.hostelId, name: 'Block A' }).select().single();
          if (be) {
             results.push({ success: false, roomNumber: roomData.roomNumber, error: be.message });
             continue;
          }
          blockId = newBlock.id;
        }
        blockCache.set(roomData.hostelId, blockId as string);
      }

      // 2. Get or Create Floor
      const floorKey = `${blockId}_${roomData.floorNumber}`;
      let floorId = floorCache.get(floorKey);
      if (!floorId) {
        const { data: floor } = await supabaseAdmin.from('floors').select('id').eq('block_id', blockId).eq('floor_number', parseInt(roomData.floorNumber)).maybeSingle();
        if (floor) {
          floorId = floor.id;
        } else {
          const { data: newFloor, error: fe } = await supabaseAdmin.from('floors').insert({ block_id: blockId, floor_number: parseInt(roomData.floorNumber) }).select().single();
          if (fe) {
             results.push({ success: false, roomNumber: roomData.roomNumber, error: fe.message });
             continue;
          }
          floorId = newFloor.id;
        }
        floorCache.set(floorKey, floorId as string);

        // Fetch existing rooms for this floor to prevent duplicates
        const existingRoomNumbers = new Set<string>();
        const { data: existingRooms } = await supabaseAdmin.from('rooms').select('room_number').eq('floor_id', floorId);
        if (existingRooms) {
           existingRooms.forEach((r: any) => existingRoomNumbers.add(r.room_number));
        }
        existingRoomsCache.set(floorId as string, existingRoomNumbers);
      }

      // Check for duplicate room
      const floorRooms = existingRoomsCache.get(floorId as string)!;
      if (floorRooms.has(roomData.roomNumber)) {
         results.push({ success: false, roomNumber: roomData.roomNumber, error: `Room ${roomData.roomNumber} already exists on this floor` });
         continue;
      }

      // 3. Get or Create Room Type
      const rTypeName = roomData.roomType || 'Double';
      const rtKey = `${roomData.hostelId}_${rTypeName}`;
      let roomTypeId = roomTypeCache.get(rtKey);
      let resolvedCapacity = capacity;
      let resolvedPrice = finalPrice;

      if (!roomTypeId) {
        const { data: rt } = await supabaseAdmin.from('room_types').select('id, capacity, price').eq('hostel_id', roomData.hostelId).eq('name', rTypeName).maybeSingle();
        if (rt) {
          roomTypeId = rt.id;
          // Use the stored values — they are the admin's intent, not the UI's payload
          resolvedCapacity = rt.capacity ?? capacity;
          resolvedPrice = rt.price ?? finalPrice;
        } else {
          const { data: newRt, error: rte } = await supabaseAdmin.from('room_types').insert({ hostel_id: roomData.hostelId, name: rTypeName, capacity, price: finalPrice }).select().single();
          if (rte) {
             results.push({ success: false, roomNumber: roomData.roomNumber, error: rte.message });
             continue;
          }
          roomTypeId = newRt.id;
        }
        roomTypeCache.set(rtKey, roomTypeId as string);
      } else {
        // Room type was cached — fetch its authoritative values once
        const { data: rt } = await supabaseAdmin.from('room_types').select('capacity, price').eq('id', roomTypeId).maybeSingle();
        if (rt) {
          resolvedCapacity = rt.capacity ?? capacity;
          resolvedPrice = rt.price ?? finalPrice;
        }
      }

      let finalGender = null;
      if (roomData.gender) {
        finalGender = roomData.gender.toLowerCase() === 'mixed' ? 'Any' : (roomData.gender.charAt(0).toUpperCase() + roomData.gender.slice(1).toLowerCase());
      } else if (floorGenderConfig && floorGenderConfig[roomData.floorNumber]) {
        const floorGender = floorGenderConfig[roomData.floorNumber];
        finalGender = floorGender === 'mixed' ? 'Any' : (floorGender.charAt(0).toUpperCase() + floorGender.slice(1).toLowerCase());
      } else {
        finalGender = 'Any';
      }

      const { data: room, error: roomError } = await supabaseAdmin
        .from('rooms')
        .insert({
          floor_id: floorId,
          room_type_id: roomTypeId,
          room_number: roomData.roomNumber,
          capacity: resolvedCapacity,
          monthly_fee: resolvedPrice,
          amenities: roomData.amenities || [],
          status: (roomData.isActive !== undefined ? roomData.isActive : true) ? 'available' : 'maintenance',
          gender_allowed: finalGender,
          current_occupancy: 0,
          booking_category: roomData.bookingCategory || 'Student'
        })
        .select()
        .single()

      if (roomError) {
        console.error(`Error creating room ${roomData.roomNumber}:`, roomError.message)
        results.push({ success: false, roomNumber: roomData.roomNumber, error: roomError.message })
        continue
      }
      
      floorRooms.add(roomData.roomNumber);
      results.push({ success: true, room: room })
    }

    const successCount = results.filter(r => r.success).length
    const failCount = results.length - successCount

    if (successCount === 0 && failCount > 0) {
      return res.status(400).json({
        error: 'Registration failed for all rooms',
        details: results.map(r => `${r.roomNumber}: ${r.error}`)
      });
    }

    return res.status(successCount > 0 ? 201 : 400).json({
      message: successCount > 0 
        ? `Successfully created ${successCount} rooms.${failCount > 0 ? ` Failed ${failCount} rooms.` : ''}`
        : 'No rooms were created.',
      results
    });

  } catch (error: any) {
    console.error('Error creating rooms:', error?.message || error, error?.stack)
    return res.status(500).json({ error: error?.message || 'Failed to create rooms' });
  }
});
// PUT /api/admin/admin-rooms - Update room
router.put('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Search params mapped to req.query
    const roomId = req.query['id'] as string
    const body = req.body

    if (!roomId) {
      return res.status(400).json({ error: 'Room ID is required' });
    }

    const updatePayload: any = {
      room_number: body.roomNumber,
      capacity: parseInt(body.capacity),
      monthly_fee: parseFloat(body.pricePerSemester) || 0,
      amenities: body.amenities || [],
      status: body.condition === 'poor' || body.isMaintenance ? 'maintenance' : 'available',
      booking_category: body.bookingCategory || 'Student'
    }

    if (body.gender) {
      updatePayload.gender_allowed = body.gender.toLowerCase() === 'mixed' ? 'Any' : (body.gender.charAt(0).toUpperCase() + body.gender.slice(1).toLowerCase())
    }

    // Handle floor update if hostel and floor provided
    let finalFloorId = null;
    if (body.hostelId && body.floorNumber !== undefined) {
      const { data: block } = await supabaseAdmin.from('blocks').select('id').eq('hostel_id', body.hostelId).limit(1).maybeSingle();
      let blockId = block?.id;
      if (!blockId) {
        const { data: newBlock } = await supabaseAdmin.from('blocks').insert({ hostel_id: body.hostelId, name: 'Block A' }).select().single();
        if (newBlock) blockId = newBlock.id;
      }
      
      if (blockId) {
        const { data: floor } = await supabaseAdmin.from('floors').select('id').eq('block_id', blockId).eq('floor_number', parseInt(body.floorNumber)).maybeSingle();
        if (floor) {
          finalFloorId = floor.id;
        } else {
          const { data: newFloor } = await supabaseAdmin.from('floors').insert({ block_id: blockId, floor_number: parseInt(body.floorNumber) }).select().single();
          if (newFloor) finalFloorId = newFloor.id;
        }
      }
      if (finalFloorId) updatePayload.floor_id = finalFloorId;
    }

    // Handle room type update
    if (body.hostelId && body.roomType) {
      const { data: roomType } = await supabaseAdmin.from('room_types').select('id, capacity, price').eq('hostel_id', body.hostelId).eq('name', body.roomType).maybeSingle();
      if (roomType) {
        updatePayload.room_type_id = roomType.id;
        // Optionally update capacity and price to match the authoritative room type
        if (!body.capacity) updatePayload.capacity = roomType.capacity;
        if (!body.pricePerSemester) updatePayload.monthly_fee = roomType.price;
      } else {
        const { data: newRt } = await supabaseAdmin.from('room_types').insert({ 
           hostel_id: body.hostelId, 
           name: body.roomType, 
           capacity: parseInt(body.capacity) || 2, 
           price: parseFloat(body.pricePerSemester) || 0 
        }).select().single();
        if (newRt) updatePayload.room_type_id = newRt.id;
      }
    }

    const { data: room, error } = await supabaseAdmin
      .from('rooms')
      .update(updatePayload)
      .eq('id', roomId)
      .select()
      .single()

    if (error) throw error

    return res.json({ message: 'Room updated successfully', room });
  } catch (error) {
    console.error('Error updating room:', error)
    return res.status(500).json({ error: 'Failed to update room' });
  }
});
// DELETE /api/admin/admin-rooms - Delete room(s) (single or bulk)
router.delete('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    let idsToDelete: string[] = []

    if (req.query.id && typeof req.query.id === 'string') {
      idsToDelete.push(req.query.id)
    }

    if (req.query.ids) {
      const queryIds = Array.isArray(req.query.ids) ? req.query.ids : (req.query.ids as string).split(',')
      idsToDelete.push(...queryIds.map(id => String(id).trim()).filter(Boolean))
    }

    if (req.body) {
      if (Array.isArray(req.body)) {
        idsToDelete.push(...req.body.map(id => String(id).trim()).filter(Boolean))
      } else if (Array.isArray(req.body.ids)) {
        idsToDelete.push(...req.body.ids.map((id: any) => String(id).trim()).filter(Boolean))
      } else if (Array.isArray(req.body.roomIds)) {
        idsToDelete.push(...req.body.roomIds.map((id: any) => String(id).trim()).filter(Boolean))
      }
    }

    // Deduplicate IDs
    idsToDelete = Array.from(new Set(idsToDelete))

    if (idsToDelete.length === 0) {
      return res.status(400).json({ error: 'Room ID(s) required for deletion' })
    }

    // Attempt deleting linked beds if table exists in chunks
    try {
      const chunkSize = 100;
      for (let i = 0; i < idsToDelete.length; i += chunkSize) {
        const chunk = idsToDelete.slice(i, i + chunkSize);
        await supabaseAdmin.from('beds').delete().in('room_id', chunk);
      }
    } catch (e) {
      // Ignore if table beds does not exist
    }

    // Delete rooms in chunks to avoid URL length limits in PostgREST
    const chunkSize = 100;
    let deletedCount = 0;
    
    for (let i = 0; i < idsToDelete.length; i += chunkSize) {
      const chunk = idsToDelete.slice(i, i + chunkSize);
      const { data: deletedRooms, error } = await supabaseAdmin
        .from('rooms')
        .delete()
        .in('id', chunk)
        .select('id');

      if (error) {
        console.error('Error during bulk chunk delete:', error);
        throw error;
      }
      
      if (deletedRooms) deletedCount += deletedRooms.length;
    }

    return res.json({ 
      message: `Successfully deleted ${deletedCount} room(s)`,
      count: deletedCount 
    })
  } catch (error: any) {
    console.error('Error deleting room(s):', error)
    return res.status(500).json({ error: 'Failed to delete room(s)', details: error.message || String(error) })
  }
})

export default router;
