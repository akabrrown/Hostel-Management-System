import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const router = Router();

router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const {
      userId,
      amount,
      paymentMethod,
      transactionId,
      semester,
      academicYear,
      provider,
      phoneNumber,
      bankName,
      accountNumber
    } = req.body;

    if (!userId || !amount || !paymentMethod || !transactionId || !semester || !academicYear) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    // Check for idempotency: if transactionId already exists, return success immediately
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id, status')
      .eq('transaction_id', transactionId)
      .single();

    if (existingPayment) {
      return res.json({ message: 'Payment already processed (Idempotent)', payment: existingPayment });
    }


    const { data: paymentRecord, error: dbError } = await supabase
      .from('payments')
      .insert({
        user_id: userId,
        amount,
        receipt_number: `REC-${transactionId}`,
        payment_date: new Date().toISOString().split('T')[0],
        semester,
        academic_year: academicYear,
        status: 'Pending',
        transaction_id: transactionId,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (dbError) {
      console.error('DB Error:', dbError);
      return res.status(500).json({ error: 'Failed to save payment record' });
    }

    if (paymentRecord.status === 'Confirmed') {
      // Logic for updating status...
    }

    res.json({ message: 'Payment processed successfully', payment: paymentRecord });
  } catch (error) {
    console.error('Payment processing error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const user = req.user;
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    const studentId = user.id || user.userId;
    const status = req.query.status as string;

    // Query finance_invoices for this student, joined with booking context
    let query = supabaseAdmin
      .from('finance_invoices')
      .select(`
        id,
        invoice_reference,
        amount,
        status,
        issued_at,
        paid_at,
        booking:bookings(
          id,
          status,
          hostel:hostels(name),
          room:rooms(room_number)
        )
      `)
      .eq('student_id', studentId)
      .order('issued_at', { ascending: false });

    if (status && status !== 'all') query = query.eq('status', status);

    const { data: invoices, error } = await query;

    if (error) {
      console.error('[Payments] Invoice fetch error:', error);
      return res.json([]);
    }

    // Map to the Payment shape the frontend expects
    const mapped = (invoices || []).map((inv: any) => {
      const booking = inv.booking;
      const hostelName = booking?.hostel?.name || 'Hostel';
      const roomNum = booking?.room?.room_number || '';
      return {
        id: inv.id,
        type: 'Accommodation Fee',
        description: `${hostelName}${roomNum ? ` — Room ${roomNum}` : ''}`,
        amount: parseFloat(inv.amount) || 0,
        dueDate: inv.issued_at,
        status: inv.status === 'paid' ? 'paid' : inv.status === 'overdue' ? 'overdue' : 'pending',
        paymentDate: inv.paid_at || null,
        reference: inv.invoice_reference,
        semester: '',
        academicYear: ''
      };
    });

    res.json(mapped);
  } catch (error) {
    console.error('Fetch payments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.put('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const paymentId = req.query.id as string;
    const { action, reason } = req.body;

    if (!paymentId || !action) {
      return res.status(400).json({ error: 'Payment ID and action are required' });
    }

    switch (action) {
      case 'refund':
        if (!reason) {
          return res.status(400).json({ error: 'Refund reason is required' });
        }
        const { error: updateError } = await supabase
          .from('payments')
          .update({
            status: 'refunded',
            // Note: DB schema seems to mix payment_records and payments. 
            // Defaulting to payments based on GET endpoint
            // refund_reason: reason,
            // refunded_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentId);

        if (updateError) return res.status(500).json({ error: 'Failed to process refund' });
        return res.json({ message: 'Payment refunded successfully' });

      case 'cancel':
        const { error: cancelError } = await supabase
          .from('payments')
          .update({
            status: 'cancelled',
            updated_at: new Date().toISOString(),
          })
          .eq('id', paymentId);

        if (cancelError) return res.status(500).json({ error: 'Failed to cancel payment' });
        return res.json({ message: 'Payment cancelled successfully' });

      default:
        return res.status(400).json({ error: 'Invalid action' });
    }
  } catch (error) {
    console.error('Payment update error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

export default router;
