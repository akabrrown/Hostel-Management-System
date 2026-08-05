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

const router = Router({ mergeParams: true });



import { z } from 'zod'

// Schema for floor gender configuration
const floorGenderConfigSchema = z.record(
  z.string().regex(/^\d+$/, 'Floor number must be a number'),
  z.enum(['male', 'female', 'mixed'])
)

router.put('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const params = { id: req.params.id };
  try {
    const userRole = req.user?.role || (req as any).session?.role;
    if (userRole !== 'admin') {
      return res.status(403).json({ error: 'Insufficient permissions - Admin access required' });
    }

    const hostelId = params.id
    const body = req.body
    
    // Validate floor gender configuration
    const floorConfig = floorGenderConfigSchema.parse(body.floorGenderConfig)

    // Get hostel to validate floor numbers
    const { data: hostel, error: hostelError } = await supabaseAdmin
      .from('hostels')
      .select('total_floors')
      .eq('id', hostelId)
      .single()

    if (hostelError || !hostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }

    // Validate floor numbers don't exceed total floors (allow 0 for ground floor)
    const floorNumbers = Object.keys(floorConfig).map(Number)
    const invalidFloors = floorNumbers.filter(floor => floor < 0 || floor > hostel.total_floors)
    
    if (invalidFloors.length > 0) {
      return res.status(400).json({ error: `Invalid floor numbers: ${invalidFloors.join(', ')}. Hostel has ${hostel.total_floors} floors.` });
    }

    // Update hostel floor gender configuration
    const { error: updateError } = await supabaseAdmin
      .from('hostels')
      .update({
        floor_gender_config: floorConfig,
        updated_at: new Date().toISOString()
      })
      .eq('id', hostelId)

    if (updateError) {
      throw updateError
    }

    // Auto-create default block and floors if they don't exist
    let { data: blocks } = await supabaseAdmin.from('blocks').select('id').eq('hostel_id', hostelId)
    if (!blocks || blocks.length === 0) {
      const { data: newBlock, error: blockErr } = await supabaseAdmin
        .from('blocks')
        .insert({ hostel_id: hostelId, name: 'Main Block' })
        .select('id')
        .single()
      if (!blockErr && newBlock) {
        blocks = [newBlock]
      }
    }

    if (blocks && blocks.length > 0) {
      const blockId = blocks[0].id
      
      // Auto-create floors for the main block up to total_floors
      const { data: existingFloors } = await supabaseAdmin.from('floors').select('floor_number').eq('block_id', blockId)
      const existingFloorNums = new Set(existingFloors?.map((f: any) => f.floor_number) || [])
      
      const floorsToInsert = []
      for (let i = 0; i <= hostel.total_floors; i++) {
        if (!existingFloorNums.has(i)) {
          floorsToInsert.push({ block_id: blockId, floor_number: i })
        }
      }
      
      if (floorsToInsert.length > 0) {
        await supabaseAdmin.from('floors').insert(floorsToInsert)
      }

      // Re-fetch all floors for room gender update
      const { data: floors } = await supabaseAdmin.from('floors').select('id, floor_number').eq('block_id', blockId)
      
      if (floors) {
        for (const [floorNum, gender] of Object.entries(floorConfig)) {
          const floorIdObj = floors.find((f: any) => f.floor_number === parseInt(floorNum))
          if (floorIdObj) {
            const { error: roomUpdateError } = await supabaseAdmin
              .from('rooms')
              .update({ gender_allowed: gender === 'mixed' ? 'Any' : (gender.charAt(0).toUpperCase() + gender.slice(1).toLowerCase()) })
              .eq('floor_id', floorIdObj.id)

            if (roomUpdateError) {
              console.error(`Error updating rooms on floor ${floorNum}:`, roomUpdateError)
            }
          }
        }
      }
    }

    return res.json({
      message: 'Floor gender configuration updated successfully',
      floorConfig
    });
  } catch (error) {
    console.error('Error updating floor gender config:', error)
    
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }

    return res.status(500).json({ error: 'Failed to update floor gender configuration' });
  }
});
router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  const params = { id: req.params.id };
  console.log('GET /api/admin/hostels/[id]/floor-config hit, id:', params.id)
  try {
    const hostelId = params.id

    const { data: hostel, error } = await supabaseAdmin
      .from('hostels')
      .select('floor_gender_config, total_floors')
      .eq('id', hostelId)
      .single()

    if (error || !hostel) {
      return res.status(404).json({ error: 'Hostel not found' });
    }

    return res.json({
      floorGenderConfig: hostel.floor_gender_config || {},
      totalFloors: hostel.total_floors
    });
  } catch (error) {
    console.error('Error fetching floor gender config:', error)
    return res.status(500).json({ error: 'Failed to fetch floor gender configuration' });
  }
});

export default router;
