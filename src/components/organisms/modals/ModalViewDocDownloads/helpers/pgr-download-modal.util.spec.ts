import { DocumentTypeEnum } from 'project/enum/document.enums';

import {
  buildPgrActionPlanAnnexDownloadUrl,
  buildPgrConsolidatedDownloadUrl,
  getPgrEssentialDownloadLabel,
  getPgrEssentialRecommendedBadge,
  getPgrFullDownloadLabel,
  getPgrMainDocumentDownloadLabel,
} from './pgr-download-labels.util';
import {
  buildPgrDownloadModalOptions,
  groupPgrDownloadAnnexesByCategory,
  groupPgrDownloadOptionsBySection,
  isPgrDownloadUrlLoading,
} from './pgr-download-modal.util';

describe('pgr-download-modal.util', () => {
  const baseParams = {
    documentType: DocumentTypeEnum.PGR,
    docId: 'doc-pgr-1',
    companyId: 'company-1',
    mainDocumentUrl: '/documents/base/doc-pgr-1/company-1',
    downloadAttRoute: '/documents/base/:docId/attachment',
    attachments: [
      { id: 'att-funcao', name: 'Inventário por Função (APR)' },
      { id: 'att-gse', name: 'Inventário por GSE (APR)' },
      { id: 'att-plano', name: 'Plano de Ação' },
    ],
  };

  it('builds the recommended document option from essential', () => {
    const { document } = groupPgrDownloadOptionsBySection(
      buildPgrDownloadModalOptions(baseParams),
    );
    expect(document.map((o) => o.id)).toEqual(['pgr-essential']);
    expect(document[0].label).toBe('Baixar documento recomendado');
    expect(document[0].badge).toBe('Recomendado');
    expect(document[0].recommended).toBe(true);
    expect(document[0].url).toBe(
      '/documents/base/pgr-consolidated/docx/doc-pgr-1/company-1?profile=essential',
    );
    expect(document.some((o) => o.id === 'pgr-main' || o.id === 'pgr-full')).toBe(
      false,
    );
  });

  it('keeps the recommended route on profile=essential', () => {
    const options = buildPgrDownloadModalOptions(baseParams);
    expect(options.find((o) => o.id === 'pgr-essential')?.url).toBe(
      '/documents/base/pgr-consolidated/docx/doc-pgr-1/company-1?profile=essential',
    );
    expect(options.find((o) => o.id === 'pgr-full')).toBeUndefined();
    expect(
      buildPgrConsolidatedDownloadUrl({
        docId: 'doc-pgr-1',
        companyId: 'company-1',
        profile: 'essential',
      }),
    ).toContain('profile=essential');
  });

  it('separates Documento and Anexos and preserves annex order', () => {
    const grouped = groupPgrDownloadOptionsBySection(
      buildPgrDownloadModalOptions(baseParams),
    );
    expect(grouped.document.every((o) => o.section === 'Documento')).toBe(true);
    expect(grouped.annexes.every((o) => o.section === 'Anexos')).toBe(true);
    expect(grouped.annexes.map((o) => o.label)).toEqual([
      'Baixar Inventário de Risco por Função',
      'Baixar Inventário de Risco por GSE',
      'Baixar Plano de Ação Detalhado',
      'Baixar Plano de Ação Agrupado',
      'Baixar Plano de Ação Gerencial',
    ]);
  });

  it('groups annexes by visual category shared by PGR and FRPS', () => {
    const pgr = groupPgrDownloadAnnexesByCategory(
      groupPgrDownloadOptionsBySection(buildPgrDownloadModalOptions(baseParams))
        .annexes,
    );
    const frps = groupPgrDownloadAnnexesByCategory(
      groupPgrDownloadOptionsBySection(
        buildPgrDownloadModalOptions({
          ...baseParams,
          documentType: DocumentTypeEnum.FRPS,
        }),
      ).annexes,
    );

    expect(pgr.categories.map((group) => group.title)).toEqual([
      'Inventário de Riscos',
      'Plano de Ação',
    ]);
    expect(pgr.categories[0].options.map((o) => o.label)).toEqual([
      'Baixar Inventário de Risco por Função',
      'Baixar Inventário de Risco por GSE',
    ]);
    expect(pgr.categories[1].options.map((o) => o.label)).toEqual([
      'Baixar Plano de Ação Detalhado',
      'Baixar Plano de Ação Agrupado',
      'Baixar Plano de Ação Gerencial',
    ]);
    expect(pgr.categories.map((group) => group.title)).toEqual(
      frps.categories.map((group) => group.title),
    );
    expect(frps.categories[1].options.map((o) => o.label)).toEqual(
      pgr.categories[1].options.map((o) => o.label),
    );
    expect(pgr.uncategorized).toEqual([]);
    expect(
      pgr.categories[1].options.find((o) => o.id === 'pgr-action-plan-grouped')
        ?.url,
    ).toBe(
      '/documents/base/pgr-action-plan/docx/doc-pgr-1/company-1?format=grouped',
    );
    expect(
      pgr.categories[1].options.find((o) => o.id === 'pgr-action-plan-managerial')
        ?.url,
    ).toBe(
      '/documents/base/pgr-action-plan/docx/doc-pgr-1/company-1?format=managerial',
    );
    expect(
      buildPgrActionPlanAnnexDownloadUrl({
        docId: 'doc-pgr-1',
        companyId: 'company-1',
        format: 'grouped',
      }),
    ).toContain('format=grouped');
    expect(
      buildPgrActionPlanAnnexDownloadUrl({
        docId: 'doc-pgr-1',
        companyId: 'company-1',
        format: 'managerial',
      }),
    ).toContain('format=managerial');
  });

  it('keeps recommended descriptions distinct for PGR and FRPS', () => {
    const pgr = groupPgrDownloadOptionsBySection(
      buildPgrDownloadModalOptions(baseParams),
    ).document;
    const frps = groupPgrDownloadOptionsBySection(
      buildPgrDownloadModalOptions({
        ...baseParams,
        documentType: DocumentTypeEnum.FRPS,
      }),
    ).document;

    expect(pgr.map((o) => o.id)).toEqual(['pgr-essential']);
    expect(pgr[0].label).toBe('Baixar documento recomendado');
    expect(frps[0].label).toBe('Baixar documento recomendado');
    expect(pgr[0].description).toBe(
      'Inclui o corpo principal e os anexos essenciais do PGR.',
    );
    expect(frps[0].description).toBe(
      'Inclui o corpo principal e os anexos essenciais do FRPS.',
    );
  });

  it('tracks loading independently per URL', () => {
    const url =
      '/documents/base/pgr-consolidated/docx/doc-pgr-1/company-1?profile=essential';
    expect(
      isPgrDownloadUrlLoading(url, { isLoading: true, variables: url }),
    ).toBe(true);
    expect(
      isPgrDownloadUrlLoading(url, {
        isLoading: true,
        variables: '/documents/base/other',
      }),
    ).toBe(false);
  });

  it('exposes labels used by the standardized modal', () => {
    expect(getPgrMainDocumentDownloadLabel(DocumentTypeEnum.PGR)).toBe(
      'Baixar documento sem anexos',
    );
    expect(getPgrEssentialDownloadLabel(DocumentTypeEnum.PGR)).toBe(
      'Baixar PGR com anexos essenciais',
    );
    expect(getPgrFullDownloadLabel(DocumentTypeEnum.PGR)).toBe(
      'Baixar PGR completo',
    );
    expect(getPgrEssentialRecommendedBadge()).toBe('Recomendado');
  });
});
