import dayjs from 'dayjs';

import {
  filterOfficialVersionsBySeries,
  filterUnofficialVersions,
  getNextOfficialVersion,
  getNextUnofficialVersion,
  getOfficialVersionMajor,
  getUnofficialVersionPatch,
} from './document-version.helpers';

export type DocumentVersionFamily = 'test' | 'official';

export const DOCUMENT_VERSION_FAMILY_OPTIONS = [
  { value: 'test', label: 'Documento de teste' },
  { value: 'official', label: 'Documento oficial' },
] as const;

export const EMISSION_BEFORE_CREATION_MESSAGE =
  'A data de emissão não pode ser anterior à data de criação do documento.';

export const CREATION_DATE_LOCKED_MESSAGE =
  'Para alterar a Data de Criação desta série documental, é necessário realizar o Reset da série e iniciar uma nova sequência de versões.';

const startOfCalendarDay = (value: Date | string): Date =>
  dayjs(value).startOf('day').toDate();

export function computeValidityEnd(
  creationDate: Date,
  years: number,
  months: number,
): Date {
  return dayjs(creationDate)
    .add(years, 'year')
    .add(months, 'month')
    .startOf('day')
    .toDate();
}

export function deriveValidityPeriod(
  documentData?: {
    validityStart?: Date | string | null;
    validityEnd?: Date | string | null;
    validityYears?: number | null;
    validityMonths?: number | null;
  } | null,
): { years: number; months: number } {
  if (
    documentData?.validityYears != null &&
    documentData?.validityMonths != null
  ) {
    return {
      years: documentData.validityYears,
      months: documentData.validityMonths,
    };
  }

  if (documentData?.validityStart && documentData?.validityEnd) {
    const start = dayjs(documentData.validityStart).startOf('day');
    const end = dayjs(documentData.validityEnd).startOf('day');
    const years = end.diff(start, 'year');
    const months = end.subtract(years, 'year').diff(start, 'month');

    return {
      years: Math.max(0, years),
      months: Math.max(0, months),
    };
  }

  return { years: 2, months: 0 };
}

export type DocumentVersionCreationSource = {
  version: string;
  documentCreatedAt?: string | Date | null;
  officialRevisionSeries?: number | null;
};

export function getFirstVersionInFamilySeries(
  family: DocumentVersionFamily,
  versions: DocumentVersionCreationSource[],
  activeOfficialSeries: number,
): DocumentVersionCreationSource | null {
  if (family === 'test') {
    const unofficial = filterUnofficialVersions(versions);
    if (unofficial.length === 0) return null;

    return [...unofficial].sort(
      (a, b) =>
        getUnofficialVersionPatch(a.version) -
        getUnofficialVersionPatch(b.version),
    )[0];
  }

  const official = filterOfficialVersionsBySeries(
    versions,
    activeOfficialSeries,
  );
  if (official.length === 0) return null;

  return [...official].sort(
    (a, b) =>
      getOfficialVersionMajor(a.version) - getOfficialVersionMajor(b.version),
  )[0];
}

export function isSeriesCreationDateLocked(
  family: DocumentVersionFamily,
  versions: DocumentVersionCreationSource[],
  activeOfficialSeries: number,
): boolean {
  return getFirstVersionInFamilySeries(family, versions, activeOfficialSeries) !== null;
}

/** @deprecated Preferir isSeriesCreationDateLocked */
export const isOfficialCreationDateLocked = isSeriesCreationDateLocked;

/** Data de emissão sugerida ao abrir o modal de nova versão. */
export function resolveSuggestedEmissionDate(
  seriesCreationLocked: boolean,
  suggestedCreationDate: Date,
): Date {
  if (!seriesCreationLocked) {
    return suggestedCreationDate;
  }

  return startOfCalendarDay(new Date());
}

export function resolveSuggestedCreationDate(
  family: DocumentVersionFamily,
  versions: DocumentVersionCreationSource[],
  documentData:
    | { validityStart?: Date | string | null }
    | null
    | undefined,
  activeOfficialSeries: number,
): Date {
  const firstVersion = getFirstVersionInFamilySeries(
    family,
    versions,
    activeOfficialSeries,
  );

  if (!firstVersion) {
    return startOfCalendarDay(new Date());
  }

  if (firstVersion.documentCreatedAt) {
    return startOfCalendarDay(firstVersion.documentCreatedAt);
  }

  if (documentData?.validityStart) {
    return startOfCalendarDay(documentData.validityStart);
  }

  return startOfCalendarDay(new Date());
}

export function hasCreationDateChanged(
  lockedDate: Date | string,
  currentDate: Date | string,
): boolean {
  return !dayjs(currentDate)
    .startOf('day')
    .isSame(dayjs(lockedDate).startOf('day'));
}

export function isEmissionBeforeCreation(
  creationDate: Date | string | null | undefined,
  emissionDate: Date | string | null | undefined,
): boolean {
  if (!creationDate || !emissionDate) return false;

  return dayjs(emissionDate)
    .startOf('day')
    .isBefore(dayjs(creationDate).startOf('day'));
}

export function formatValidityRangePreview(
  creationDate: Date | string | null | undefined,
  years: number | null | undefined,
  months: number | null | undefined,
): string {
  if (!creationDate) return '';

  const safeYears = years ?? 0;
  const safeMonths = months ?? 0;
  const start = dayjs(creationDate).format('DD/MM/YYYY');
  const end = dayjs(
    computeValidityEnd(new Date(creationDate), safeYears, safeMonths),
  ).format('DD/MM/YYYY');

  return `${start} a ${end}`;
}

export function resolveVersionForFamily(
  family: DocumentVersionFamily,
  versions: DocumentVersionCreationSource[],
  activeOfficialSeries: number,
): string {
  return family === 'official'
    ? getNextOfficialVersion(versions, activeOfficialSeries)
    : getNextUnofficialVersion(versions);
}
