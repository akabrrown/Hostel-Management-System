import { Router, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';
import { getIO } from '../socket';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const router = Router();

// Used by porters to log a key transaction
router.post('/transaction', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { room_id, student_id, transaction_type, remarks } = req.body;
    const porter_id = req.user?.id;
    const hostel_id = req.body.hostel_id || 'unknown'; // Need hostel_id for the room broadcast

    if (!porter_id) return res.status(401).json({ error: 'Unauthorized' });

    // 1. Get the room key ID for this room
    const { data: roomKey, error: keyError } = await supabase
      .from('room_keys')
      .select('id, status')
      .eq('room_id', room_id)
      .single();

    if (keyError || !roomKey) return res.status(404).json({ error: 'Room key not found' });

    // 2. Insert the transaction
    const { error: txError } = await supabase
      .from('room_key_transactions')
      .insert({
        room_key_id: roomKey.id,
        room_id,
        student_id,
        porter_id,
        transaction_type,
        remarks
      });

    if (txError) throw txError;

    // 3. Update the room_keys current status
    let newStatus = roomKey.status;
    let holder = null;
    if (transaction_type === 'return_to_porter') {
      newStatus = 'with_porter';
    } else if (transaction_type === 'collect_from_porter') {
      newStatus = 'with_student';
      holder = student_id;
    } else if (transaction_type === 'lost_report') {
      newStatus = 'lost';
    } else if (transaction_type === 'damage_report') {
      newStatus = 'damaged';
    }

    const { data: updatedKey, error: updateError } = await supabase
      .from('room_keys')
      .update({ 
        status: newStatus,
        current_holder_student_id: holder
      })
      .eq('id', roomKey.id)
      .select()
      .single();

    if (updateError) throw updateError;

    // Emit real-time event to the specific hostel room
    if (hostel_id !== 'unknown') {
      try {
        const io = getIO();
        io.to(`hostel_${hostel_id}`).emit('key_status_changed', {
          room_id,
          status: newStatus,
          timestamp: new Date().toISOString()
        });
      } catch (e) {
        console.warn('Socket.io error emitting event:', e);
      }
    }

    res.json({ message: 'Key transaction recorded', data: updatedKey });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Get current key status for a room
router.get('/status/:room_id', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('room_keys')
      .select('*, students(full_name)')
      .eq('room_id', req.params.room_id)
      .single();

    if (error) throw error;
    res.json({ data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;
