/** Existing consumers still accept legacy DateTime-backed dates. */
export interface LegacyPeriodDates {
  startDate?: Date | null;
  endDate?: Date | null;
}

export interface StartEndDateDraft {
  startDate: string;
  endDate: string;
  startDateValid: boolean;
  endDateValid: boolean;
  startDateChanged: boolean;
  endDateChanged: boolean;
}

type PeriodDateErrors = {
  startDate?: string;
  endDate?: string;
  order?: string;
};

function isCivilDay(value: string): boolean {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!match) return false;
  const [, yearText, monthText, dayText] = match;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);
  const leap = year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
  const monthDays = [
    31,
    leap ? 29 : 28,
    31,
    30,
    31,
    30,
    31,
    31,
    30,
    31,
    30,
    31,
  ];
  return (
    year >= 1 &&
    year <= 9999 &&
    month >= 1 &&
    month <= 12 &&
    day >= 1 &&
    day <= monthDays[month - 1]
  );
}

/** Decode only the existing storage boundary, never a browser-local selection.
 * Operational DateTimes are composed by their stored UTC civil day. */
function storedCivilDay(value?: Date | null): string {
  if (value == null) return '';
  if (!(value instanceof Date) || Number.isNaN(value.getTime()))
    return 'Data inválida';
  const day = [
    String(value.getUTCFullYear()).padStart(4, '0'),
    String(value.getUTCMonth() + 1).padStart(2, '0'),
    String(value.getUTCDate()).padStart(2, '0'),
  ].join('-');
  return isCivilDay(day) ? day : 'Data inválida';
}

export function createStartEndDateDraft(
  options: LegacyPeriodDates = {},
): StartEndDateDraft {
  const startDate = storedCivilDay(options.startDate);
  const endDate = storedCivilDay(options.endDate);
  return {
    startDate,
    endDate,
    startDateValid: !startDate || isCivilDay(startDate),
    endDateValid: !endDate || isCivilDay(endDate),
    startDateChanged: false,
    endDateChanged: false,
  };
}

/** ISO days are compared directly. Equal boundaries describe an empty period;
 * both dates stay optional in existing pre-declaration workflows. */
export function validateStartEndDates(
  draft: StartEndDateDraft,
): PeriodDateErrors {
  const errors: PeriodDateErrors = {};
  if (
    !draft.startDateValid ||
    (draft.startDate && !isCivilDay(draft.startDate))
  )
    errors.startDate =
      'Informe uma data de início válida no formato DD/MM/AAAA.';
  if (!draft.endDateValid || (draft.endDate && !isCivilDay(draft.endDate)))
    errors.endDate = 'Informe uma data válida no formato DD/MM/AAAA.';
  if (
    !errors.startDate &&
    !errors.endDate &&
    draft.startDate &&
    draft.endDate &&
    draft.startDate >= draft.endDate
  )
    errors.order =
      '“Válido antes de” deve ser posterior à data de início, pois esse dia não integra o período.';
  return errors;
}

/** Compatibility bridge only at the legacy callback, after civil validation.
 * Selection/comparison remain ISO days. Output is the UTC00 DateTime expected
 * by existing API consumers, avoiding a shift in positive browser timezones.
 * No UTC conversion/toISOString() chooses or compares the selected day. */
function legacyDateTime(day: string): Date {
  const [year, month, date] = day.split('-').map(Number);
  const result = new Date(0);
  result.setUTCFullYear(year, month - 1, date);
  result.setUTCHours(0, 0, 0, 0);
  return result;
}

export function resolveStartEndDates(
  draft: StartEndDateDraft,
  original: LegacyPeriodDates = {},
): LegacyPeriodDates {
  if (Object.values(validateStartEndDates(draft)).some(Boolean))
    throw new RangeError('Corrija as datas do período antes de confirmar.');
  const resolve = (field: 'startDate' | 'endDate') => {
    const day = draft[field];
    if (!draft[`${field}Changed`] || day === storedCivilDay(original[field]))
      return original[field];
    return day ? legacyDateTime(day) : null;
  };
  return { startDate: resolve('startDate'), endDate: resolve('endDate') };
}
