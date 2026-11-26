import { pool } from './db/init.js';

export const DEFAULT_ENABLED_REGION_IDS = ['vladimir', 'kaluga'];

export function parseEnabledRegionIds(value) {
  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed.every((id) => typeof id === 'string' && /^[a-z][a-z_]{1,40}$/.test(id))) {
      return [...new Set(parsed)];
    }
  } catch { /* use pilot defaults */ }
  return DEFAULT_ENABLED_REGION_IDS;
}

export async function getEnabledRegionIds() {
  const result = await pool.query("SELECT value FROM admin_settings WHERE key = 'enabled_regions'");
  return parseEnabledRegionIds(result.rows[0]?.value);
}

export function isEnabledRegionId(value, enabledIds) {
  return typeof value === 'string' && enabledIds.includes(value);
}
