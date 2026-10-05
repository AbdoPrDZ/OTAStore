import { formatBytes, formatDate } from '../src/utils/format';

describe('formatBytes', () => {
  it('returns null for missing values', () => {
    expect(formatBytes(null)).toBeNull();
    expect(formatBytes(undefined)).toBeNull();
  });

  it('formats bytes into readable units', () => {
    expect(formatBytes(512)).toBe('512 B');
    expect(formatBytes(2048)).toBe('2.0 KB');
    expect(formatBytes(5 * 1024 * 1024)).toBe('5.0 MB');
  });
});

describe('formatDate', () => {
  it('returns null for missing or invalid values', () => {
    expect(formatDate(null)).toBeNull();
    expect(formatDate('not-a-date')).toBeNull();
  });

  it('formats an ISO date', () => {
    expect(formatDate('2024-01-15T10:00:00.000Z')).toEqual(expect.any(String));
  });
});
