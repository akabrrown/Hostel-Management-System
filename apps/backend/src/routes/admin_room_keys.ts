import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest, requireRole } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const router = Router();

// GET all room key activities (transactions) across hostels
router.get('/activity', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('room_key_transactions')
      .select(`
        id,
        transaction_type,
        transaction_date,
        transaction_time,
        remarks,
        student:students!room_key_transactions_student_id_fkey(full_name, user:users!students_user_id_fkey(index_number)),
        porter:porters!room_key_transactions_porter_id_fkey(full_name),
        room:rooms(room_number, floor:floors(block:blocks(hostel:hostels(name))))
      `)
      .order('transaction_date', { ascending: false })
      .order('transaction_time', { ascending: false })
      .limit(100);

    if (error) {
      console.error('Fetch key transactions error:', error);
      return res.status(500).json({ error: 'Failed to fetch key transactions' });
    }

    return res.json({ data });
  } catch (error) {
    console.error('Admin key activity error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET current status of all room keys
router.get('/status', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabaseAdmin
      .from('room_keys')
      .select(`
        id,
        key_code,
        status,
        updated_at,
        current_holder_student_id,
        room:rooms(room_number, floor:floors(block:blocks(hostel:hostels(name)))),
        student:students!room_keys_current_holder_student_id_fkey(full_name, user:users!students_user_id_fkey(index_number))
      `)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Fetch key statuses error:', error);
      return res.status(500).json({ error: 'Failed to fetch key statuses' });
    }

    return res.json({ data });
  } catch (error) {
    console.error('Admin key status error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
