import type { SystemRiskMatrixAxisLevelColor } from '@v2/services/security/risk-matrix/service/risk-matrix.types';

import { normalizeRiskMatrixHex } from './risk-matrix-hex.util';

const AXIS_VALUES = [1, 2, 3, 4, 5] as const;

export type CustomAxisLevelColor = SystemRiskMatrixAxisLevelColor;

/**
 * Paleta persistida da versão CUSTOM: [] = herda SYSTEM vigente;
 * exatamente 5 níveis = override próprio. 1..4 é inválido e trata-se como [].
 */
export function acceptStoredCustomAxisLevelColors(
  input?: Array<{ value?: number; color?: string }> | null,
): CustomAxisLevelColor[] {
  if (!Array.isArray(input) || input.length === 0) return [];

  const byValue = new Map<number, string>();
  for (const item of input) {
    const value = item?.value;
    const color = normalizeRiskMatrixHex(item?.color);
    if (
      typeof value !== 'number' ||
      !AXIS_VALUES.includes(value as (typeof AXIS_VALUES)[number]) ||
      !color
    ) {
      continue;
    }
    if (!byValue.has(value)) {
      byValue.set(value, color);
    }
  }

  if (byValue.size !== AXIS_VALUES.length) return [];

  return AXIS_VALUES.map((value) => ({
    value,
    color: byValue.get(value) as string,
  }));
}

export function hasCustomAxisLevelColorOverride(
  stored?: Array<{ value?: number; color?: string }> | null,
) {
  return acceptStoredCustomAxisLevelColors(stored).length === 5;
}

export function resolveEffectiveCustomAxisLevelColors(params: {
  stored?: Array<{ value?: number; color?: string }> | null;
  systemFallback?: Array<{ value?: number; color?: string }> | null;
}): CustomAxisLevelColor[] {
  const stored = acceptStoredCustomAxisLevelColors(params.stored);
  if (stored.length === 5) return stored;
  return acceptStoredCustomAxisLevelColors(params.systemFallback);
}

export function setCustomAxisLevelColor(
  stored: Array<{ value?: number; color?: string }> | null | undefined,
  systemFallback: Array<{ value?: number; color?: string }> | null | undefined,
  value: number,
  color: string,
): CustomAxisLevelColor[] {
  const normalized = normalizeRiskMatrixHex(color);
  const base = resolveEffectiveCustomAxisLevelColors({
    stored,
    systemFallback,
  });
  if (!normalized || base.length !== 5) {
    return acceptStoredCustomAxisLevelColors(stored);
  }

  return acceptStoredCustomAxisLevelColors(
    base.map((item) => (item.value === value ? { ...item, color: normalized } : item)),
  );
}

export function resetCustomAxisLevelColors(): CustomAxisLevelColor[] {
  return [];
}

export function toCustomAxisLevelColorByValue(
  colors: CustomAxisLevelColor[],
): Partial<Record<number, string>> {
  const next: Partial<Record<number, string>> = {};
  for (const item of colors) {
    next[item.value] = item.color;
  }
  return next;
}

export function toCustomAxisLevelColorsPayload(
  stored?: Array<{ value?: number; color?: string }> | null,
): CustomAxisLevelColor[] {
  return acceptStoredCustomAxisLevelColors(stored);
}
