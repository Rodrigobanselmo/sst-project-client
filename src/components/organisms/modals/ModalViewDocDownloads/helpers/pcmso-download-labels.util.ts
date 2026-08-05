import { ApiRoutesEnum } from 'core/enums/api-routes.enums';

export type PcmsoConsolidatedProfile = 'essential' | 'full';

export function buildPcmsoConsolidatedDownloadUrl(params: {
  docId: string;
  companyId: string;
  profile: PcmsoConsolidatedProfile;
}): string {
  return `${ApiRoutesEnum.DOCUMENTS_BASE}/pcmso-consolidated/docx/${params.docId}/${params.companyId}?profile=${params.profile}`;
}

export function buildPcmsoExamsByGseDownloadUrl(params: {
  companyId: string;
  workspaceId: string;
}): string {
  return `${ApiRoutesEnum.DOCUMENTS_BASE}/pcmso-exams-by-gse/docx/${params.companyId}/${params.workspaceId}`;
}

export function getPcmsoMainDocumentDownloadLabel(): string {
  return 'Baixar documento sem anexos';
}

export function getPcmsoMainDocumentDownloadDescription(): string {
  return 'Corpo principal do PCMSO, sem os anexos operacionais e analíticos.';
}

export function getPcmsoEssentialDownloadLabel(): string {
  return 'Baixar PCMSO com anexos essenciais';
}

export function getPcmsoEssentialDownloadDescription(): string {
  return 'Inclui o corpo principal e a Relação de Riscos e Exames por GSE.';
}

export function getPcmsoEssentialRecommendedBadge(): string {
  return 'Recomendado';
}

export function getPcmsoFullDownloadLabel(): string {
  return 'Baixar PCMSO completo';
}

export function getPcmsoFullDownloadDescription(): string {
  return 'Inclui o Anexo por GSE e todos os anexos analíticos aplicáveis.';
}

export function getPcmsoExamsByGseDownloadLabel(): string {
  return 'Baixar Relação de Riscos e Exames por GSE';
}

export function getPcmsoExamsByGseDownloadDescription(): string {
  return 'Planejamento médico consolidado por Grupo Similar de Exposição.';
}

export const PCMSO_DOWNLOAD_SECTION_DOCUMENT = 'Documento';
export const PCMSO_DOWNLOAD_SECTION_ANNEXES = 'Anexos';
