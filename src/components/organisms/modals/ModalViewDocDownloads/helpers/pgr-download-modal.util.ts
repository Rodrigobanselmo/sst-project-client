import { DocumentTypeEnum } from 'project/enum/document.enums';

import {
  buildPgrConsolidatedDownloadUrl,
  formatPgrAttachmentDisplayName,
  getPgrEssentialDownloadDescription,
  getPgrEssentialDownloadLabel,
  getPgrEssentialRecommendedBadge,
  getPgrFullDownloadDescription,
  getPgrFullDownloadLabel,
  getPgrMainDocumentDownloadDescription,
  getPgrMainDocumentDownloadLabel,
  PGR_DOWNLOAD_SECTION_ANNEXES,
  PGR_DOWNLOAD_SECTION_DOCUMENT,
} from './pgr-download-labels.util';

export type PgrDownloadAttachmentInput = {
  id: string;
  name: string;
};

export type PgrDownloadOption = {
  id: string;
  section: typeof PGR_DOWNLOAD_SECTION_DOCUMENT | typeof PGR_DOWNLOAD_SECTION_ANNEXES;
  url: string;
  label: string;
  description?: string;
  badge?: string;
  recommended?: boolean;
};

export type BuildPgrDownloadModalOptionsParams = {
  documentType: DocumentTypeEnum;
  docId: string;
  companyId: string;
  mainDocumentUrl: string;
  downloadAttRoute: string;
  attachments?: PgrDownloadAttachmentInput[];
};

/**
 * Pure builder for PGR/FRPS download modal options — same UX concept as PCMSO.
 */
export function buildPgrDownloadModalOptions(
  params: BuildPgrDownloadModalOptionsParams,
): PgrDownloadOption[] {
  const {
    documentType,
    docId,
    companyId,
    mainDocumentUrl,
    downloadAttRoute,
    attachments = [],
  } = params;

  const essentialUrl = buildPgrConsolidatedDownloadUrl({
    docId,
    companyId,
    profile: 'essential',
  });
  const fullUrl = buildPgrConsolidatedDownloadUrl({
    docId,
    companyId,
    profile: 'full',
  });

  const documentOptions: PgrDownloadOption[] = [
    {
      id: 'pgr-main',
      section: PGR_DOWNLOAD_SECTION_DOCUMENT,
      url: mainDocumentUrl,
      label: getPgrMainDocumentDownloadLabel(documentType),
      description: getPgrMainDocumentDownloadDescription(documentType),
    },
    {
      id: 'pgr-essential',
      section: PGR_DOWNLOAD_SECTION_DOCUMENT,
      url: essentialUrl,
      label: getPgrEssentialDownloadLabel(documentType),
      description: getPgrEssentialDownloadDescription(documentType),
      badge: getPgrEssentialRecommendedBadge(),
      recommended: true,
    },
    {
      id: 'pgr-full',
      section: PGR_DOWNLOAD_SECTION_DOCUMENT,
      url: fullUrl,
      label: getPgrFullDownloadLabel(documentType),
      description: getPgrFullDownloadDescription(documentType),
    },
  ];

  const annexOptions: PgrDownloadOption[] = attachments.map((attachment) => {
    const attachmentUrl = `${downloadAttRoute.replace(':docId', docId)}/${attachment.id}/${companyId}`;
    return {
      id: `pgr-attachment-${attachment.id}`,
      section: PGR_DOWNLOAD_SECTION_ANNEXES,
      url: attachmentUrl,
      label: `Baixar ${formatPgrAttachmentDisplayName(attachment.name)}`,
    } satisfies PgrDownloadOption;
  });

  return [...documentOptions, ...annexOptions];
}

export function groupPgrDownloadOptionsBySection(options: PgrDownloadOption[]) {
  return {
    document: options.filter((o) => o.section === PGR_DOWNLOAD_SECTION_DOCUMENT),
    annexes: options.filter((o) => o.section === PGR_DOWNLOAD_SECTION_ANNEXES),
  };
}

export function isPgrDownloadUrlLoading(
  url: string,
  mutation: { isLoading?: boolean; variables?: unknown },
): boolean {
  return (
    !!mutation.isLoading &&
    typeof mutation.variables === 'string' &&
    mutation.variables === url
  );
}
