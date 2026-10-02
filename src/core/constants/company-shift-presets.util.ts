import {
  COMPANY_SHIFT_PRESETS,
  CompanyShiftPreset,
} from './company-shift-presets.constant';

export function findCompanyShiftPreset(
  id: string | null | undefined,
): CompanyShiftPreset | undefined {
  if (!id) return undefined;
  return COMPANY_SHIFT_PRESETS.find((preset) => preset.id === id);
}

/** Normaliza duração para comparação (vazio / null / undefined = jornada não estruturada). */
export function normalizeDurationMinutes(
  value: number | null | undefined,
): number | null {
  if (value == null) return null;
  return value;
}

/** True somente quando a duração efetiva mudou (inclui estruturada ↔ não estruturada). */
export function didCompanyShiftDurationChange(
  original: number | null | undefined,
  next: number | null | undefined,
): boolean {
  return normalizeDurationMinutes(original) !== normalizeDurationMinutes(next);
}

export function durationMinutesFromInput(
  value: string,
): number | null | undefined {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (!/^[1-9]\d*$/.test(trimmed)) return undefined;
  return Number(trimmed);
}
