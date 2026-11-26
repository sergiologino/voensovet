import express from 'express';
import { getEnabledRegionIds } from '../regions.js';

const router = express.Router();
router.get('/', async (_req, res, next) => {
  try {
    res.json({ regionIds: await getEnabledRegionIds() });
  } catch (error) {
    next(error);
  }
});
export default router;
