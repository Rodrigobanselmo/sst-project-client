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

/** Remove sufixo "(APR)" exibido nos nomes de anexos gerados pela API. */
export function formatPgrAttachmentDisplayName(name: string): string {
  return name.replace(/ \(APR\)/gi, '').trim();
}

export function getPgrMainDocumentDownloadLabel(
  _documentType: DocumentTypeEnum,
): string {
  return 'Baixar documento (sem anexos)';
}

export function getPgrEssentialDownloadLabel(
  documentType: DocumentTypeEnum,
): string {
  if (documentType === DocumentTypeEnum.FRPS) {
    return 'Baixar FRPS com anexos essenciais';
  }
  return 'Baixar PGR com anexos essenciais';
}

export function getPgrFullDownloadLabel(documentType: DocumentTypeEnum): string {
  if (documentType === DocumentTypeEnum.FRPS) {
    return 'Baixar FRPS completo (incluindo anexos 1, 2 e 3)';
  }
  return 'Baixar PGR completo (incluindo anexos 1, 2 e 3)';
}
