import { describe, expect, it, vi } from 'vitest';
import { alignSerialSequences } from './alignSerialSequences.js';

describe('alignSerialSequences', () => {
  it('locks each table and advances its sequence without rewinding it', async () => {
    const client = { query: vi.fn().mockResolvedValue({}), release: vi.fn() };
    await alignSerialSequences({ connect: async () => client }, ['user_requests', 'ai_requests']);

    const statements = client.query.mock.calls.map(([sql]) => sql);
    expect(statements[0]).toBe('BEGIN');
    expect(statements[1]).toBe('LOCK TABLE user_requests IN SHARE MODE');
    expect(statements[2]).toContain('GREATEST(COALESCE(MAX(id), 1), (SELECT last_value FROM user_requests_id_seq))');
    expect(statements[3]).toBe('LOCK TABLE ai_requests IN SHARE MODE');
    expect(statements[4]).toContain('GREATEST(COALESCE(MAX(id), 1), (SELECT last_value FROM ai_requests_id_seq))');
    expect(statements[5]).toBe('COMMIT');
    expect(client.release).toHaveBeenCalledOnce();
  });

  it('rolls back and releases the connection when alignment fails', async () => {
    const client = {
      query: vi.fn(async (sql) => {
        if (sql.includes('SELECT setval')) throw new Error('database error');
      }),
      release: vi.fn(),
    };
    await expect(alignSerialSequences({ connect: async () => client }, ['ai_requests']))
      .rejects.toThrow('database error');
    expect(client.query.mock.calls.at(-1)[0]).toBe('ROLLBACK');
    expect(client.release).toHaveBeenCalledOnce();
  });
});
