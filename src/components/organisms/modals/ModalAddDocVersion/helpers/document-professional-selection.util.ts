import { ProfessionalTypeEnum } from 'project/enum/professional-type.enum';

import { IProfessional, IProfessionalCouncil } from 'core/interfaces/api/IProfessional';

/**
 * Semantic fields for document responsible selection.
 *
 * - personProfessionalId: Professional.id (UI grouping / identity)
 * - persistenceCouncilId: ProfessionalCouncil.id (legacy FK in
 *   _DocumentDataToProfessional.professionalId)
 *
 * NEVER send personProfessionalId in the legacy professionalId payload field.
 */
export type DocumentProfessionalSelectionMeta = {
  personProfessionalId: number;
  persistenceCouncilId: number | null;
};

const PREFERRED_COUNCIL_BY_TYPE: Partial<Record<ProfessionalTypeEnum, string>> =
  {
    [ProfessionalTypeEnum.DOCTOR]: 'CRM',
    [ProfessionalTypeEnum.ENGINEER]: 'CREA',
    [ProfessionalTypeEnum.NURSE]: 'COREN',
    [ProfessionalTypeEnum.SPEECH_THERAPIST]: 'CREFONO',
  };

export const preferredCouncilTypeForProfessional = (
  type?: ProfessionalTypeEnum | string | null,
): string | undefined => {
  if (!type) return undefined;
  return PREFERRED_COUNCIL_BY_TYPE[type as ProfessionalTypeEnum];
};

export const formatCouncilCredential = (council?: {
  councilType?: string | null;
  councilUF?: string | null;
  councilId?: string | null;
}): string => {
  if (!council) return '';
  const type = String(council.councilType || '').trim();
  const uf = String(council.councilUF || '').trim();
  const id = String(council.councilId || '').trim();
  if (!id && !type) return '';
  if (type && uf && id) return `${type}-${uf} ${id}`;
  if (type && id) return `${type}: ${id}`;
  return id || type;
};

export const summarizeCouncils = (
  councils?: Array<{
    councilType?: string | null;
    councilUF?: string | null;
    councilId?: string | null;
  }> | null,
): string => {
  const formatted = (councils || [])
    .map((c) => formatCouncilCredential(c))
    .filter(Boolean);
  if (!formatted.length) return '-';
  if (formatted.length === 1) return formatted[0];
  return `${formatted[0]} +${formatted.length - 1}`;
};

/**
 * True when the row comes from byCouncil / document hydration:
 * row.id is ProfessionalCouncil.id and professionalId is Professional.id.
 */
export const isCouncilShapedProfessional = (
  professional?: IProfessional | null,
): boolean => {
  if (!professional) return false;
  if (professional.councils?.length) return false;
  if (
    professional.professionalId != null &&
    professional.id !== professional.professionalId
  ) {
    return true;
  }
  return (
    !!professional.councilType &&
    professional.professionalId != null &&
    professional.id !== professional.professionalId
  );
};

/** Professional.id — person identity for UI grouping. */
export const getPersonProfessionalId = (
  professional: IProfessional,
): number => {
  if (isCouncilShapedProfessional(professional)) {
    return professional.professionalId as number;
  }
  return professional.id;
};

/**
 * Resolve ProfessionalCouncil.id for legacy persistence.
 * Returns null when no safe council id exists — NEVER falls back to person id.
 */
export const resolvePersistenceCouncilId = (
  professional: IProfessional,
  options?: { preferredCouncilId?: number | null },
): number | null => {
  const personId = getPersonProfessionalId(professional);

  const isSafeCouncilId = (candidate?: number | null): candidate is number =>
    candidate != null && Number.isFinite(candidate) && candidate !== personId;

  if (isCouncilShapedProfessional(professional)) {
    // row.id is the council id; keep it when it is not the person id.
    if (isSafeCouncilId(professional.id)) return professional.id;
  }

  const councils = professional.councils || [];

  const preferred =
    options?.preferredCouncilId ??
    professional.professionalDocumentDataSignature?.professionalId;

  if (isSafeCouncilId(preferred)) {
    if (!councils.length) return preferred;
    const linked = councils.find((c) => c.id === preferred);
    if (linked) return linked.id;
    // Preferred legacy id not in current councils list — still honor it
    // (document was saved with that council; list may be incomplete).
    return preferred;
  }

  if (!councils.length) return null;

  const preferredType = preferredCouncilTypeForProfessional(professional.type);
  const withRegistry = councils.filter((c) => String(c.councilId || '').trim());

  if (preferredType) {
    const match = withRegistry.find(
      (c) =>
        String(c.councilType || '').trim().toUpperCase() ===
        preferredType.toUpperCase(),
    );
    if (match && isSafeCouncilId(match.id)) return match.id;
  }

  const first = withRegistry[0] || councils[0];
  return isSafeCouncilId(first?.id) ? first.id : null;
};

/** @deprecated use resolvePersistenceCouncilId — kept for call-site migration */
export const resolvePrimaryCouncilId = (
  professional: IProfessional,
  options?: { preferredCouncilId?: number | null },
): number | undefined => {
  return resolvePersistenceCouncilId(professional, options) ?? undefined;
};

/**
 * Build a person-shaped selection row with explicit persistence council id
 * stored only in professionalDocumentDataSignature.professionalId (legacy field).
 */
export const toDocumentProfessionalSelection = (
  row: IProfessional,
  options?: {
    preferredCouncilId?: number | null;
    isSigner?: boolean;
    isElaborator?: boolean;
  },
): IProfessional => {
  const personId = getPersonProfessionalId(row);

  const councilFromRow: IProfessionalCouncil | null = isCouncilShapedProfessional(
    row,
  )
    ? ({
        id: row.id,
        councilType: row.councilType || '',
        councilUF: row.councilUF || '',
        councilId: row.councilId || '',
        created_at: row.created_at,
        updated_at: row.updated_at,
        professionalId: personId,
        professional: row,
      } as IProfessionalCouncil)
    : null;

  const councils =
    row.councils?.length
      ? row.councils
      : councilFromRow
        ? [councilFromRow]
        : [];

  const existingLinked =
    options?.preferredCouncilId ??
    row.professionalDocumentDataSignature?.professionalId ??
    councilFromRow?.id ??
    null;

  const persistenceCouncilId = resolvePersistenceCouncilId(
    {
      ...row,
      id: personId,
      councils,
      professionalId: personId,
      councilType: undefined,
      councilUF: undefined,
      councilId: undefined,
    },
    { preferredCouncilId: existingLinked },
  );

  return {
    ...row,
    id: personId,
    // Keep person id here for UI identity ONLY — never use as legacy FK.
    professionalId: personId,
    councils,
    councilType: undefined,
    councilUF: undefined,
    councilId: undefined,
    professionalDocumentDataSignature: {
      documentDataId:
        row.professionalDocumentDataSignature?.documentDataId || '',
      // Legacy contract: this field stores ProfessionalCouncil.id
      professionalId: persistenceCouncilId as number,
      isSigner:
        options?.isSigner ??
        row.professionalDocumentDataSignature?.isSigner ??
        false,
      isElaborator:
        options?.isElaborator ??
        row.professionalDocumentDataSignature?.isElaborator ??
        false,
    },
  };
};

/**
 * Normalize document professionals to one row per Professional.id.
 * Preserves linked council id when present; never invents person id as council.
 */
export const groupProfessionalsForDocumentSelection = (
  professionals: IProfessional[] = [],
): IProfessional[] => {
  const map = new Map<number, IProfessional>();

  for (const row of professionals) {
    const personId = getPersonProfessionalId(row);
    const existing = map.get(personId);

    const next = toDocumentProfessionalSelection(row, {
      preferredCouncilId:
        row.professionalDocumentDataSignature?.professionalId ??
        (isCouncilShapedProfessional(row) ? row.id : null),
      isSigner: row.professionalDocumentDataSignature?.isSigner,
      isElaborator: row.professionalDocumentDataSignature?.isElaborator,
    });

    if (!existing) {
      map.set(personId, next);
      continue;
    }

    const mergedCouncils = [...(existing.councils || [])];
    for (const c of next.councils || []) {
      if (!mergedCouncils.some((x) => x.id === c.id)) mergedCouncils.push(c);
    }

    const preferredCouncilId =
      // Prefer previously linked council (from existing document state)
      (existing.professionalDocumentDataSignature?.professionalId !== personId
        ? existing.professionalDocumentDataSignature?.professionalId
        : null) ??
      (next.professionalDocumentDataSignature?.professionalId !== personId
        ? next.professionalDocumentDataSignature?.professionalId
        : null) ??
      null;

    const merged = toDocumentProfessionalSelection(
      {
        ...existing,
        ...next,
        id: personId,
        councils: mergedCouncils,
        formation: next.formation?.length ? next.formation : existing.formation,
        certifications: next.certifications?.length
          ? next.certifications
          : existing.certifications,
      },
      {
        preferredCouncilId,
        isSigner: !!(
          existing.professionalDocumentDataSignature?.isSigner ||
          next.professionalDocumentDataSignature?.isSigner
        ),
        isElaborator: !!(
          existing.professionalDocumentDataSignature?.isElaborator ||
          next.professionalDocumentDataSignature?.isElaborator
        ),
      },
    );

    map.set(personId, merged);
  }

  return Array.from(map.values());
};

/**
 * Resolve council id for _DocumentDataToProfessional.professionalId.
 * Throws if no valid council — caller must not persist person ids.
 */
export const resolveLegacyCouncilIdForDocument = (
  professional: IProfessional,
): number => {
  const councilId = resolvePersistenceCouncilId(professional, {
    preferredCouncilId:
      professional.professionalDocumentDataSignature?.professionalId,
  });

  if (councilId == null) {
    throw new Error(
      `Profissional "${professional.name}" (Professional.id=${getPersonProfessionalId(
        professional,
      )}) não possui ProfessionalCouncil.id válido para persistência legada.`,
    );
  }

  return councilId;
};

/** Normalize professionals when hydrating document modal state from API. */
export const withGroupedDocumentProfessionals = <
  T extends { professionals?: IProfessional[] },
>(
  data: T,
): T => ({
  ...data,
  professionals: groupProfessionalsForDocumentSelection(
    data.professionals || [],
  ),
});

export const formatProfessionalSelectionSummary = (
  professional: IProfessional,
): string => {
  const typeLabel = String(professional.type || '').trim();
  const councils = summarizeCouncils(
    professional.councils?.length
      ? professional.councils
      : [
          {
            councilType: professional.councilType,
            councilUF: professional.councilUF,
            councilId: professional.councilId,
          },
        ],
  );
  const certifications = (professional.certifications || [])
    .map((c) => String(c || '').trim())
    .filter(Boolean)
    .join(' · ');

  return [professional.name, typeLabel, councils !== '-' ? councils : '', certifications]
    .filter(Boolean)
    .join('\n');
};

/** Build legacy persistence DTOs — never emits person id as professionalId. */
export const toDocumentProfessionalsPersistencePayload = (
  professionals: IProfessional[],
): Array<{
  professionalId: number;
  isSigner?: boolean;
  isElaborator?: boolean;
}> => {
  const people = groupProfessionalsForDocumentSelection(professionals || []);

  return people.map((person) => {
    const persistenceCouncilId = resolveLegacyCouncilIdForDocument(person);
    const personId = getPersonProfessionalId(person);

    if (persistenceCouncilId === personId) {
      throw new Error(
        `Integridade: tentativa de persistir Professional.id=${personId} (${person.name}) como ProfessionalCouncil.id.`,
      );
    }

    return {
      professionalId: persistenceCouncilId,
      isSigner: person.professionalDocumentDataSignature?.isSigner,
      isElaborator: person.professionalDocumentDataSignature?.isElaborator,
    };
  });
};

/** Debug/audit helper for smoke — do not use in UI. */
export const describeDocumentProfessionalPersistence = (
  professional: IProfessional,
): {
  name: string;
  personProfessionalId: number;
  persistenceCouncilId: number | null;
  signatureField: number | undefined;
} => ({
  name: professional.name,
  personProfessionalId: getPersonProfessionalId(professional),
  persistenceCouncilId: resolvePersistenceCouncilId(professional, {
    preferredCouncilId:
      professional.professionalDocumentDataSignature?.professionalId,
  }),
  signatureField:
    professional.professionalDocumentDataSignature?.professionalId,
});
