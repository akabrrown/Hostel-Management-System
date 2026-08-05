import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Middleware to check if user is admin
const requireAdmin = (req: any, res: any, next: any) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ ok: false, error: 'Forbidden' });
    }
    next();
};

// Get all complaints
router.get('/', requireAuth, requireAdmin, async (req: any, res) => {
    try {
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

// Update complaint status
router.patch('/:id/status', requireAuth, requireAdmin, async (req: any, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!status || !['Pending', 'In Progress', 'Resolved', 'Rejected'].includes(status)) {
            return res.status(400).json({ ok: false, error: 'Invalid status' });
        }

        const { data, error } = await supabase
            .from('complaints')
            .update({ status })
            .eq('id', id)
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
