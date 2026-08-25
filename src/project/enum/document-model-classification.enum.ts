import { DocumentTypeEnum } from 'project/enum/document.enums';

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
  COMPLETO = 'COMPLETO',
  ESTABELECIMENTO_PROPRIO = 'ESTABELECIMENTO_PROPRIO',
  COM_VISITA_DE_CAMPO = 'COM_VISITA_DE_CAMPO',
  DADOS_FORNECIDOS = 'DADOS_FORNECIDOS',
}

const ALL_DOCUMENT_TYPES = Object.values(DocumentTypeEnum);

export type DocumentModelClassificationMeta = {
  value: DocumentModelClassificationEnum;
  label: string;
  shortLabel: string;
  documentTypes: DocumentTypeEnum[];
};

/** Metadados das classificações padrão (espelhar API: document-model-classification-applicability). */
export const documentModelClassificationMap: Record<
  DocumentModelClassificationEnum,
  DocumentModelClassificationMeta
> = {
  [DocumentModelClassificationEnum.GRO_PGR]: {
    value: DocumentModelClassificationEnum.GRO_PGR,
    label: 'GRO/PGR',
    shortLabel: 'GRO/PGR',
    documentTypes: [DocumentTypeEnum.PGR],
  },
  [DocumentModelClassificationEnum.SOMENTE_PGR]: {
    value: DocumentModelClassificationEnum.SOMENTE_PGR,
    label: 'Somente PGR',
    shortLabel: 'Somente PGR',
    documentTypes: [DocumentTypeEnum.PGR],
  },
  [DocumentModelClassificationEnum.COM_FRPS]: {
    value: DocumentModelClassificationEnum.COM_FRPS,
    label: 'Com FRPS',
    shortLabel: 'Com FRPS',
    documentTypes: [DocumentTypeEnum.PGR],
  },
  [DocumentModelClassificationEnum.SEM_FRPS]: {
    value: DocumentModelClassificationEnum.SEM_FRPS,
    label: 'Sem FRPS',
    shortLabel: 'Sem FRPS',
    documentTypes: [DocumentTypeEnum.PGR],
  },
  [DocumentModelClassificationEnum.COPSOQ_III]: {
    value: DocumentModelClassificationEnum.COPSOQ_III,
    label: 'COPSOQ III',
    shortLabel: 'COPSOQ III',
    documentTypes: [DocumentTypeEnum.PGR, DocumentTypeEnum.FRPS],
  },
  [DocumentModelClassificationEnum.NAO_COPSOQ_III]: {
    value: DocumentModelClassificationEnum.NAO_COPSOQ_III,
    label: 'Não COPSOQ III',
    shortLabel: 'Não COPSOQ',
    documentTypes: [DocumentTypeEnum.PGR, DocumentTypeEnum.FRPS],
  },
  [DocumentModelClassificationEnum.NR18]: {
    value: DocumentModelClassificationEnum.NR18,
    label: 'NR18',
    shortLabel: 'NR18',
    documentTypes: [DocumentTypeEnum.PGR],
  },
  [DocumentModelClassificationEnum.TERCEIROS]: {
    value: DocumentModelClassificationEnum.TERCEIROS,
    label: 'Terceiros',
    shortLabel: 'Terceiros',
    documentTypes: ALL_DOCUMENT_TYPES,
  },
  [DocumentModelClassificationEnum.SIMPLIFICADO]: {
    value: DocumentModelClassificationEnum.SIMPLIFICADO,
    label: 'Simplificado',
    shortLabel: 'Simplificado',
    documentTypes: ALL_DOCUMENT_TYPES,
  },
  [DocumentModelClassificationEnum.BACKUP]: {
    value: DocumentModelClassificationEnum.BACKUP,
    label: 'Backup',
    shortLabel: 'Backup',
    documentTypes: ALL_DOCUMENT_TYPES,
  },
  [DocumentModelClassificationEnum.COMPLETO]: {
    value: DocumentModelClassificationEnum.COMPLETO,
    label: 'Completo',
    shortLabel: 'Completo',
    documentTypes: ALL_DOCUMENT_TYPES,
  },
  [DocumentModelClassificationEnum.ESTABELECIMENTO_PROPRIO]: {
    value: DocumentModelClassificationEnum.ESTABELECIMENTO_PROPRIO,
    label: 'Estabelecimento Próprio',
    shortLabel: 'Estab. Próprio',
    documentTypes: ALL_DOCUMENT_TYPES,
  },
  [DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO]: {
    value: DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO,
    label: 'Com Visita de Campo',
    shortLabel: 'Com Visita de Campo',
    documentTypes: ALL_DOCUMENT_TYPES,
  },
  [DocumentModelClassificationEnum.DADOS_FORNECIDOS]: {
    value: DocumentModelClassificationEnum.DADOS_FORNECIDOS,
    label: 'Dados Fornecidos',
    shortLabel: 'Dados Fornecidos',
    documentTypes: ALL_DOCUMENT_TYPES,
  },
};

/** Ordem visual dos chips (pares excludentes lado a lado). */
export const DOCUMENT_MODEL_CLASSIFICATION_DISPLAY_ORDER: DocumentModelClassificationEnum[] =
  [
    DocumentModelClassificationEnum.GRO_PGR,
    DocumentModelClassificationEnum.SOMENTE_PGR,
    DocumentModelClassificationEnum.COM_FRPS,
    DocumentModelClassificationEnum.SEM_FRPS,
    DocumentModelClassificationEnum.COPSOQ_III,
    DocumentModelClassificationEnum.NAO_COPSOQ_III,
    DocumentModelClassificationEnum.ESTABELECIMENTO_PROPRIO,
    DocumentModelClassificationEnum.TERCEIROS,
    DocumentModelClassificationEnum.SIMPLIFICADO,
    DocumentModelClassificationEnum.COMPLETO,
    DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO,
    DocumentModelClassificationEnum.DADOS_FORNECIDOS,
    DocumentModelClassificationEnum.NR18,
    DocumentModelClassificationEnum.BACKUP,
  ];

export const documentModelClassificationList =
  DOCUMENT_MODEL_CLASSIFICATION_DISPLAY_ORDER.map(
    (value) => documentModelClassificationMap[value],
  );

export function isClassificationApplicableToDocumentType(
  classification: DocumentModelClassificationEnum,
  documentType: DocumentTypeEnum,
): boolean {
  return documentModelClassificationMap[classification].documentTypes.includes(
    documentType,
  );
}

export function getDocumentModelClassificationsForType(
  documentType?: DocumentTypeEnum,
): DocumentModelClassificationMeta[] {
  if (!documentType) return documentModelClassificationList;
  return documentModelClassificationList.filter((item) =>
    item.documentTypes.includes(documentType),
  );
}

export function filterClassificationsForDocumentType(
  classifications: DocumentModelClassificationEnum[] | undefined | null,
  documentType?: DocumentTypeEnum,
): DocumentModelClassificationEnum[] {
  const normalized = normalizeDocumentModelClassifications(classifications);
  if (!documentType) return normalized;
  return normalized.filter((item) =>
    isClassificationApplicableToDocumentType(item, documentType),
  );
}

const MUTUALLY_EXCLUSIVE: Partial<
  Record<DocumentModelClassificationEnum, DocumentModelClassificationEnum>
> = {
  [DocumentModelClassificationEnum.GRO_PGR]: DocumentModelClassificationEnum.SOMENTE_PGR,
  [DocumentModelClassificationEnum.SOMENTE_PGR]: DocumentModelClassificationEnum.GRO_PGR,
  [DocumentModelClassificationEnum.COM_FRPS]: DocumentModelClassificationEnum.SEM_FRPS,
  [DocumentModelClassificationEnum.SEM_FRPS]: DocumentModelClassificationEnum.COM_FRPS,
  [DocumentModelClassificationEnum.COPSOQ_III]: DocumentModelClassificationEnum.NAO_COPSOQ_III,
  [DocumentModelClassificationEnum.NAO_COPSOQ_III]: DocumentModelClassificationEnum.COPSOQ_III,
  [DocumentModelClassificationEnum.COMPLETO]: DocumentModelClassificationEnum.SIMPLIFICADO,
  [DocumentModelClassificationEnum.SIMPLIFICADO]: DocumentModelClassificationEnum.COMPLETO,
  [DocumentModelClassificationEnum.ESTABELECIMENTO_PROPRIO]:
    DocumentModelClassificationEnum.TERCEIROS,
  [DocumentModelClassificationEnum.TERCEIROS]:
    DocumentModelClassificationEnum.ESTABELECIMENTO_PROPRIO,
  [DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO]:
    DocumentModelClassificationEnum.DADOS_FORNECIDOS,
  [DocumentModelClassificationEnum.DADOS_FORNECIDOS]:
    DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO,
};

/** Modelo contém todas as classificações ativas (interseção / AND). */
export function documentModelMatchesClassificationFilters(
  classifications: DocumentModelClassificationEnum[] | undefined,
  active: DocumentModelClassificationEnum[],
): boolean {
  if (!active.length) return true;
  if (!classifications?.length) return false;
  return active.every((item) => classifications.includes(item));
}

/** Alterna um filtro na lista ativa com o mesmo toggle excludente da edição. */
export function toggleDocumentModelClassificationFilter(
  active: DocumentModelClassificationEnum[],
  value: DocumentModelClassificationEnum,
): DocumentModelClassificationEnum[] {
  return toggleDocumentModelClassification(active, value);
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
  [
    DocumentModelClassificationEnum.ESTABELECIMENTO_PROPRIO,
    DocumentModelClassificationEnum.TERCEIROS,
  ],
  [
    DocumentModelClassificationEnum.SIMPLIFICADO,
    DocumentModelClassificationEnum.COMPLETO,
  ],
  [
    DocumentModelClassificationEnum.COM_VISITA_DE_CAMPO,
    DocumentModelClassificationEnum.DADOS_FORNECIDOS,
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
  documentType?: DocumentTypeEnum,
): string | null {
  const normalized = normalizeDocumentModelClassifications(classifications);
  const set = new Set(normalized);

  if (documentType) {
    for (const classification of normalized) {
      if (!isClassificationApplicableToDocumentType(classification, documentType)) {
        return `A classificação ${documentModelClassificationMap[classification].shortLabel} não é válida para o tipo ${documentType}.`;
      }
    }
  }

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

export function getExclusivePairsHintForDocumentType(
  documentType?: DocumentTypeEnum,
): string {
  const applicable = new Set(
    getDocumentModelClassificationsForType(documentType).map((item) => item.value),
  );

  const hints = MUTUALLY_EXCLUSIVE_PAIRS.filter(
    ([a, b]) => applicable.has(a) && applicable.has(b),
  ).map(
    ([a, b]) =>
      `${documentModelClassificationMap[a].shortLabel} ↔ ${documentModelClassificationMap[b].shortLabel}`,
  );

  return hints.length ? hints.join('; ') : '';
}

export function sortClassificationsForDisplay(
  classifications: DocumentModelClassificationEnum[] | undefined | null,
): DocumentModelClassificationEnum[] {
  const order = new Map(
    DOCUMENT_MODEL_CLASSIFICATION_DISPLAY_ORDER.map((value, index) => [
      value,
      index,
    ]),
  );

  return normalizeDocumentModelClassifications(classifications).sort(
    (a, b) => (order.get(a) ?? Number.MAX_SAFE_INTEGER) - (order.get(b) ?? Number.MAX_SAFE_INTEGER),
  );
}
