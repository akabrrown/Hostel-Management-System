import { Router } from 'express';
import { supabase } from '../lib/supabase';
import { requireAuth } from '../middleware/auth';

const router = Router();

// Get all complaints for the authenticated student
router.get('/', requireAuth, async (req: any, res) => {
    try {
        const studentId = req.user.id;
        
        const { data: complaints, error } = await supabase
            .from('complaints')
            .select(`
                *,
                hostels (name),
                rooms (room_number)
            `)
            .eq('student_id', studentId)
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

// Create a new complaint
router.post('/', requireAuth, async (req: any, res) => {
    try {
        const studentId = req.user.id;
        const { title, description, category, priority, room_id, hostel_id } = req.body;

        if (!title || !description || !category || !hostel_id) {
            return res.status(400).json({ ok: false, error: 'Missing required fields' });
        }

        const { data, error } = await supabase
            .from('complaints')
            .insert([{
                student_id: studentId,
                hostel_id,
                room_id,
                title,
                description,
                category,
                priority: priority || 'Medium',
                status: 'Pending'
            }])
            .select()
            .single();

        if (error) {
            console.error('Error creating complaint:', error);
            return res.status(500).json({ ok: false, error: 'Failed to create complaint' });
        }

        res.json({ ok: true, data });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ ok: false, error: 'Internal server error' });
    }
});

export default router;
