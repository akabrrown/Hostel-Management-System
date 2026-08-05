import { Router, Request, Response } from 'express';
import { requireAuth, requireRole, AuthRequest } from '../middleware/auth';
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





export const dynamic = 'force-dynamic'

router.post('/', requireAuth, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    // 2. Perform System Reset
    // Note: Order matters due to foreign keys. 
    // Delete check_ins, check_outs, payments, room_keys, and invoices first
    await supabaseAdmin.from('check_ins').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('check_outs').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('payments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('room_keys').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('finance_invoices').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Delete bookings
    const { error: bookError } = await supabaseAdmin
      .from('bookings')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000') // Delete all

    if (bookError) {
       console.error('Error deleting bookings:', bookError);
       throw bookError;
    }

    // Reset Room Occupancy
    const { error: roomError } = await supabaseAdmin
      .from('rooms')
      .update({ current_occupancy: 0 })
      .neq('id', '00000000-0000-0000-0000-000000000000') // Update all

    if (roomError) {
      console.error('Error resetting rooms:', roomError)
    }

    return res.json({ message: 'System reset successfully' });

  } catch (error) {
    console.error('System reset error:', error)
    return res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
