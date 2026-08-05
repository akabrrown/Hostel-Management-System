import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Middleware to check if user is porter
const requirePorter = (req: any, res: any, next: any) => {
    if (req.user.role !== 'porter') {
        return res.status(403).json({ ok: false, error: 'Forbidden' });
    }
    next();
};

// Get all complaints for the porter's assigned hostel
router.get('/', requireAuth, requirePorter, async (req: any, res) => {
    try {
        const porterId = req.user.id;
        
        // 1. Get porter's assigned hostel
        const { data: porter, error: porterError } = await supabase
            .from('porters')
            .select('assigned_hostel_id')
            .eq('id', porterId)
            .single();
            
        if (porterError || !porter || !porter.assigned_hostel_id) {
            return res.status(403).json({ ok: false, error: 'Porter has no assigned hostel' });
        }

        const assignedHostelId = porter.assigned_hostel_id;

        // 2. Fetch complaints for this hostel
        const { data: complaints, error } = await supabase
            .from('complaints')
            .select(`
                *,
                hostels (name),
                rooms (room_number),
                users (
                  id, 
                  index_number,
                  students (full_name)
                )
            `)
            .eq('hostel_id', assignedHostelId)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching complaints:', error);
            return res.status(500).json({ ok: false, error: 'Failed to fetch complaints' });
        }

        res.json({ ok: true, data: complaints });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ ok: false, error: 'Internal server error' });
    }
});

// Update complaint status (must be in their assigned hostel)
router.patch('/:id/status', requireAuth, requirePorter, async (req: any, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const porterId = req.user.id;

        if (!status || !['Pending', 'In Progress', 'Resolved', 'Rejected'].includes(status)) {
            return res.status(400).json({ ok: false, error: 'Invalid status' });
        }
        
        // Check porter hostel
        const { data: porter } = await supabase
            .from('porters')
            .select('assigned_hostel_id')
            .eq('id', porterId)
            .single();
            
        if (!porter || !porter.assigned_hostel_id) {
            return res.status(403).json({ ok: false, error: 'Porter has no assigned hostel' });
        }

        // We could verify the complaint belongs to the hostel, but RLS or strict WHERE works.
        const { data, error } = await supabase
            .from('complaints')
            .update({ status })
            .eq('id', id)
            .eq('hostel_id', porter.assigned_hostel_id)
            .select()
            .single();

        if (error) {
            console.error('Error updating complaint status:', error);
            return res.status(500).json({ ok: false, error: 'Failed to update status' });
        }

        res.json({ ok: true, data });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ ok: false, error: 'Internal server error' });
    }
});

export default router;
