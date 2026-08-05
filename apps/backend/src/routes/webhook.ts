import { Router, Request, Response } from 'express';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const router = Router();

// Mock School Finance System webhook callback
router.post('/finance/payment-status', async (req: Request, res: Response) => {
  try {
    const { booking_id, student_id, amount, status, payment_reference: req_payment_ref } = req.body;
    // Note: In real life, this should have a signature verification step.
    
    const payment_reference = req_payment_ref || `TXN-${Math.floor(Math.random() * 100000)}`;

    // 1. Idempotency Check
    const { data: existingPayment } = await supabase
      .from('payments')
      .select('id')
      .eq('payment_reference', payment_reference)
      .single();

    if (existingPayment) {
      return res.json({ message: 'Webhook already processed (Idempotent)' });
    }

    // 2. Generate an invoice ref since we're mocking the flow
    const invoice_reference = `INV-${Math.floor(Math.random() * 100000)}`;

    // 3. Create the mock invoice
    const { data: invoice, error: invoiceError } = await supabase
      .from('finance_invoices')
      .insert({
        booking_id,
        student_id,
        invoice_reference,
        amount,
        status: status === 'success' ? 'paid' : 'failed',
        paid_at: status === 'success' ? new Date().toISOString() : null
      })
      .select()
      .single();

    if (invoiceError) throw invoiceError;

    // 4. Create the mock payment record
    const { error: paymentError } = await supabase
      .from('payments')
      .insert({
        invoice_id: invoice.id,
        booking_id,
        amount,
        payment_reference,
        status: status === 'success' ? 'paid' : 'failed',
        verified_at: new Date().toISOString()
      });

    if (paymentError) throw paymentError;

    // 5. Update the Booking status
    const bookingStatus = status === 'success' ? 'paid' : 'awaiting_payment';
    const { error: bookingError } = await supabase
      .from('bookings')
      .update({ status: bookingStatus })
      .eq('id', booking_id);

    if (bookingError) throw bookingError;

    res.json({ message: 'Webhook processed successfully', bookingStatus });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
