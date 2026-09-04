import { getPcmsoRecommendedDownloadLabel } from './pcmso-download-composition.util';
import {
  buildPcmsoConsolidatedDownloadUrl,
  getPcmsoEssentialDownloadDescription,
  getPcmsoEssentialRecommendedBadge,
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
  const { docId, companyId } = params;

  const essentialUrl = buildPcmsoConsolidatedDownloadUrl({
    docId,
    companyId,
    profile: 'essential',
  });

  return [
    {
      id: 'pcmso-essential',
      section: PCMSO_DOWNLOAD_SECTION_DOCUMENT,
      url: essentialUrl,
      label: getPcmsoRecommendedDownloadLabel(),
      description: getPcmsoEssentialDownloadDescription(),
      badge: getPcmsoEssentialRecommendedBadge(),
      recommended: true,
    },
  ];
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
