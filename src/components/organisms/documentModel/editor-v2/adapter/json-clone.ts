/** Clone persist-safe: o mesmo contrato de `JSON.stringify` → Prisma Bytes. */
export function cloneJson<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

export function persistJson<T>(value: T): T {
  return cloneJson(value);
}

export function overlayDefined<T extends object>(
  source: T,
  overlay: Partial<T>,
): T {
  const next = cloneJson(source);

  (Object.keys(overlay) as Array<keyof T>).forEach((key) => {
    const value = overlay[key];
    if (value === undefined) return;
    next[key] = value as T[keyof T];
  });

  return next;
}
