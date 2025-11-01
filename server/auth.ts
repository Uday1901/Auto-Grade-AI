import express from 'express';
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import jwt from 'jsonwebtoken';
import cookieParser from 'cookie-parser';
import { upsertUserFromProfile, initDb } from './db';

const router = express.Router();

// Initialize DB (ensure tables)
initDb().catch((err) => console.error('DB init error', err));

const clientID = process.env.GOOGLE_CLIENT_ID!;
const clientSecret = process.env.GOOGLE_CLIENT_SECRET!;
const jwtSecret = process.env.JWT_SECRET || 'change_me';

if (!clientID || !clientSecret) {
  console.warn('Google OAuth client ID/secret not set. Auth will not work without them.');
}

passport.use(
  new GoogleStrategy(
    {
      clientID,
      clientSecret,
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/auth/google/callback',
      passReqToCallback: true,
    },
    async (req: express.Request, accessToken: string, refreshToken: string, profile: any, done: any) => {
      try {
        // role may be passed via state param
        const role = (req.query.state as string) || undefined;
        console.info(`[auth] Google callback for profile id=${profile.id} email=${profile.emails?.[0]?.value} role=${role}`);
        const user = await upsertUserFromProfile(profile, role);
        console.info(`[auth] Upserted user id=${user.id} role=${user.role}`);
        return done(null, user);
      } catch (err) {
        console.error('[auth] Error in GoogleStrategy verify callback', err);
        return done(err as Error);
      }
    }
  )
);

// Helper to sign JWT and set cookie
function setAuthCookie(res: express.Response, user: any) {
  const payload = { id: user.id, role: user.role };
  const token = jwt.sign(payload, jwtSecret, { expiresIn: '7d' });
  res.cookie('gw_token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}

// Routes
router.use(cookieParser());

router.get('/google', (req, res, next) => {
  const role = req.query.role as string | undefined;
  // encode role in state
  const state = role ? role : '';
  passport.authenticate('google', { scope: ['profile', 'email'], state })(req, res, next);
});

let lastAuthError: any = null;

router.get('/google/callback', (req, res, next) => {
  passport.authenticate('google', { session: false }, (err: any, user: any, info: any) => {
    if (err) {
      console.error('[auth] Passport authentication error', { err, info, query: req.query });
      lastAuthError = { timestamp: new Date().toISOString(), type: 'passport_error', message: (err && err.message) || String(err), info, query: req.query };
      // Redirect user back to frontend; frontend will call /auth/error to fetch diagnostics
      return res.redirect('/?auth_error=true');
    }
    if (!user) {
      console.warn('[auth] No user returned from passport authenticate', { info, query: req.query });
      lastAuthError = { timestamp: new Date().toISOString(), type: 'no_user', message: 'No user returned from Google strategy', info, query: req.query };
      return res.redirect('/?auth_error=true');
    }

    try {
      setAuthCookie(res, user);
      console.info(`[auth] User authenticated and cookie set for user id=${user.id}`);
      return res.redirect('/');
    } catch (e) {
      console.error('[auth] Error setting auth cookie', e);
      lastAuthError = { timestamp: new Date().toISOString(), type: 'cookie_error', message: (e && e.message) || String(e) };
      return res.redirect('/?auth_error=true');
    }
  })(req, res, next);
});

// Debug-only endpoint to fetch the last auth error
router.get('/error', (req, res) => {
  if (!lastAuthError) return res.json({ ok: true, message: 'no recent auth errors' });
  // Do not expose raw error stack in production
  const safe = { ...lastAuthError };
  if (process.env.NODE_ENV === 'production') {
    if (safe.err) delete safe.err;
  }
  res.json({ ok: false, error: safe });
});

// Simple route to get current user from cookie
router.get('/me', async (req, res) => {
  const token = req.cookies?.gw_token;
  if (!token) return res.status(401).json({ message: 'Not authenticated' });
  try {
    const payload = jwt.verify(token, jwtSecret) as any;
    // minimal response
    res.json({ id: payload.id, role: payload.role });
  } catch (err) {
    res.status(401).json({ message: 'Invalid token' });
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('gw_token');
  res.json({ success: true });
});

export default router;
