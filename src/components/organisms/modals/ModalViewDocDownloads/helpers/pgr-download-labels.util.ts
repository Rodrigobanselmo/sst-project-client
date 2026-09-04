import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { DocumentTypeEnum } from 'project/enum/document.enums';

export type PgrConsolidatedProfile = 'essential' | 'full';

export function buildPgrConsolidatedDownloadUrl(params: {
  docId: string;
  companyId: string;
  profile: PgrConsolidatedProfile;
}): string {
  return `${ApiRoutesEnum.DOCUMENTS_BASE}/pgr-consolidated/docx/${params.docId}/${params.companyId}?profile=${params.profile}`;
}

export function buildPgrActionPlanAnnexDownloadUrl(params: {
  docId: string;
  companyId: string;
  format: 'grouped' | 'managerial';
}): string {
  return `${ApiRoutesEnum.DOCUMENTS_BASE}/pgr-action-plan/docx/${params.docId}/${params.companyId}?format=${params.format}`;
}

/** Remove sufixo "(APR)" exibido nos nomes de anexos gerados pela API. */
export function formatPgrAttachmentDisplayName(name: string): string {
  return name.replace(/ \(APR\)/gi, '').trim();
}

export function getPgrMainDocumentDownloadLabel(
  _documentType: DocumentTypeEnum,
): string {
  return 'Baixar documento sem anexos';
}

export function getPgrMainDocumentDownloadDescription(
  documentType: DocumentTypeEnum,
): string {
  if (documentType === DocumentTypeEnum.FRPS) {
    return 'Corpo principal do FRPS, sem os anexos operacionais.';
  }
  return 'Corpo principal do PGR, sem os anexos operacionais.';
}

export function getPgrEssentialDownloadLabel(
  documentType: DocumentTypeEnum,
): string {
  if (documentType === DocumentTypeEnum.FRPS) {
    return 'Baixar FRPS com anexos essenciais';
  }
  return 'Baixar PGR com anexos essenciais';
}

export function getPgrEssentialDownloadDescription(
  documentType: DocumentTypeEnum,
): string {
  if (documentType === DocumentTypeEnum.FRPS) {
    return 'Inclui o corpo principal e os anexos essenciais do FRPS.';
  }
  return 'Inclui o corpo principal e os anexos essenciais do PGR.';
}

export function getPgrEssentialRecommendedBadge(): string {
  return 'Recomendado';
}

export function getPgrFullDownloadLabel(documentType: DocumentTypeEnum): string {
  if (documentType === DocumentTypeEnum.FRPS) {
    return 'Baixar FRPS completo';
  }
  return 'Baixar PGR completo';
}

export function getPgrFullDownloadDescription(
  documentType: DocumentTypeEnum,
): string {
  if (documentType === DocumentTypeEnum.FRPS) {
    return 'Inclui todos os anexos aplicáveis do FRPS.';
  }
  return 'Inclui Inventário por Função, Inventário por GSE e Plano de Ação.';
}

export const PGR_DOWNLOAD_SECTION_DOCUMENT = 'Documento';
export const PGR_DOWNLOAD_SECTION_ANNEXES = 'Anexos';
