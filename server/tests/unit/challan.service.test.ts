import { beforeEach, describe, it, expect, vi } from 'vitest';
import { computeStockStatus } from '../../src/utils/mappers';
import { withTransaction } from '../../src/utils/withTransaction';

const { mockClient, mockPool } = vi.hoisted(() => {
  const mockClient = {
    query: vi.fn(),
    release: vi.fn(),
  };

  return {
    mockClient,
    mockPool: {
      connect: vi.fn(async () => mockClient),
    },
  };
});

vi.mock('../../src/config/database', () => ({
  pool: mockPool,
}));

beforeEach(() => {
  mockClient.query.mockReset();
  mockClient.release.mockReset();
  mockPool.connect.mockClear();
});

describe('computeStockStatus (Property 5)', () => {
  it('returns "out" when current_stock is 0 regardless of minimum_stock', () => {
    expect(computeStockStatus(0, 0)).toBe('out');
    expect(computeStockStatus(0, 10)).toBe('out');
    expect(computeStockStatus(0, 100)).toBe('out');
  });

  it('returns "low" when 0 < current_stock <= minimum_stock', () => {
    expect(computeStockStatus(1, 1)).toBe('low');
    expect(computeStockStatus(5, 10)).toBe('low');
    expect(computeStockStatus(10, 10)).toBe('low');
  });

  it('returns "healthy" when current_stock > minimum_stock', () => {
    expect(computeStockStatus(11, 10)).toBe('healthy');
    expect(computeStockStatus(100, 0)).toBe('healthy');
    expect(computeStockStatus(50, 49)).toBe('healthy');
  });

  it('boundary: stock exactly equal to minimum is "low" not "healthy"', () => {
    expect(computeStockStatus(5, 5)).toBe('low');
  });

  it('boundary: stock one above minimum is "healthy"', () => {
    expect(computeStockStatus(6, 5)).toBe('healthy');
  });
});

describe('Challan number format (Property 6)', () => {
  const CHALLAN_REGEX = /^CH-\d{4}-\d{6}$/;

  it('format CH-YYYY-XXXXXX matches regex', () => {
    const year = new Date().getFullYear();
    const examples = [
      `CH-${year}-000001`,
      `CH-${year}-000099`,
      `CH-${year}-999999`,
    ];
    examples.forEach(n => expect(CHALLAN_REGEX.test(n)).toBe(true));
  });

  it('rejects invalid formats', () => {
    expect(CHALLAN_REGEX.test('CH-2026-1')).toBe(false);
    expect(CHALLAN_REGEX.test('ch-2026-000001')).toBe(false);
    expect(CHALLAN_REGEX.test('2026-000001')).toBe(false);
  });
});

describe('withTransaction rollback on error', () => {
  it('throws error and does not swallow it', async () => {
    const error = new Error('Simulated DB error');

    await expect(
      withTransaction(async (_client) => {
        throw error;
      })
    ).rejects.toThrow('Simulated DB error');
    expect(mockClient.query).toHaveBeenCalledWith('BEGIN');
    expect(mockClient.query).toHaveBeenCalledWith('ROLLBACK');
    expect(mockClient.release).toHaveBeenCalledOnce();
  });
});
