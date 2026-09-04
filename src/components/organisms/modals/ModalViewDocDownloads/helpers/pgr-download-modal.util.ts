import { DocumentTypeEnum } from 'project/enum/document.enums';

import {
  classifyPgrDownloadAnnex,
  getPgrDownloadAnnexCategoryId,
  getPgrDownloadAnnexCategoryTitle,
  getPgrDownloadAnnexLabel,
  type PgrDownloadAnnexCategoryId,
} from './pgr-download-annex-categories.util';
import {
  buildPgrActionPlanAnnexDownloadUrl,
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
  annexCategory?: PgrDownloadAnnexCategoryId;
};

export type BuildPgrDownloadModalOptionsParams = {
  documentType: DocumentTypeEnum;
  docId: string;
  companyId: string;
  mainDocumentUrl: string;
  downloadAttRoute: string;
  attachments?: PgrDownloadAttachmentInput[];
};

export type PgrDownloadAnnexCategoryGroup = {
  id: PgrDownloadAnnexCategoryId;
  title: string;
  options: PgrDownloadOption[];
};

const ANNEX_CATEGORY_ORDER: PgrDownloadAnnexCategoryId[] = ['inventory', 'action_plan'];

const optionOrder = (option: PgrDownloadOption): number => {
  if (option.id === 'pgr-action-plan-grouped') return 1;
  if (option.id === 'pgr-action-plan-managerial') return 2;
  if (option.label.includes('Função')) return 0;
  if (option.label.includes('GSE')) return 1;
  if (option.label.includes('Detalhado')) return 0;
  if (option.label.includes('Agrupado')) return 1;
  if (option.label.includes('Gerencial')) return 2;
  return 50;
};

/**
 * Pure builder for PGR/FRPS download modal options — same UX concept as PCMSO.
 * Documento stays unchanged. Anexos are classified for visual categories.
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

  const annexOptions: PgrDownloadOption[] = [];

  attachments.forEach((attachment) => {
    const kind = classifyPgrDownloadAnnex(attachment.name);
    const attachmentUrl = `${downloadAttRoute.replace(':docId', docId)}/${attachment.id}/${companyId}`;
    annexOptions.push({
      id: `pgr-attachment-${attachment.id}`,
      section: PGR_DOWNLOAD_SECTION_ANNEXES,
      url: attachmentUrl,
      label: kind
        ? getPgrDownloadAnnexLabel(kind)
        : `Baixar ${formatPgrAttachmentDisplayName(attachment.name)}`,
      annexCategory: kind ? getPgrDownloadAnnexCategoryId(kind) : undefined,
    });
  });

  annexOptions.push({
    id: 'pgr-action-plan-grouped',
    section: PGR_DOWNLOAD_SECTION_ANNEXES,
    url: buildPgrActionPlanAnnexDownloadUrl({
      docId,
      companyId,
      format: 'grouped',
    }),
    label: getPgrDownloadAnnexLabel('action_plan_grouped'),
    annexCategory: 'action_plan',
  });

  annexOptions.push({
    id: 'pgr-action-plan-managerial',
    section: PGR_DOWNLOAD_SECTION_ANNEXES,
    url: buildPgrActionPlanAnnexDownloadUrl({
      docId,
      companyId,
      format: 'managerial',
    }),
    label: getPgrDownloadAnnexLabel('action_plan_managerial'),
    annexCategory: 'action_plan',
  });

  return [...documentOptions, ...annexOptions];
}

export function groupPgrDownloadOptionsBySection(options: PgrDownloadOption[]) {
  return {
    document: options.filter((o) => o.section === PGR_DOWNLOAD_SECTION_DOCUMENT),
    annexes: options.filter((o) => o.section === PGR_DOWNLOAD_SECTION_ANNEXES),
  };
}

export function groupPgrDownloadAnnexesByCategory(
  annexes: PgrDownloadOption[],
): {
  categories: PgrDownloadAnnexCategoryGroup[];
  uncategorized: PgrDownloadOption[];
} {
  const categories = ANNEX_CATEGORY_ORDER.map((id) => ({
    id,
    title: getPgrDownloadAnnexCategoryTitle(id),
    options: annexes
      .filter((option) => option.annexCategory === id)
      .slice()
      .sort((left, right) => optionOrder(left) - optionOrder(right)),
  })).filter((group) => group.options.length > 0);

  const uncategorized = annexes.filter((option) => !option.annexCategory);

  return { categories, uncategorized };
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
