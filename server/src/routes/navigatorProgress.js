import express from 'express';
import { pool } from '../db/init.js';
import { evaluateMeasure, stepKey } from '../navigator.js';

export const navigatorProgressRouter = express.Router();

const measureId = (raw) => /^[1-9]\d{0,18}$/.test(raw || '') && BigInt(raw) <= 9223372036854775807n ? raw : null;

async function ownProfile(userId) {
  const result = await pool.query('SELECT audience, disability, relationship, children_count, housing FROM navigator_profiles WHERE user_id = $1', [userId]);
  return result.rows[0] || null;
}

navigatorProgressRouter.get('/', async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT r.measure_id, r.selected_locality, r.saved_at, r.updated_at,
              m.id, m.title, m.topic, m.scope, m.region_id, m.locality, m.audiences,
              m.match_rules, m.steps, m.status, m.date_end,
              (m.status = 'published' AND (m.date_end IS NULL OR m.date_end >= CURRENT_DATE)
               AND (m.scope = 'federal' OR m.region_id = $2)
               AND (m.locality = '' OR LOWER(m.locality) = LOWER(r.selected_locality))) AS catalog_available
       FROM navigator_routes r JOIN benefit_measures m ON m.id = r.measure_id
       WHERE r.user_id = $1 ORDER BY r.updated_at DESC, r.measure_id DESC`,
      [req.user.id, req.user.region_id]
    );
    const steps = await pool.query('SELECT measure_id, step_key FROM navigator_completed_steps WHERE user_id = $1', [req.user.id]);
    const profile = await ownProfile(req.user.id);
    const completed = new Map();
    steps.rows.forEach((row) => {
      const key = String(row.measure_id);
      if (!completed.has(key)) completed.set(key, new Set());
      completed.get(key).add(row.step_key.trim());
    });
    res.json({ routes: result.rows.map((row) => {
      const completedKeys = completed.get(String(row.measure_id)) || new Set();
      const completedStepIndices = row.steps.flatMap((step, index) => completedKeys.has(stepKey(step, index)) ? [index] : []);
      return {
        measure_id: row.measure_id,
        saved_at: row.saved_at,
        updated_at: row.updated_at,
        available: !!row.catalog_available && !!profile && !!evaluateMeasure(row, profile),
        completed_step_indices: completedStepIndices,
        measure: { id: row.id, title: row.title, topic: row.topic, steps: row.steps },
      };
    }) });
  } catch (error) { next(error); }
});

navigatorProgressRouter.post('/:measureId', async (req, res, next) => {
  try {
    const id = measureId(req.params.measureId);
    if (!id) return res.status(400).json({ error: 'Некорректная мера' });
    const profile = await ownProfile(req.user.id);
    if (!profile) return res.status(409).json({ error: 'Сначала заполните анкету' });
    const locality = typeof req.body?.locality === 'string' ? req.body.locality.trim().slice(0, 100) : '';
    const result = await pool.query(
      `SELECT * FROM benefit_measures WHERE id = $1 AND status = 'published'
       AND (date_end IS NULL OR date_end >= CURRENT_DATE)
       AND (scope = 'federal' OR region_id = $2)
       AND (locality = '' OR LOWER(locality) = LOWER($3))`,
      [id, req.user.region_id, locality]
    );
    if (!result.rows.length || !evaluateMeasure(result.rows[0], profile)) return res.status(404).json({ error: 'Мера недоступна для вашего маршрута' });
    await pool.query(
      `INSERT INTO navigator_routes (user_id, measure_id, selected_locality) VALUES ($1,$2,$3)
       ON CONFLICT (user_id, measure_id) DO NOTHING`,
      [req.user.id, id, locality]
    );
    res.status(201).json({ message: 'Маршрут сохранён' });
  } catch (error) { next(error); }
});

navigatorProgressRouter.put('/:measureId/steps/:stepIndex', async (req, res, next) => {
  try {
    const id = measureId(req.params.measureId);
    const index = /^\d+$/.test(req.params.stepIndex || '') ? Number(req.params.stepIndex) : -1;
    if (!id || !Number.isSafeInteger(index) || typeof req.body?.completed !== 'boolean') return res.status(400).json({ error: 'Некорректная отметка шага' });
    const result = await pool.query(
      `SELECT m.* FROM navigator_routes r JOIN benefit_measures m ON m.id = r.measure_id
       WHERE r.user_id = $1 AND r.measure_id = $2 AND m.status = 'published'
       AND (m.date_end IS NULL OR m.date_end >= CURRENT_DATE)
       AND (m.scope = 'federal' OR m.region_id = $3)
       AND (m.locality = '' OR LOWER(m.locality) = LOWER(r.selected_locality))`,
      [req.user.id, id, req.user.region_id]
    );
    const profile = await ownProfile(req.user.id);
    if (!result.rows.length || !profile || !evaluateMeasure(result.rows[0], profile)) return res.status(404).json({ error: 'Сохранённый маршрут недоступен' });
    const step = result.rows[0].steps[index];
    if (!step) return res.status(400).json({ error: 'Такого шага нет' });
    const key = stepKey(step, index);
    if (req.body.completed) await pool.query(
      `INSERT INTO navigator_completed_steps (user_id, measure_id, step_key) VALUES ($1,$2,$3)
       ON CONFLICT DO NOTHING`, [req.user.id, id, key]
    );
    else await pool.query('DELETE FROM navigator_completed_steps WHERE user_id = $1 AND measure_id = $2 AND step_key = $3', [req.user.id, id, key]);
    await pool.query('UPDATE navigator_routes SET updated_at = NOW() WHERE user_id = $1 AND measure_id = $2', [req.user.id, id]);
    res.json({ completed_step_index: index, completed: req.body.completed });
  } catch (error) { next(error); }
});

navigatorProgressRouter.delete('/:measureId', async (req, res, next) => {
  try {
    const id = measureId(req.params.measureId);
    if (!id) return res.status(400).json({ error: 'Некорректная мера' });
    await pool.query('DELETE FROM navigator_routes WHERE user_id = $1 AND measure_id = $2', [req.user.id, id]);
    res.json({ message: 'Маршрут удалён' });
  } catch (error) { next(error); }
});
