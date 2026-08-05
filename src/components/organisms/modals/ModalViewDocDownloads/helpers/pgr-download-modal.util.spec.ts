import { DocumentTypeEnum } from 'project/enum/document.enums';

import {
  buildPgrConsolidatedDownloadUrl,
  getPgrEssentialDownloadLabel,
  getPgrEssentialRecommendedBadge,
  getPgrFullDownloadLabel,
  getPgrMainDocumentDownloadLabel,
} from './pgr-download-labels.util';
import {
  buildPgrDownloadModalOptions,
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

  it('builds three document options with recommended essencial', () => {
    const { document } = groupPgrDownloadOptionsBySection(
      buildPgrDownloadModalOptions(baseParams),
    );
    expect(document.map((o) => o.id)).toEqual([
      'pgr-main',
      'pgr-essential',
      'pgr-full',
    ]);
    expect(document[0].label).toBe('Baixar documento sem anexos');
    expect(document[1].label).toBe('Baixar PGR com anexos essenciais');
    expect(document[1].badge).toBe('Recomendado');
    expect(document[1].recommended).toBe(true);
    expect(document[2].label).toBe('Baixar PGR completo');
  });

  it('keeps routes unchanged (essential/full query profiles)', () => {
    const options = buildPgrDownloadModalOptions(baseParams);
    expect(options.find((o) => o.id === 'pgr-essential')?.url).toBe(
      '/documents/base/pgr-consolidated/docx/doc-pgr-1/company-1?profile=essential',
    );
    expect(options.find((o) => o.id === 'pgr-full')?.url).toBe(
      '/documents/base/pgr-consolidated/docx/doc-pgr-1/company-1?profile=full',
    );
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
      'Baixar Inventário por Função',
      'Baixar Inventário por GSE',
      'Baixar Plano de Ação',
    ]);
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
