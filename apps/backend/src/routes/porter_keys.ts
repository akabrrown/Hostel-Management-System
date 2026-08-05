import { Router, Response } from 'express';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const router = Router();

// List all room keys for the porter's assigned hostel
router.get('/', requireAuth, requireRole(['porter']), async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { data: porter } = await supabaseAdmin
      .from('porters')
      .select('assigned_hostel_id')
      .eq('user_id', userId)
      .single();

    let hostelId = porter?.assigned_hostel_id;

    if (!hostelId) {
      // Fallback: grab the first hostel for dev/testing
      const { data: fallback } = await supabaseAdmin.from('hostels').select('id').limit(1).maybeSingle();
      hostelId = fallback?.id;
    }

    if (!hostelId) {
      return res.json({ data: [] });
    }

    // Get all rooms in this hostel, then join to room_keys
    const { data: rooms } = await supabaseAdmin
      .from('rooms')
      .select('id, room_number')
      .eq('hostel_id', hostelId);

    if (!rooms || rooms.length === 0) {
      return res.json({ data: [] });
    }

    const roomIds = rooms.map(r => r.id);

    const { data: keys, error } = await supabaseAdmin
      .from('room_keys')
      .select(`
        id,
        room_id,
        key_code,
        status,
        current_holder_student_id,
        rooms (room_number),
        profiles:current_holder_student_id (full_name)
      `)
      .in('room_id', roomIds);

    if (error) {
      console.error('Porter keys fetch error:', error);
      return res.status(500).json({ error: 'Failed to fetch keys' });
    }

    const transformed = (keys || []).map((k: any) => ({
      id: k.id,
      roomId: k.room_id,
      keyCode: k.key_code,
      status: k.status,
      roomNumber: k.rooms?.room_number || 'Unknown',
      holderName: k.profiles?.full_name || null
    }));

    return res.json({ data: transformed });
  } catch (error) {
    console.error('Porter keys error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// Get transaction history for a specific room key
router.get('/:keyId/history', requireAuth, requireRole(['porter']), async (req: AuthRequest, res: Response) => {
  try {
    const { keyId } = req.params;

    const { data, error } = await supabaseAdmin
      .from('room_key_transactions')
      .select(`
        id,
        transaction_type,
        remarks,
        created_at,
        profiles:student_id (full_name),
        porter:porter_id (full_name)
      `)
      .eq('room_key_id', keyId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) {
      console.error('Key history error:', error);
      return res.status(500).json({ error: 'Failed to fetch key history' });
    }

    const transformed = (data || []).map((tx: any) => ({
      id: tx.id,
      type: tx.transaction_type,
      remarks: tx.remarks,
      timestamp: tx.created_at,
      studentName: tx.profiles?.full_name || 'Unknown',
      porterName: tx.porter?.full_name || 'Unknown'
    }));

    return res.json({ data: transformed });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
