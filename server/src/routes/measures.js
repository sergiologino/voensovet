import express from 'express';
import { pool } from '../db/init.js';
import { normalizeMeasure } from '../measures.js';

export const publicMeasuresRouter = express.Router();
export const adminMeasuresRouter = express.Router();

const FIELDS = ['title', 'topic', 'scope', 'region_id', 'locality', 'audiences', 'summary', 'eligibility', 'exclusions', 'documents', 'steps', 'agency', 'apply_url', 'timing', 'source_url', 'source_checked_at'];
const fieldValues = (measure) => FIELDS.map((field) => ['audiences', 'documents', 'steps'].includes(field) ? JSON.stringify(measure[field]) : measure[field]);

publicMeasuresRouter.get('/', async (req, res, next) => {
  try {
    const regionId = typeof req.query.regionId === 'string' && /^[a-z][a-z_]{1,40}$/.test(req.query.regionId) ? req.query.regionId : null;
    const locality = typeof req.query.locality === 'string' ? req.query.locality.trim().slice(0, 100) : '';
    const result = await pool.query(
      `SELECT id, title, topic, scope, region_id, locality, audiences, summary, eligibility, exclusions,
              documents, steps, agency, apply_url, timing, source_url, source_checked_at, published_at
       FROM benefit_measures
       WHERE status = 'published' AND (scope = 'federal' OR region_id = $1)
         AND (locality = '' OR LOWER(locality) = LOWER($2))
       ORDER BY scope, title`,
      [regionId, locality]
    );
    res.json({ measures: result.rows });
  } catch (error) { next(error); }
});

adminMeasuresRouter.get('/', async (_req, res, next) => {
  try {
    const result = await pool.query('SELECT * FROM benefit_measures ORDER BY updated_at DESC, id DESC');
    res.json({ measures: result.rows });
  } catch (error) { next(error); }
});

adminMeasuresRouter.post('/', async (req, res, next) => {
  try {
    const { measure, error } = normalizeMeasure(req.body);
    if (error) return res.status(400).json({ error });
    const values = fieldValues(measure);
    const placeholders = values.map((_, index) => `$${index + 1}`).join(', ');
    const result = await pool.query(
      `INSERT INTO benefit_measures (${FIELDS.join(', ')}, updated_by) VALUES (${placeholders}, $${values.length + 1}) RETURNING *`,
      [...values, req.user.id]
    );
    res.status(201).json({ measure: result.rows[0] });
  } catch (error) { next(error); }
});

adminMeasuresRouter.put('/:id', async (req, res, next) => {
  try {
    const { measure, error } = normalizeMeasure(req.body);
    if (error) return res.status(400).json({ error });
    const values = fieldValues(measure);
    const assignments = FIELDS.map((field, index) => `${field} = $${index + 1}`).join(', ');
    const result = await pool.query(
      `UPDATE benefit_measures SET ${assignments}, status = 'draft', reviewed_by = NULL,
       published_at = NULL, updated_by = $${values.length + 1}, updated_at = NOW()
       WHERE id = $${values.length + 2} RETURNING *`,
      [...values, req.user.id, req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Мера не найдена' });
    res.json({ measure: result.rows[0] });
  } catch (error) { next(error); }
});

adminMeasuresRouter.post('/:id/publish', async (req, res, next) => {
  try {
    const existing = await pool.query('SELECT * FROM benefit_measures WHERE id = $1', [req.params.id]);
    if (!existing.rows.length) return res.status(404).json({ error: 'Мера не найдена' });
    const { error } = normalizeMeasure(existing.rows[0], true);
    if (error) return res.status(400).json({ error });
    const result = await pool.query(
      `UPDATE benefit_measures SET status = 'published', reviewed_by = $1,
       published_at = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *`,
      [req.user.id, req.params.id]
    );
    res.json({ measure: result.rows[0] });
  } catch (error) { next(error); }
});

adminMeasuresRouter.post('/:id/unpublish', async (req, res, next) => {
  try {
    const result = await pool.query(
      `UPDATE benefit_measures SET status = 'draft', reviewed_by = NULL,
       published_at = NULL, updated_at = NOW() WHERE id = $1 RETURNING *`,
      [req.params.id]
    );
    if (!result.rows.length) return res.status(404).json({ error: 'Мера не найдена' });
    res.json({ measure: result.rows[0] });
  } catch (error) { next(error); }
});
