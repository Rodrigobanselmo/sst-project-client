import { ApiRoutesEnum } from 'core/enums/api-routes.enums';

export function buildPcmsoConsolidatedDownloadUrl(params: {
  docId: string;
  companyId: string;
}): string {
  return `${ApiRoutesEnum.DOCUMENTS_BASE}/pcmso-consolidated/docx/${params.docId}/${params.companyId}`;
}

export function getPcmsoMainDocumentDownloadLabel(): string {
  return 'Baixar documento (sem anexos)';
}

export function getPcmsoFullDownloadLabel(): string {
  return 'Baixar PCMSO completo (incluindo anexos 1, 2 e 3)';
}
