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


router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Test basic connection
    const { data, error } = await supabase
      .from('hostels')
      .select('count')
      .limit(1)

    if (error) {
      return res.json({ 
        error: 'Database query failed', 
        details: error.message,
        code: error.code 
      });
    }

    return res.json({ 
      message: 'Connection successful',
      data: data 
    });
  } catch (err) {
    return res.json({ 
      error: 'Unexpected error', 
      details: err instanceof Error ? err.message : 'Unknown error'
    });
  }
});

export default router;
