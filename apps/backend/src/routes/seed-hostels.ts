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

import { NextResponse } from 'next/server'


// Create service role client for admin operations


router.post('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    const sampleHostels = [
      {
        name: 'UPSA Main Hostel - Block A',
        code: 'HBLK-A',
        address: 'UPSA Campus, Accra, Ghana',
        description: 'Modern hostel facility with excellent amenities and security',
        created_at: new Date().toISOString()
      },
      {
        name: 'UPSA Female Hostel - Block B',
        code: 'HBLK-B',
        address: 'UPSA Campus, Accra, Ghana',
        description: 'Female-only hostel with enhanced security and privacy features',
        created_at: new Date().toISOString()
      },
      {
        name: 'UPSA Male Hostel - Block C',
        code: 'HBLK-C',
        address: 'UPSA Campus, Accra, Ghana',
        description: 'Male-only hostel with sports facilities and recreation areas',
        created_at: new Date().toISOString()
      }
    ]

    const { data, error } = await supabaseAdmin
      .from('hostels')
      .insert(sampleHostels)
      .select()

    if (error) {
      return res.status(500).json({ 
        error: 'Failed to insert hostels', 
        details: error.message 
      });
    }

    return res.json({ 
      message: 'Sample hostels added successfully',
      hostels: data 
    });
  } catch (err) {
    return res.status(500).json({ 
      error: 'Unexpected error', 
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

export default router;
