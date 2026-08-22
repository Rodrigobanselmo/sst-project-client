import { persistJson } from '../adapter/json-clone';

export type CanonicalDiffKind = 'added' | 'removed' | 'changed';

export type CanonicalDiffChange = {
  path: string;
  kind: CanonicalDiffKind;
  before?: unknown;
  after?: unknown;
};

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function segmentFor(value: unknown, key: string): string {
  if (isPlainObject(value) && typeof value.id === 'string' && value.id) {
    return `[${value.id}]`;
  }
  return key;
}

function joinPath(base: string, segment: string) {
  return base ? `${base}/${segment}` : segment;
}

function walk(
  before: unknown,
  after: unknown,
  path: string,
  out: CanonicalDiffChange[],
) {
  if (before === after) return;

  if (before === undefined) {
    out.push({ path: path || '/', kind: 'added', after });
    return;
  }
  if (after === undefined) {
    out.push({ path: path || '/', kind: 'removed', before });
    return;
  }

  if (Array.isArray(before) || Array.isArray(after)) {
    if (!Array.isArray(before) || !Array.isArray(after)) {
      out.push({ path: path || '/', kind: 'changed', before, after });
      return;
    }
    const max = Math.max(before.length, after.length);
    for (let index = 0; index < max; index += 1) {
      const left = before[index];
      const right = after[index];
      const segment = segmentFor(right ?? left, String(index));
      walk(left, right, joinPath(path, segment), out);
    }
    return;
  }

  if (isPlainObject(before) || isPlainObject(after)) {
    if (!isPlainObject(before) || !isPlainObject(after)) {
      out.push({ path: path || '/', kind: 'changed', before, after });
      return;
    }
    const keys = Array.from(
      new Set([...Object.keys(before), ...Object.keys(after)]),
    );
    keys.forEach((key) => {
      walk(before[key], after[key], joinPath(path, key), out);
    });
    return;
  }

  if (before !== after) {
    out.push({ path: path || '/', kind: 'changed', before, after });
  }
}

/** Diff estrutural por path sobre o contrato persistido (`JSON.parse(JSON.stringify)`). */
export function canonicalDiff(before: unknown, after: unknown): CanonicalDiffChange[] {
  const left = persistJson(before);
  const right = persistJson(after);
  const changes: CanonicalDiffChange[] = [];
  walk(left, right, '', changes);
  return changes;
}

export function isPathAllowed(
  path: string,
  allowed: readonly string[],
): boolean {
  return allowed.some(
    (prefix) => path === prefix || path.startsWith(`${prefix}/`),
  );
}

export function assertAllowedCanonicalDiff(
  before: unknown,
  after: unknown,
  allowedPaths: readonly string[],
): CanonicalDiffChange[] {
  const changes = canonicalDiff(before, after);
  const unexpected = changes.filter(
    (change) => !isPathAllowed(change.path, allowedPaths),
  );
  if (unexpected.length) {
    const detail = unexpected
      .map((change) => `${change.kind}:${change.path}`)
      .join(', ');
    throw new Error(`Canonical diff fora do permitido: ${detail}`);
  }
  return changes;
}
