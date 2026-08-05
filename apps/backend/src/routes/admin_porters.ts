import { Router, Request, Response } from 'express';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { createClient } from '@supabase/supabase-js';

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);

const router = Router();

export const dynamic = 'force-dynamic'

router.get('/', requireAuth, async (req: AuthRequest, res: Response) => {
  try {
    // Fetch Porters by querying users with role='porter', left joining porters and hostels
    const { data: usersData, error: usersError } = await supabaseAdmin
      .from('users')
      .select(`
        id,
        email,
        status,
        index_number,
        created_at,
        porters (
          full_name,
          phone
        )
      `)
      .eq('role', 'porter')

    if (usersError) {
      console.warn('[Admin Porters Route] Error fetching porters, returning empty array:', usersError)
      return res.json([]);
    }

    // Format for Frontend
    const formattedPorters = (usersData || []).map((u: any) => {
      const porterRecord = Array.isArray(u.porters) ? u.porters[0] : u.porters;
      const fullName = porterRecord?.full_name || '';
      const nameParts = fullName.split(' ');

      return {
        id: u.id,
        firstName: nameParts[0] || u.email?.split('@')[0] || 'N/A',
        lastName: nameParts.slice(1).join(' ') || '',
        email: u.email || 'N/A',
        phone: porterRecord?.phone || 'N/A',
        employeeId: u.index_number || 'P-' + u.id.substring(0,6).toUpperCase(), 
        assignedHostel: 'Unassigned',
        status: u.status || 'active',
        isOnDuty: false,
        totalCheckIns: 0,
        totalCheckOuts: 0,
        hireDate: u.created_at,
      }
    })

    return res.json(formattedPorters)

  } catch (error) {
    console.warn('[Admin Porters Route] API Error, returning empty array:', error)
    return res.json([]);
  }
});

export default router;
