import {
  buildPgrConsolidatedDownloadUrl,
  getPgrEssentialDownloadLabel,
  getPgrFullDownloadLabel,
  getPgrMainDocumentDownloadLabel,
} from './pgr-download-labels.util';
import {
  buildPcmsoConsolidatedDownloadUrl,
  buildPcmsoExamsByGseDownloadUrl,
  getPcmsoEssentialDownloadLabel,
  getPcmsoFullDownloadLabel,
  getPcmsoMainDocumentDownloadLabel,
} from './pcmso-download-labels.util';
import {
  buildPcmsoDownloadModalOptions,
  groupPcmsoDownloadOptionsBySection,
  isPcmsoDownloadUrlLoading,
} from './pcmso-download-modal.util';
import { DocumentTypeEnum } from 'project/enum/document.enums';

const baseParams = {
  docId: 'doc-pcmso-1',
  companyId: 'company-1',
  workspaceId: 'workspace-1',
  mainDocumentUrl: '/documents/base/doc-pcmso-1/company-1',
  downloadAttRoute: '/documents/base/:docId/attachment',
};

describe('pcmso-download-modal.util', () => {
  it('builds only the recommended document option from essential', () => {
    const { document, annexes } = groupPcmsoDownloadOptionsBySection(
      buildPcmsoDownloadModalOptions(baseParams),
    );

    expect(document.map((o) => o.id)).toEqual(['pcmso-essential']);
    expect(document[0].label).toBe('Baixar documento recomendado');
    expect(document[0].badge).toBe('Recomendado');
    expect(document[0].recommended).toBe(true);
    expect(document[0].url).toBe(
      '/documents/base/pcmso-consolidated/docx/doc-pcmso-1/company-1?profile=essential',
    );
    expect(annexes).toEqual([]);
    expect(document.some((o) => o.id === 'pcmso-main' || o.id === 'pcmso-full')).toBe(
      false,
    );
  });

  it('keeps backend URL helpers for legacy essential/full/avulso routes', () => {
    expect(
      buildPcmsoConsolidatedDownloadUrl({
        docId: 'doc-pcmso-1',
        companyId: 'company-1',
        profile: 'essential',
      }),
    ).toContain('profile=essential');
    expect(
      buildPcmsoConsolidatedDownloadUrl({
        docId: 'doc-pcmso-1',
        companyId: 'company-1',
        profile: 'full',
      }),
    ).toContain('profile=full');
    expect(
      buildPcmsoExamsByGseDownloadUrl({
        companyId: 'company-1',
        workspaceId: 'workspace-1',
      }),
    ).toBe('/documents/base/pcmso-exams-by-gse/docx/company-1/workspace-1');
    expect(getPcmsoMainDocumentDownloadLabel()).toBe('Baixar documento sem anexos');
    expect(getPcmsoEssentialDownloadLabel()).toBe(
      'Baixar PCMSO com anexos essenciais',
    );
    expect(getPcmsoFullDownloadLabel()).toBe('Baixar PCMSO completo');
  });

  it('tracks loading independently per URL', () => {
    const url =
      '/documents/base/pcmso-consolidated/docx/doc-pcmso-1/company-1?profile=essential';
    expect(isPcmsoDownloadUrlLoading(url, { isLoading: true, variables: url })).toBe(
      true,
    );
    expect(
      isPcmsoDownloadUrlLoading(url, {
        isLoading: true,
        variables: '/documents/base/other',
      }),
    ).toBe(false);
  });
});

describe('PGR download modal regression (Phase F must not change PGR)', () => {
  it('keeps PGR essential/full routes and labels unchanged', () => {
    expect(
      buildPgrConsolidatedDownloadUrl({
        docId: 'doc-pgr',
        companyId: 'company-1',
        profile: 'essential',
      }),
    ).toBe(
      '/documents/base/pgr-consolidated/docx/doc-pgr/company-1?profile=essential',
    );
    expect(
      buildPgrConsolidatedDownloadUrl({
        docId: 'doc-pgr',
        companyId: 'company-1',
        profile: 'full',
      }),
    ).toBe(
      '/documents/base/pgr-consolidated/docx/doc-pgr/company-1?profile=full',
    );
    expect(getPgrMainDocumentDownloadLabel(DocumentTypeEnum.PGR)).toBe(
      'Baixar documento sem anexos',
    );
    expect(getPgrEssentialDownloadLabel(DocumentTypeEnum.PGR)).toBe(
      'Baixar PGR com anexos essenciais',
    );
    expect(getPgrFullDownloadLabel(DocumentTypeEnum.PGR)).toBe(
      'Baixar PGR completo',
    );
  });
});
