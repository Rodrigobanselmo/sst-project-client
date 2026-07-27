import { DocumentTypeEnum } from 'project/enum/document.enums';

/** Modal "Modelo Documento" tab order (labels: PGR, PCMSO, LTCAT, …). */
export const DOCUMENT_MODEL_MODAL_TYPE_STEPS: DocumentTypeEnum[] = [
  DocumentTypeEnum.PGR,
  DocumentTypeEnum.PCSMO,
  DocumentTypeEnum.LTCAT,
  DocumentTypeEnum.PERICULOSIDADE,
  DocumentTypeEnum.INSALUBRIDADE,
  DocumentTypeEnum.FRPS,
];

/**
 * Programas e Laudos wizard tab order (URL `?active=`).
 * Differs from the modal tab order (LTCAT vs Periculosidade).
 */
export const PROGRAMS_LAUDOS_TAB_TYPES: DocumentTypeEnum[] = [
  DocumentTypeEnum.PGR,
  DocumentTypeEnum.PCSMO,
  DocumentTypeEnum.PERICULOSIDADE,
  DocumentTypeEnum.INSALUBRIDADE,
  DocumentTypeEnum.LTCAT,
  DocumentTypeEnum.FRPS,
];

export function getDocumentModelModalStep(
  type?: DocumentTypeEnum | null,
): number {
  if (!type) return 0;
  const index = DOCUMENT_MODEL_MODAL_TYPE_STEPS.indexOf(type);
  return index >= 0 ? index : 0;
}

export function getProgramsLaudosDocumentType(
  activeTabIndex: number | string | undefined | null,
): DocumentTypeEnum {
  const index = Number(activeTabIndex ?? 0);
  if (!Number.isFinite(index) || index < 0) {
    return DocumentTypeEnum.PGR;
  }
  return PROGRAMS_LAUDOS_TAB_TYPES[index] ?? DocumentTypeEnum.PGR;
}
