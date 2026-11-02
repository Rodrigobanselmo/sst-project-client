import dayjs, { type Dayjs } from 'dayjs';

/** A civil day has no offset: never pass these values through toISOString(). */
export function civilDateValue(value: string): Dayjs | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const date = dayjs(value).year(Number(value.slice(0, 4)));
  return date.isValid() && date.format('YYYY-MM-DD') === value ? date : null;
}

export function civilDateIso(value: Dayjs | null, invalid = false): string {
  if (invalid || !value?.isValid()) return '';
  const iso = value.format('YYYY-MM-DD');
  return civilDateValue(iso) ? iso : '';
}

export function civilDateDisplay(value: string): string {
  return civilDateValue(value)?.format('DD/MM/YYYY') || value;
}

/** Clinical history stores a civil exam day in a legacy DateTime column (the
 * appointment time is separate). Match the S-2220 source mapper's frozen UTC
 * day, then handle it as a civil date. Never apply this adapter to audit times,
 * appointments or generic timestamps. It changes presentation only. */
export function clinicalHistoryCivilDate(
  value?: string | Date | null,
): Dayjs | null {
  return storedCivilDate(value);
}

/** Assessment periods are also mapped by their UTC civil day. Keep the stored
 * end boundary exact: callers must label its exclusion instead of silently
 * subtracting a day from dates entered in the legacy period form. */
export function assessmentPeriodCivilDate(
  value?: string | Date | null,
): Dayjs | null {
  return storedCivilDate(value);
}

function storedCivilDate(value?: string | Date | null): Dayjs | null {
  if (!value) return null;
  const stored = value instanceof Date ? value : new Date(value);
  return Number.isNaN(stored.getTime())
    ? null
    : civilDateValue(stored.toISOString().slice(0, 10));
}

export function civilDateInput(raw: string) {
  // Insert separators for the numeric mobile keyboard, without guessing a
  // different day/month order or repairing an impossible or partial date.
  const text = /^\d{0,8}$/.test(raw)
    ? [raw.slice(0, 2), raw.slice(2, 4), raw.slice(4)].filter(Boolean).join('/')
    : /^\d{2}\/\d{3,6}$/.test(raw)
      ? `${raw.slice(0, 5)}/${raw.slice(5)}`
      : raw;
  const match = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(text);
  const candidate = match ? `${match[3]}-${match[2]}-${match[1]}` : '';
  const iso = civilDateValue(candidate) ? candidate : '';
  return { text, iso, invalid: !!text && !iso };
}

/** Only the calendar's rendered year list is bounded; typed dates stay exact. */
export function civilCalendarYears(value: Dayjs | null, today = dayjs()) {
  const year = value?.isValid() ? value.year() : today.year();
  return {
    minYear: Math.max(1, year - 100),
    maxYear: Math.min(9999, year + 100),
  };
}
