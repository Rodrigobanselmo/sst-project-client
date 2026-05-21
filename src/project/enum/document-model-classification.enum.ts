export enum DocumentModelClassificationEnum {
  GRO_PGR = 'GRO_PGR',
  SOMENTE_PGR = 'SOMENTE_PGR',
  COM_FRPS = 'COM_FRPS',
  SEM_FRPS = 'SEM_FRPS',
  COPSOQ_III = 'COPSOQ_III',
  NAO_COPSOQ_III = 'NAO_COPSOQ_III',
  NR18 = 'NR18',
  TERCEIROS = 'TERCEIROS',
  SIMPLIFICADO = 'SIMPLIFICADO',
  BACKUP = 'BACKUP',
}

export const documentModelClassificationMap: Record<
  DocumentModelClassificationEnum,
  { value: DocumentModelClassificationEnum; label: string; shortLabel: string }
> = {
  [DocumentModelClassificationEnum.GRO_PGR]: {
    value: DocumentModelClassificationEnum.GRO_PGR,
    label: 'GRO/PGR',
    shortLabel: 'GRO/PGR',
  },
  [DocumentModelClassificationEnum.SOMENTE_PGR]: {
    value: DocumentModelClassificationEnum.SOMENTE_PGR,
    label: 'Somente PGR',
    shortLabel: 'Somente PGR',
  },
  [DocumentModelClassificationEnum.COM_FRPS]: {
    value: DocumentModelClassificationEnum.COM_FRPS,
    label: 'Com FRPS',
    shortLabel: 'Com FRPS',
  },
  [DocumentModelClassificationEnum.SEM_FRPS]: {
    value: DocumentModelClassificationEnum.SEM_FRPS,
    label: 'Sem FRPS',
    shortLabel: 'Sem FRPS',
  },
  [DocumentModelClassificationEnum.COPSOQ_III]: {
    value: DocumentModelClassificationEnum.COPSOQ_III,
    label: 'COPSOQ III',
    shortLabel: 'COPSOQ III',
  },
  [DocumentModelClassificationEnum.NAO_COPSOQ_III]: {
    value: DocumentModelClassificationEnum.NAO_COPSOQ_III,
    label: 'Não COPSOQ III',
    shortLabel: 'Não COPSOQ',
  },
  [DocumentModelClassificationEnum.NR18]: {
    value: DocumentModelClassificationEnum.NR18,
    label: 'NR18',
    shortLabel: 'NR18',
  },
  [DocumentModelClassificationEnum.TERCEIROS]: {
    value: DocumentModelClassificationEnum.TERCEIROS,
    label: 'Terceiros',
    shortLabel: 'Terceiros',
  },
  [DocumentModelClassificationEnum.SIMPLIFICADO]: {
    value: DocumentModelClassificationEnum.SIMPLIFICADO,
    label: 'Simplificado',
    shortLabel: 'Simplificado',
  },
  [DocumentModelClassificationEnum.BACKUP]: {
    value: DocumentModelClassificationEnum.BACKUP,
    label: 'Backup',
    shortLabel: 'Backup',
  },
};

export const documentModelClassificationList = Object.values(
  documentModelClassificationMap,
);

const MUTUALLY_EXCLUSIVE: Partial<
  Record<DocumentModelClassificationEnum, DocumentModelClassificationEnum>
> = {
  [DocumentModelClassificationEnum.GRO_PGR]: DocumentModelClassificationEnum.SOMENTE_PGR,
  [DocumentModelClassificationEnum.SOMENTE_PGR]: DocumentModelClassificationEnum.GRO_PGR,
  [DocumentModelClassificationEnum.COM_FRPS]: DocumentModelClassificationEnum.SEM_FRPS,
  [DocumentModelClassificationEnum.SEM_FRPS]: DocumentModelClassificationEnum.COM_FRPS,
  [DocumentModelClassificationEnum.COPSOQ_III]: DocumentModelClassificationEnum.NAO_COPSOQ_III,
  [DocumentModelClassificationEnum.NAO_COPSOQ_III]: DocumentModelClassificationEnum.COPSOQ_III,
};

/** Alterna um filtro na lista ativa (uso nos chips da listagem PGR). */
export function toggleDocumentModelClassificationFilter(
  active: DocumentModelClassificationEnum[],
  value: DocumentModelClassificationEnum,
): DocumentModelClassificationEnum[] {
  if (active.includes(value)) {
    return active.filter((item) => item !== value);
  }
  return [...active, value];
}

const MUTUALLY_EXCLUSIVE_PAIRS: [
  DocumentModelClassificationEnum,
  DocumentModelClassificationEnum,
][] = [
  [
    DocumentModelClassificationEnum.GRO_PGR,
    DocumentModelClassificationEnum.SOMENTE_PGR,
  ],
  [
    DocumentModelClassificationEnum.COM_FRPS,
    DocumentModelClassificationEnum.SEM_FRPS,
  ],
  [
    DocumentModelClassificationEnum.COPSOQ_III,
    DocumentModelClassificationEnum.NAO_COPSOQ_III,
  ],
];

/** Garante array válido vindo da API ou do estado do formulário. */
export function normalizeDocumentModelClassifications(
  classifications?: DocumentModelClassificationEnum[] | null,
): DocumentModelClassificationEnum[] {
  if (!classifications?.length) return [];
  if (!Array.isArray(classifications)) return [];
  return [...new Set(classifications)];
}

/** Retorna mensagem de erro se houver par excludente; caso contrário, null. */
export function getDocumentModelClassificationConflict(
  classifications: DocumentModelClassificationEnum[],
): string | null {
  const set = new Set(normalizeDocumentModelClassifications(classifications));

  for (const [a, b] of MUTUALLY_EXCLUSIVE_PAIRS) {
    if (set.has(a) && set.has(b)) {
      return `Classificações incompatíveis: não é possível combinar ${documentModelClassificationMap[a].shortLabel} com ${documentModelClassificationMap[b].shortLabel}.`;
    }
  }

  return null;
}

export function toggleDocumentModelClassification(
  current: DocumentModelClassificationEnum[] | undefined,
  value: DocumentModelClassificationEnum,
): DocumentModelClassificationEnum[] {
  const list = [...(current || [])];
  const index = list.indexOf(value);

  if (index >= 0) {
    list.splice(index, 1);
    return list;
  }

  const conflict = MUTUALLY_EXCLUSIVE[value];
  const withoutConflict = conflict
    ? list.filter((item) => item !== conflict)
    : list;

  return [...withoutConflict, value];
}
