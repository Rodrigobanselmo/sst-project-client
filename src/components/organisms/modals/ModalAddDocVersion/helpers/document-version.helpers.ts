import { DocumentTypeEnum } from 'project/enum/document.enums';

export const normalizeDocumentVersion = (version?: string | null): string =>
  (version ?? '').replace('+ ', '').trim();

/**
 * Tipos com conversão teste → oficial habilitada na UI.
 * PCMSO: pipeline de geração com erro pré-existente (demanda separada).
 * LTCAT: ainda sem modelo/documento para homologação.
 */
export const DOCUMENT_TYPES_WITH_PROMOTE_TO_OFFICIAL: DocumentTypeEnum[] = [
  DocumentTypeEnum.PGR,
  DocumentTypeEnum.PERICULOSIDADE,
  DocumentTypeEnum.INSALUBRIDADE,
  DocumentTypeEnum.FRPS,
];

export function isPromoteToOfficialEnabledForDocumentType(
  type: DocumentTypeEnum,
): boolean {
  return DOCUMENT_TYPES_WITH_PROMOTE_TO_OFFICIAL.includes(type);
}

/** Versão de teste / não oficial: 0.0.N */
export function isUnofficialDocumentVersion(version: string): boolean {
  const normalized = normalizeDocumentVersion(version);
  return /^0\.0\.\d+$/.test(normalized);
}

/** Versão oficial / controlada: N.0.0 com N >= 1 */
export function isOfficialDocumentVersion(version: string): boolean {
  const normalized = normalizeDocumentVersion(version);
  return /^[1-9]\d*\.0\.0$/.test(normalized);
}

/** Alias legado — preferir isOfficialDocumentVersion */
export const isRevisionControlledDocumentVersion = isOfficialDocumentVersion;

export type DocumentVersionSeriesRow = {
  version: string;
  officialRevisionSeries?: number | null;
};

export function resolveOfficialRevisionSeries(
  series: number | null | undefined,
): number {
  return series ?? 1;
}

export function filterUnofficialVersions<
  T extends { version: string },
>(versions: T[]): T[] {
  return versions.filter((item) =>
    isUnofficialDocumentVersion(item.version),
  );
}

export function filterOfficialVersions<T extends { version: string }>(
  versions: T[],
): T[] {
  return versions.filter((item) => isOfficialDocumentVersion(item.version));
}

export function filterOfficialVersionsBySeries<
  T extends DocumentVersionSeriesRow,
>(versions: T[], activeOfficialSeries: number): T[] {
  return filterOfficialVersions(versions).filter(
    (item) =>
      resolveOfficialRevisionSeries(item.officialRevisionSeries) ===
      activeOfficialSeries,
  );
}

/** Alias legado — preferir filterOfficialVersions */
export const filterRevisionControlledVersions = filterOfficialVersions;

export function getUnofficialVersionPatch(version: string): number {
  const normalized = normalizeDocumentVersion(version);
  const match = normalized.match(/^0\.0\.(\d+)$/);
  return match ? Number(match[1]) : -1;
}

export function getOfficialVersionMajor(version: string): number {
  const normalized = normalizeDocumentVersion(version);
  const match = normalized.match(/^([1-9]\d*)\.0\.0$/);
  return match ? Number(match[1]) : -1;
}

/** Mapeia versão de teste 0.0.N para oficial (N+1).0.0 (REV. equivalente). */
export function getOfficialVersionFromUnofficial(version: string): string | null {
  const patch = getUnofficialVersionPatch(version);
  if (patch < 0) return null;
  return `${patch + 1}.0.0`;
}

export type PromoteTestToOfficialValidation =
  | { allowed: true; targetOfficialVersion: string }
  | { allowed: false; reason: string };

export function validatePromoteTestToOfficial(
  testVersion: string,
  activeOfficialVersions: DocumentVersionSeriesRow[],
): PromoteTestToOfficialValidation {
  const targetOfficialVersion = getOfficialVersionFromUnofficial(testVersion);

  if (!targetOfficialVersion) {
    return { allowed: false, reason: 'Versão de teste inválida para conversão.' };
  }

  const targetMajor = getOfficialVersionMajor(targetOfficialVersion);
  const existingMajors = new Set(
    activeOfficialVersions.map((version) =>
      getOfficialVersionMajor(version.version),
    ),
  );

  if (existingMajors.has(targetMajor)) {
    return {
      allowed: false,
      reason: `Já existe uma versão oficial ${formatRevisionDisplayLabel(targetOfficialVersion)}.`,
    };
  }

  for (let major = 1; major < targetMajor; major++) {
    if (!existingMajors.has(major)) {
      return {
        allowed: false,
        reason: `Para converter para ${formatRevisionDisplayLabel(targetOfficialVersion)}, é necessário que ${formatRevisionDisplayLabel(`${major}.0.0`)} oficial já exista.`,
      };
    }
  }

  return { allowed: true, targetOfficialVersion };
}

export function getNextUnofficialVersion(
  versions: { version: string }[],
): string {
  const unofficial = filterUnofficialVersions(versions);
  if (unofficial.length === 0) return '0.0.0';

  const maxPatch = Math.max(
    ...unofficial.map((v) => getUnofficialVersionPatch(v.version)),
  );

  return `0.0.${maxPatch + 1}`;
}

export function getNextOfficialVersion(
  versions: DocumentVersionSeriesRow[],
  activeOfficialSeries = 1,
): string {
  const official = filterOfficialVersionsBySeries(
    versions,
    activeOfficialSeries,
  );

  if (official.length === 0) return '1.0.0';

  const maxMajor = Math.max(
    ...official.map((v) => getOfficialVersionMajor(v.version)),
  );

  return `${maxMajor + 1}.0.0`;
}

/** Número sequencial exibido no DOCX (01, 02, 03…). */
export function formatRevisionDisplayNumber(version: string): string {
  const normalized = normalizeDocumentVersion(version);

  if (isUnofficialDocumentVersion(normalized)) {
    return String(getUnofficialVersionPatch(normalized) + 1).padStart(2, '0');
  }

  if (isOfficialDocumentVersion(normalized)) {
    return String(getOfficialVersionMajor(normalized)).padStart(2, '0');
  }

  return normalized;
}

/** Rótulo amigável exibido ao usuário (REV. 01, REV. 02…). */
export function formatRevisionDisplayLabel(version?: string | null): string {
  const normalized = normalizeDocumentVersion(version);
  if (!normalized) return 'REV. 01';
  return `REV. ${formatRevisionDisplayNumber(normalized)}`;
}

export type DocumentVersionFamilyLabel = 'Teste' | 'Oficial';

/** Rótulo da família da versão para exibição em listagens. */
export function getDocumentVersionFamilyLabel(
  version: string,
): DocumentVersionFamilyLabel | '--' {
  if (isUnofficialDocumentVersion(version)) return 'Teste';
  if (isOfficialDocumentVersion(version)) return 'Oficial';
  return '--';
}

export type DocumentVersionEmissionSource = {
  documentDate?: string | Date | null;
  created_at: string | Date;
};

export function resolveVersionEmissionDate(
  source: DocumentVersionEmissionSource,
): Date {
  if (source.documentDate) return new Date(source.documentDate);
  return new Date(source.created_at);
}

const sameCalendarDay = (a: Date, b: Date): boolean =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

/** Serializa data do formulário para ISO (API / fila). */
export function serializeDocumentDate(value: unknown): string | undefined {
  if (!value) return undefined;

  const date = value instanceof Date ? value : new Date(value as string);
  if (Number.isNaN(date.getTime())) return undefined;

  return date.toISOString();
}

/** Resolve data de emissão: formulário ativo ou estado do modal (wizard desmonta o passo 1). */
export function resolveDocumentDateFromForm(
  formValue: unknown,
  storedValue?: string | Date | null,
): string | undefined {
  return serializeDocumentDate(formValue) ?? serializeDocumentDate(storedValue);
}

export type DocumentVersionWithEmission = DocumentVersionEmissionSource & {
  version: string;
};

/**
 * Alerta somente quando já existe revisão oficial anterior
 * e a data informada difere da última emissão oficial.
 */
export function shouldWarnRevisionDateChange(
  targetVersion: string,
  emissionDateIso: string | undefined,
  previousVersions: DocumentVersionWithEmission[],
  activeOfficialSeries = 1,
): boolean {
  if (!isOfficialDocumentVersion(targetVersion) || !emissionDateIso) {
    return false;
  }

  const official = filterOfficialVersionsBySeries(
    previousVersions.map((version) => ({
      ...version,
      officialRevisionSeries:
        'officialRevisionSeries' in version
          ? (version as DocumentVersionSeriesRow).officialRevisionSeries
          : activeOfficialSeries,
    })),
    activeOfficialSeries,
  );

  if (official.length === 0) return false;

  const lastOfficial = [...official].sort(
    (a, b) =>
      resolveVersionEmissionDate(b).getTime() -
      resolveVersionEmissionDate(a).getTime(),
  )[0];

  const newEmission = new Date(emissionDateIso);
  if (Number.isNaN(newEmission.getTime())) return false;

  return !sameCalendarDay(
    resolveVersionEmissionDate(lastOfficial),
    newEmission,
  );
}
