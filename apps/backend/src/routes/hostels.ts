import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { z } from 'zod';
import { createClient } from '@supabase/supabase-js';

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

// Helper to upload base64 images to Supabase storage bucket
async function processImages(images: string[], hostelName: string): Promise<string[]> {
  const processedUrls: string[] = [];
  for (let i = 0; i < images.length; i++) {
    const img = images[i];
    if (img.startsWith('data:image/')) {
      try {
        const matches = img.match(/^data:(image\/[a-zA-Z+]+);base64,(.+)$/);
        if (!matches || matches.length !== 3) {
          processedUrls.push(img);
          continue;
        }
        
        const mimeType = matches[1];
        const base64Data = matches[2];
        const buffer = Buffer.from(base64Data, 'base64');
        
        const extension = mimeType.split('/')[1] || 'jpg';
        const fileName = `${hostelName.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${Date.now()}_${i}.${extension}`;
        
        const { data, error } = await supabaseAdmin
          .storage
          .from('UPSA HMS')
          .upload(`hostels/${fileName}`, buffer, {
            contentType: mimeType,
            upsert: true
          });
          
        if (error) {
          console.error('Error uploading image to Supabase:', error);
          processedUrls.push(img);
        } else {
          const { data: { publicUrl } } = supabaseAdmin
            .storage
            .from('UPSA HMS')
            .getPublicUrl(`hostels/${fileName}`);
          processedUrls.push(publicUrl);
        }
      } catch (err) {
        console.error('Failed to process image:', err);
        processedUrls.push(img);
      }
    } else {
      processedUrls.push(img);
    }
  }
  return processedUrls;
}

// Schema for hostel validation (matches UI form fields)
const hostelSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  address: z.string().min(1, 'Address is required').max(200, 'Address too long'),
  description: z.string().optional(),
  gender: z.enum(['male', 'female', 'mixed', 'Male', 'Female', 'Any']),
  isActive: z.boolean().default(true),
  // The UI might send these, we validate but ignore in DB since they aren't in schema
  totalFloors: z.number().optional(),
  wardenName: z.string().optional(),
  wardenEmail: z.string().optional(),
  wardenPhone: z.string().optional(),
  amenities: z.array(z.string()).optional(),
  roomPricing: z.any().optional(),
  roomTypes: z.array(z.object({
    id: z.string().optional(),
    name: z.string().min(1, 'Room Type name is required'),
    capacity: z.number().min(1, 'Capacity must be at least 1'),
    price: z.number().min(0, 'Price cannot be negative'),
    description: z.string().nullable().optional()
  })).optional(),
  images: z.array(z.string()).optional(),
  code: z.string().optional()
});

router.get('/', async (req: Request, res: Response) => {
  try {
    const page = parseInt((req.query.page as string) || '1');
    const limit = Math.min(parseInt((req.query.limit as string) || '10'), 50);
    const gender = req.query.gender as string;
    const isActive = req.query.isActive as string;
    const search = req.query.search as string;

    let query = supabaseAdmin
      .from('hostels')
      .select(`
        *,
        room_types(id, name, capacity, price, description),
        rooms:blocks(
          floors(
            rooms(
              capacity,
              current_occupancy,
              booking_category
            )
          )
        )
      `, { count: 'exact' })
      .order('name', { ascending: true });

    if (gender) {
      const g = gender.toLowerCase() === 'mixed' ? 'Any' : gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase();
      query = query.eq('gender_allowed', g);
    }
    if (isActive !== undefined) query = query.eq('status', isActive === 'true' ? 'active' : 'inactive');
    if (search) query = query.or(`name.ilike.%${search}%,location.ilike.%${search}%`);

    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: hostels, error, count } = await query;

    if (error) {
      console.warn('[Hostels Route] Error fetching hostels, returning empty:', error);
      return res.json({
        hostels: [],
        pagination: { page, limit, total: 0, pages: 0 },
      });
    }

    const processedHostels = hostels?.map((hostel: any) => {
      // Flatten the rooms from blocks -> floors -> rooms
      let allRooms: any[] = [];
      (hostel.rooms || []).forEach((block: any) => {
        (block.floors || []).forEach((floor: any) => {
          allRooms = allRooms.concat(floor.rooms || []);
        });
      });
      
      // Filter out non-student rooms for capacity calculation
      const studentRooms = allRooms.filter((r: any) => r.booking_category === 'Student');
      
      const totalRooms = studentRooms.length;
      const totalBeds = studentRooms.reduce((sum: number, r: any) => sum + (r.capacity || 0), 0);
      const occupiedBeds = studentRooms.reduce((sum: number, r: any) => sum + (r.current_occupancy || 0), 0);
      
      let mappedGender = hostel.gender_allowed?.toLowerCase() || 'mixed';
      if (mappedGender === 'any') mappedGender = 'mixed';

      return {
        id: hostel.id,
        name: hostel.name,
        code: hostel.room_pricing?.internal_code || hostel.name.substring(0, 4).toUpperCase(),
        address: hostel.location || '',
        description: hostel.description || '',
        images: hostel.images || [],
        totalFloors: hostel.total_floors || 1,
        totalRooms,
        totalBeds,
        occupiedBeds,
        availableBeds: Math.max(0, totalBeds - occupiedBeds),
        warden: hostel.warden_name || 'Admin',
        contact: hostel.warden_phone || hostel.warden_email || 'N/A',
        status: hostel.status === 'active' ? 'active' : 'inactive',
        createdAt: hostel.created_at,
        pricePerSemester: hostel.room_types?.[0]?.price || hostel.room_pricing?.single || 0,
        pricePerYear: (hostel.room_types?.[0]?.price || hostel.room_pricing?.single || 0) * 2,
        gender: mappedGender,
        amenities: hostel.amenities || [],
        roomPricing: hostel.room_pricing || { single: 0, double: 0, quadruple: 0 },
        roomTypes: hostel.room_types || []
      };
    });

    res.json({
      hostels: processedHostels,
      pagination: {
        page,
        limit,
        total: count || 0,
        pages: Math.ceil((count || 0) / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching hostels:', error);
    res.status(500).json({ error: 'Failed to fetch hostels' });
  }
});

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role || req.session?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions - Admin access required' });
    }

    const validatedData = hostelSchema.parse(req.body);

    const { data: existingHostel } = await supabaseAdmin
      .from('hostels')
      .select('id')
      .eq('name', validatedData.name)
      .maybeSingle();

    if (existingHostel) {
      return res.status(409).json({ error: 'Hostel with this name already exists' });
    }

    let mappedGender = validatedData.gender.toLowerCase() === 'mixed' ? 'Any' : (validatedData.gender.charAt(0).toUpperCase() + validatedData.gender.slice(1).toLowerCase());

    let processedImages = validatedData.images || [];
    if (processedImages.length > 0) {
      processedImages = await processImages(processedImages, validatedData.name);
    }

    const { data: hostel, error } = await supabaseAdmin
      .from('hostels')
      .insert({
        name: validatedData.name,
        location: validatedData.address,
        description: validatedData.description,
        gender_allowed: mappedGender,
        capacity: 0, // Initial capacity, updated when rooms are added
        status: validatedData.isActive ? 'active' : 'inactive',
        total_floors: validatedData.totalFloors || 1,
        warden_name: validatedData.wardenName,
        warden_email: validatedData.wardenEmail,
        warden_phone: validatedData.wardenPhone,
        amenities: validatedData.amenities || [],
        room_pricing: { ...(validatedData.roomPricing || { single: 0, double: 0, quadruple: 0 }), internal_code: validatedData.code || validatedData.name.substring(0, 4).toUpperCase() },
        images: processedImages
      })
      .select()
      .single();

    if (error) throw error;

    if (validatedData.roomTypes && validatedData.roomTypes.length > 0) {
      for (const rt of validatedData.roomTypes) {
        const { error: insErr } = await supabaseAdmin.from('room_types').insert({
          hostel_id: hostel.id,
          name: rt.name,
          capacity: rt.capacity,
          price: rt.price,
          description: rt.description
        });
        if (insErr) throw insErr;
      }
    }

    res.json({ message: 'Hostel created successfully', data: hostel });
  } catch (error) {
    console.error('Error creating hostel:', error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to create hostel' });
  }
});

router.put('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role || req.session?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const hostelId = req.query.id as string;
    if (!hostelId) {
      return res.status(400).json({ error: 'Hostel ID is required' });
    }

    const validatedData = hostelSchema.partial().parse(req.body);

    const updatePayload: any = {};
    if (validatedData.name) updatePayload.name = validatedData.name;
    if (validatedData.address) updatePayload.location = validatedData.address;
    if (validatedData.description) updatePayload.description = validatedData.description;
    if (validatedData.isActive !== undefined) updatePayload.status = validatedData.isActive ? 'active' : 'inactive';
    if (validatedData.gender) {
        updatePayload.gender_allowed = validatedData.gender.toLowerCase() === 'mixed' ? 'Any' : (validatedData.gender.charAt(0).toUpperCase() + validatedData.gender.slice(1).toLowerCase());
    }
    if (validatedData.totalFloors !== undefined) updatePayload.total_floors = validatedData.totalFloors;
    if (validatedData.wardenName !== undefined) updatePayload.warden_name = validatedData.wardenName;
    if (validatedData.wardenEmail !== undefined) updatePayload.warden_email = validatedData.wardenEmail;
    if (validatedData.wardenPhone !== undefined) updatePayload.warden_phone = validatedData.wardenPhone;
    if (validatedData.amenities !== undefined) updatePayload.amenities = validatedData.amenities;
    if (validatedData.roomPricing !== undefined) updatePayload.room_pricing = validatedData.roomPricing;
    
    if (validatedData.images !== undefined) {
      const currentName = validatedData.name || hostelId;
      updatePayload.images = await processImages(validatedData.images, currentName);
    }

    // Pre-validate room_type deletions to prevent foreign key errors mid-update
    let toDeleteRts: any[] = [];
    if (validatedData.roomTypes) {
      const { data: existingRts } = await supabaseAdmin.from('room_types').select('id, name').eq('hostel_id', hostelId);
      const incomingIds = validatedData.roomTypes.filter((rt: any) => rt.id && rt.id !== 'new').map((rt: any) => rt.id);
      toDeleteRts = existingRts?.filter((ert: any) => !incomingIds.includes(ert.id)) || [];

      if (toDeleteRts.length > 0) {
        const { data: roomsUsingTypes } = await supabaseAdmin
          .from('rooms')
          .select('id, room_types(name)')
          .in('room_type_id', toDeleteRts.map(d => d.id))
          .limit(1);
          
        if (roomsUsingTypes && roomsUsingTypes.length > 0) {
          const typeName = (roomsUsingTypes[0] as any).room_types?.name || 'A room type';
          return res.status(400).json({ error: `Cannot delete room type "${typeName}" because it is currently assigned to rooms. Reassign those rooms first.` });
        }
      }
    }

    const { data: hostel, error } = await supabaseAdmin
      .from('hostels')
      .update(updatePayload)
      .eq('id', hostelId)
      .select()
      .single();

    if (error) throw error;

    if (validatedData.roomTypes) {
      const toDelete = toDeleteRts;
      console.log(`[Hostel PUT] Syncing ${validatedData.roomTypes.length} room types for hostel ${hostelId}. Deleting ${toDelete.length}.`);

      for (const d of toDelete) {
        await supabaseAdmin.from('room_types').delete().eq('id', d.id);
      }
      
      for (const rt of validatedData.roomTypes) {
        const rtPayload: Record<string, any> = {
          name: rt.name,
          capacity: rt.capacity,
          price: rt.price,
        };
        if (rt.description !== undefined) rtPayload.description = rt.description;

        if (rt.id && rt.id !== 'new') {
          console.log(`[Hostel PUT] Updating room type ${rt.id}: ${rt.name}`);
          const { error: updErr } = await supabaseAdmin
            .from('room_types')
            .update(rtPayload)
            .eq('id', rt.id)
            .eq('hostel_id', hostelId);
          if (updErr) { console.error('[Hostel PUT] Update error:', updErr); throw updErr; }
        } else {
          console.log(`[Hostel PUT] Inserting new room type: ${rt.name}`);
          const { error: insErr } = await supabaseAdmin
            .from('room_types')
            .insert({ ...rtPayload, hostel_id: hostelId });
          if (insErr) { console.error('[Hostel PUT] Insert error:', insErr); throw insErr; }
        }
      }
    }

    res.json({ message: 'Hostel updated successfully', data: hostel });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }
    res.status(500).json({ error: 'Failed to update hostel' });
  }
});

router.delete('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const userRole = req.user?.role || req.session?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const hostelId = req.query.id as string;
    if (!hostelId) {
      return res.status(400).json({ error: 'Hostel ID is required' });
    }

    // Check if hostel has occupied rooms
    const { data: roomsToCheck } = await supabaseAdmin
      .from('rooms')
      .select('current_occupancy, floors!inner(block_id, blocks!inner(hostel_id))')
      .eq('floors.blocks.hostel_id', hostelId)
      .gt('current_occupancy', 0);

    if (roomsToCheck && roomsToCheck.length > 0) {
      return res.status(400).json({ error: 'Cannot delete hostel with occupied rooms' });
    }

    // Since deleting a hostel cascades to blocks -> floors -> rooms,
    // we just delete the hostel itself! (and room_types cascade too)
    const { error } = await supabaseAdmin.from('hostels').delete().eq('id', hostelId);
    if (error) {
       console.error('Delete constraint error, trying manual cascade:', error);
       // If restrict constraint hit on rooms->room_types, delete rooms first
       const { data: rTypes } = await supabaseAdmin.from('room_types').select('id').eq('hostel_id', hostelId);
       if (rTypes && rTypes.length > 0) {
           await supabaseAdmin.from('rooms').delete().in('room_type_id', rTypes.map(rt => rt.id));
       }
       // Now try deleting again
       const { error: retryError } = await supabaseAdmin.from('hostels').delete().eq('id', hostelId);
       if (retryError) throw retryError;
    }

    res.json({ message: 'Hostel deleted successfully' });
  } catch (error) {
    console.error('Error deleting hostel:', error);
    res.status(500).json({ error: 'Failed to delete hostel' });
  }
});

// Get a single hostel by ID
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    const { data: hostel, error } = await supabaseAdmin
      .from('hostels')
      .select('*, room_types(id, name, capacity, price, description)')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    res.json({ hostel });
  } catch (error) {
    console.error('Error fetching hostel:', error);
    res.status(500).json({ error: 'Failed to fetch hostel' });
  }
});

// Get floors for a specific hostel
router.get('/:id/floors', async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    
    // First get blocks for this hostel
    const { data: blocks, error: blockError } = await supabaseAdmin
      .from('blocks')
      .select('id')
      .eq('hostel_id', id);
      
    if (blockError) throw blockError;
    if (!blocks || blocks.length === 0) return res.json({ floors: [] });

    // Then get floors for those blocks
    const blockIds = blocks.map(b => b.id);
    const { data: floors, error: floorError } = await supabaseAdmin
      .from('floors')
      .select('*')
      .in('block_id', blockIds)
      .order('floor_number', { ascending: true });
      
    if (floorError) throw floorError;
    
    // Map db fields to expected frontend fields
    const formattedFloors = (floors || []).map(f => ({
      id: f.id,
      floorNumber: f.floor_number,
      gender: f.gender_allowed || 'Any',
      blockId: f.block_id
    }));
    
    res.json({ floors: formattedFloors });
  } catch (error) {
    console.error('Error fetching hostel floors:', error);
    res.status(500).json({ error: 'Failed to fetch floors' });
  }
});

// Get rooms for a specific floor
router.get('/:id/floors/:floorId/rooms', async (req: Request, res: Response) => {
  try {
    const { floorId } = req.params;
    
    const { data: rooms, error } = await supabaseAdmin
      .from('rooms')
      .select('*, room_types(*)')
      .eq('floor_id', floorId)
      .eq('booking_category', 'Student')
      .order('room_number', { ascending: true });
      
    if (error) throw error;
    
    const formattedRooms = (rooms || []).map(r => ({
      id: r.id,
      roomNumber: r.room_number,
      capacity: r.capacity,
      currentOccupancy: r.current_occupancy || 0,
      availableBeds: Math.max(0, r.capacity - (r.current_occupancy || 0)),
      status: r.status || 'available',
      type: r.room_types ? r.room_types.name : 'Standard'
    }));
    
    res.json({ rooms: formattedRooms });
  } catch (error) {
    console.error('Error fetching floor rooms:', error);
    res.status(500).json({ error: 'Failed to fetch rooms' });
  }
});

// Get single room details
router.get('/:id/floors/:floorId/rooms/:roomId', async (req: Request, res: Response) => {
  try {
    const { roomId } = req.params;
    
    // Fetch room, its room type
    const { data: room, error } = await supabaseAdmin
      .from('rooms')
      .select('*, room_types(*)')
      .eq('id', roomId)
      .single();
      
    if (error) throw error;
    
    // Build synthetic bed list from capacity
    const beds = [];
    const currentOccupants = room.current_occupancy || 0;
    for (let i = 0; i < (room.capacity || 0); i++) {
      beds.push({
        id: `${room.id}-bed-${i + 1}`,
        bedNumber: `${i + 1}`,
        isAvailable: i >= currentOccupants
      });
    }

    // Map db fields
    const formattedRoom = {
      id: room.id,
      roomNumber: room.room_number,
      capacity: room.capacity,
      currentOccupancy: room.current_occupancy || 0,
      status: room.status || 'available',
      type: room.room_types ? room.room_types.name : 'Standard',
      beds: beds
    };
    
    res.json({ room: formattedRoom });
  } catch (error) {
    console.error('Error fetching room details:', error);
    res.status(500).json({ error: 'Failed to fetch room details' });
  }
});

export default router;
