import { formatPgrAttachmentDisplayName } from './pgr-download-labels.util';
import {
  buildPcmsoConsolidatedDownloadUrl,
  buildPcmsoExamsByGseDownloadUrl,
  getPcmsoEssentialDownloadDescription,
  getPcmsoEssentialDownloadLabel,
  getPcmsoEssentialRecommendedBadge,
  getPcmsoExamsByGseDownloadDescription,
  getPcmsoExamsByGseDownloadLabel,
  getPcmsoFullDownloadDescription,
  getPcmsoFullDownloadLabel,
  getPcmsoMainDocumentDownloadDescription,
  getPcmsoMainDocumentDownloadLabel,
  PCMSO_DOWNLOAD_SECTION_ANNEXES,
  PCMSO_DOWNLOAD_SECTION_DOCUMENT,
} from './pcmso-download-labels.util';

export type PcmsoDownloadAttachmentInput = {
  id: string;
  name: string;
};

export type PcmsoDownloadOption = {
  id: string;
  section: typeof PCMSO_DOWNLOAD_SECTION_DOCUMENT | typeof PCMSO_DOWNLOAD_SECTION_ANNEXES;
  url: string;
  label: string;
  description?: string;
  badge?: string;
  recommended?: boolean;
};

export type BuildPcmsoDownloadModalOptionsParams = {
  docId: string;
  companyId: string;
  workspaceId: string;
  mainDocumentUrl: string;
  downloadAttRoute: string;
  attachments?: PcmsoDownloadAttachmentInput[];
};

/**
 * Pure builder for PCMSO download modal options.
 * Keeps Documento vs Anexos separated and preserves legacy attachment order after the GSE annex.
 */
export function buildPcmsoDownloadModalOptions(
  params: BuildPcmsoDownloadModalOptionsParams,
): PcmsoDownloadOption[] {
  const {
    docId,
    companyId,
    workspaceId,
    mainDocumentUrl,
    downloadAttRoute,
    attachments = [],
  } = params;

  const essentialUrl = buildPcmsoConsolidatedDownloadUrl({
    docId,
    companyId,
    profile: 'essential',
  });
  const fullUrl = buildPcmsoConsolidatedDownloadUrl({
    docId,
    companyId,
    profile: 'full',
  });
  const gseUrl = buildPcmsoExamsByGseDownloadUrl({ companyId, workspaceId });

  const documentOptions: PcmsoDownloadOption[] = [
    {
      id: 'pcmso-main',
      section: PCMSO_DOWNLOAD_SECTION_DOCUMENT,
      url: mainDocumentUrl,
      label: getPcmsoMainDocumentDownloadLabel(),
      description: getPcmsoMainDocumentDownloadDescription(),
    },
    {
      id: 'pcmso-essential',
      section: PCMSO_DOWNLOAD_SECTION_DOCUMENT,
      url: essentialUrl,
      label: getPcmsoEssentialDownloadLabel(),
      description: getPcmsoEssentialDownloadDescription(),
      badge: getPcmsoEssentialRecommendedBadge(),
      recommended: true,
    },
    {
      id: 'pcmso-full',
      section: PCMSO_DOWNLOAD_SECTION_DOCUMENT,
      url: fullUrl,
      label: getPcmsoFullDownloadLabel(),
      description: getPcmsoFullDownloadDescription(),
    },
  ];

  const annexOptions: PcmsoDownloadOption[] = [
    {
      id: 'pcmso-annex-gse',
      section: PCMSO_DOWNLOAD_SECTION_ANNEXES,
      url: gseUrl,
      label: getPcmsoExamsByGseDownloadLabel(),
      description: getPcmsoExamsByGseDownloadDescription(),
    },
    ...attachments.map((attachment) => {
      const attachmentUrl = `${downloadAttRoute.replace(':docId', docId)}/${attachment.id}/${companyId}`;
      return {
        id: `pcmso-attachment-${attachment.id}`,
        section: PCMSO_DOWNLOAD_SECTION_ANNEXES,
        url: attachmentUrl,
        label: `Baixar ${formatPgrAttachmentDisplayName(attachment.name)}`,
      } satisfies PcmsoDownloadOption;
    }),
  ];

  return [...documentOptions, ...annexOptions];
}

export function groupPcmsoDownloadOptionsBySection(options: PcmsoDownloadOption[]) {
  return {
    document: options.filter((o) => o.section === PCMSO_DOWNLOAD_SECTION_DOCUMENT),
    annexes: options.filter((o) => o.section === PCMSO_DOWNLOAD_SECTION_ANNEXES),
  };
}

/** True while this exact URL is the in-flight download (independent per button). */
export function isPcmsoDownloadUrlLoading(
  url: string,
  mutation: { isLoading?: boolean; variables?: unknown },
): boolean {
  return (
    !!mutation.isLoading &&
    typeof mutation.variables === 'string' &&
    mutation.variables === url
  );
}
