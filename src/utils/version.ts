/**
 * Compares two version strings segment by segment. Returns -1 when `a < b`,
 * 1 when `a > b`, and 0 when they are equal or not comparable.
 *
 * Tolerant on purpose: it strips a leading `v`, treats `-`/`+` as separators
 * and reads any non-numeric segment as 0, so best-effort comparison against the
 * store's free-text version labels never throws.
 */
export function compareVersions(a?: string | null, b?: string | null): number {
  if (!a && !b) {
    return 0;
  }

  if (!a) {
    return -1;
  }

  if (!b) {
    return 1;
  }

  const left = parseVersion(a);
  const right = parseVersion(b);
  const length = Math.max(left.length, right.length);

  for (let index = 0; index < length; index += 1) {
    const x = left[index] ?? 0;
    const y = right[index] ?? 0;

    if (x !== y) {
      return x < y ? -1 : 1;
    }
  }

  return 0;
}

function parseVersion(value: string): number[] {
  return value
    .trim()
    .replace(/^v/i, '')
    .split(/[.+\-_]/)
    .map(segment => {
      const parsed = parseInt(segment, 10);
      return Number.isNaN(parsed) ? 0 : parsed;
    });
}
