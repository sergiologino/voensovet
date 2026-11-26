import express from 'express';
import { pool } from '../db/init.js';
import { authenticateToken } from '../middleware/auth.js';
import { evaluateMeasure, normalizeNavigatorProfile } from '../navigator.js';
import { navigatorProgressRouter } from './navigatorProgress.js';

export const navigatorRouter = express.Router();
navigatorRouter.use(authenticateToken);
navigatorRouter.use('/progress', navigatorProgressRouter);

navigatorRouter.get('/profile', async (req, res, next) => {
  try {
    const result = await pool.query('SELECT audience, disability, relationship, children_count, housing FROM navigator_profiles WHERE user_id = $1', [req.user.id]);
    res.json({ profile: result.rows[0] || null });
  } catch (error) { next(error); }
});

navigatorRouter.put('/profile', async (req, res, next) => {
  try {
    const { profile, error } = normalizeNavigatorProfile(req.body);
    if (error) return res.status(400).json({ error });
    const result = await pool.query(
      `INSERT INTO navigator_profiles (user_id, audience, disability, relationship, children_count, housing)
       VALUES ($1,$2,$3,$4,$5,$6)
       ON CONFLICT (user_id) DO UPDATE SET audience = EXCLUDED.audience, disability = EXCLUDED.disability,
       relationship = EXCLUDED.relationship, children_count = EXCLUDED.children_count,
       housing = EXCLUDED.housing, updated_at = NOW()
       RETURNING audience, disability, relationship, children_count, housing`,
      [req.user.id, profile.audience, profile.disability, profile.relationship, profile.children_count, profile.housing]
    );
    res.json({ profile: result.rows[0] });
  } catch (error) { next(error); }
});

navigatorRouter.get('/matches', async (req, res, next) => {
  try {
    const profileResult = await pool.query('SELECT audience, disability, relationship, children_count, housing FROM navigator_profiles WHERE user_id = $1', [req.user.id]);
    if (!profileResult.rows.length) return res.status(404).json({ error: 'Сначала заполните анкету' });
    const locality = typeof req.query.locality === 'string' ? req.query.locality.trim().slice(0, 100) : '';
    const topic = typeof req.query.topic === 'string' && /^[a-z]{3,30}$/.test(req.query.topic) ? req.query.topic : null;
    const result = await pool.query(
      `SELECT id, title, topic, scope, region_id, locality, audiences, match_rules, summary, eligibility,
              exclusions, documents, steps, agency, apply_url, timing, source_url, source_checked_at, date_end
       FROM benefit_measures WHERE status = 'published' AND (date_end IS NULL OR date_end >= CURRENT_DATE)
       AND (scope = 'federal' OR region_id = $1) AND (locality = '' OR LOWER(locality) = LOWER($2))
       AND ($3::text IS NULL OR topic = $3) ORDER BY scope, title`,
      [req.user.region_id, locality, topic]
    );
    res.json({ matches: result.rows.map((measure) => evaluateMeasure(measure, profileResult.rows[0])).filter(Boolean) });
  } catch (error) { next(error); }
});
