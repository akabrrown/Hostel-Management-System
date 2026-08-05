import { Worker, Queue } from 'bullmq';
import Redis from 'ioredis';
import dotenv from 'dotenv';

dotenv.config();

// BullMQ strictly requires Redis 5.0.0+
// To prevent crashing on machines without Redis, we'll mock the queues if REDIS_URL isn't provided
const redisUrl = process.env.REDIS_URL;
const hasRedis = !!redisUrl;

let connection: any;
let notificationQueue: any;
let paymentExpiryQueue: any;

if (hasRedis) {
  // Use standard REDIS_URL provided in .env or .env.local
  connection = new Redis(redisUrl, { maxRetriesPerRequest: null });
  notificationQueue = new Queue('Notifications', { connection });
  paymentExpiryQueue = new Queue('PaymentExpiry', { connection });
} else {
  // Mock queues for local development without proper Redis
  const mockQueue = {
    add: async (name: string, data: any, opts: any) => console.log(`[Mock Queue] Added job ${name}:`, data)
  };
  notificationQueue = mockQueue;
  paymentExpiryQueue = mockQueue;
}

export { notificationQueue, paymentExpiryQueue };

export const initWorkers = () => {
  if (!hasRedis) {
    console.log('Using Mock Queues. BullMQ workers will not be initialized.');
    return { notificationWorker: null, paymentWorker: null };
  }

  const { createClient } = require('@supabase/supabase-js');
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );

  const notificationWorker = new Worker('Notifications', async (job) => {
    console.log(`[Worker] Processing notification job ${job.id}`);
    const { userId, type, message } = job.data;
    
    const { error } = await supabaseAdmin.from('notifications').insert({
      user_id: userId,
      type,
      message,
      is_read: false
    });

    if (error) {
      console.error(`[Worker] Failed to create notification for ${userId}:`, error.message);
      throw error;
    }
    console.log(`[Worker] Sent notification to: ${userId}`);
  }, { connection });

  const paymentWorker = new Worker('PaymentExpiry', async (job) => {
    console.log(`[Worker] Processing payment expiry job ${job.id}`);
    const { reservationId } = job.data;
    
    // Check current status
    const { data: reservation, error: fetchError } = await supabaseAdmin
      .from('reservations')
      .select('status, student_id')
      .eq('id', reservationId)
      .single();

    if (fetchError || !reservation) {
      console.error(`[Worker] Reservation ${reservationId} not found or error.`, fetchError);
      return; // Stop if not found
    }

    if (reservation.status === 'pending' || reservation.status === 'awaiting_payment') {
      const { error: updateError } = await supabaseAdmin
        .from('reservations')
        .update({ status: 'expired' })
        .eq('id', reservationId);
        
      if (updateError) {
        console.error(`[Worker] Failed to expire reservation ${reservationId}:`, updateError.message);
        throw updateError;
      }
      
      console.log(`[Worker] Successfully expired reservation ${reservationId}`);

      // Queue a notification to the student
      await notificationQueue.add('reservation_expired', {
        userId: reservation.student_id,
        type: 'system',
        message: 'Your room reservation has expired due to non-payment.'
      });
    } else {
      console.log(`[Worker] Reservation ${reservationId} is already ${reservation.status}, no action taken.`);
    }
  }, { connection });

  console.log('BullMQ workers initialized successfully');

  // Listen for completed/failed events for debugging
  paymentWorker.on('completed', job => {
    console.log(`[Worker] Job ${job.id} has completed!`);
  });

  paymentWorker.on('failed', (job, err) => {
    console.log(`[Worker] Job ${job?.id} has failed with ${err.message}`);
  });

  return { notificationWorker, paymentWorker };
};
