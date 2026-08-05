import { Router } from 'express';
import { authenticateUser, registerUser, logoutUser, requestPasswordReset, resetPassword, changePassword, verifyMockOtp, completeInitialReset } from '../lib/auth';
import { requireAuth, AuthRequest } from '../middleware/auth';
import { loginRateLimiter } from '../middleware/rateLimiter';

const router = Router();

router.post('/login', loginRateLimiter, async (req, res) => {
  console.log('[Auth Route] /login hit. req.body:', req.body);
  try {
    const { identifier, email, password, role } = req.body;
    
    // Support both identifier and email for backward compatibility during migration
    const loginIdentifier = identifier || email;

    if (!loginIdentifier) {
      return res.status(400).json({ error: 'Identifier or email is required' });
    }

    const result = await authenticateUser(loginIdentifier, password, role);
    console.log('[Auth Route] Success, sending result');
    res.json(result);
  } catch (error: any) {
    console.error('[Auth Route] Error:', error.message);
    res.status(401).json({ error: error.message || 'Authentication failed' });
  }
});

router.post('/register', async (req, res) => {
  try {
    const result = await registerUser(req.body);
    res.status(201).json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Registration failed' });
  }
});

router.post('/logout', requireAuth, async (req: AuthRequest, res) => {
  try {
    const sessionId = req.session?.id || req.body.sessionId; // Depending on how session is stored
    await logoutUser(sessionId, req.user?.id);
    res.json({ success: true });
  } catch (error: any) {
    res.status(500).json({ error: 'Logout failed' });
  }
});

router.post('/request-password-reset', loginRateLimiter, async (req, res) => {
  try {
    const { email } = req.body;
    await requestPasswordReset(email);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    await resetPassword(token, newPassword);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/change-password', requireAuth, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    await changePassword(req.user?.id, currentPassword, newPassword);
    res.json({ success: true });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/verify-otp', async (req, res) => {
  try {
    const { token, otp } = req.body;
    const result = await verifyMockOtp(token, otp);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

router.post('/complete-initial-reset', async (req, res) => {
  try {
    const { token, newPassword } = req.body;
    const result = await completeInitialReset(token, newPassword);
    res.json(result);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
});

export default router;
