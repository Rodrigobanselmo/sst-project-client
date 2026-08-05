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

describe('pcmso-download-labels.util', () => {
  it('builds essential consolidated URL with profile=essential', () => {
    expect(
      buildPcmsoConsolidatedDownloadUrl({
        docId: 'doc-1',
        companyId: 'company-1',
        profile: 'essential',
      }),
    ).toBe(
      '/documents/base/pcmso-consolidated/docx/doc-1/company-1?profile=essential',
    );
  });

  it('builds full consolidated URL with explicit profile=full', () => {
    expect(
      buildPcmsoConsolidatedDownloadUrl({
        docId: 'doc-1',
        companyId: 'company-1',
        profile: 'full',
      }),
    ).toBe(
      '/documents/base/pcmso-consolidated/docx/doc-1/company-1?profile=full',
    );
  });

  it('builds avulso GSE URL with companyId and workspaceId', () => {
    expect(
      buildPcmsoExamsByGseDownloadUrl({
        companyId: 'company-1',
        workspaceId: 'workspace-1',
      }),
    ).toBe(
      '/documents/base/pcmso-exams-by-gse/docx/company-1/workspace-1',
    );
  });

  it('exposes the expected PCMSO download labels', () => {
    expect(getPcmsoMainDocumentDownloadLabel()).toBe(
      'Baixar documento sem anexos',
    );
    expect(getPcmsoEssentialDownloadLabel()).toBe(
      'Baixar PCMSO com anexos essenciais',
    );
    expect(getPcmsoFullDownloadLabel()).toBe('Baixar PCMSO completo');
    expect(getPcmsoExamsByGseDownloadLabel()).toBe(
      'Baixar Relação de Riscos e Exames por GSE',
    );
    expect(getPcmsoEssentialRecommendedBadge()).toBe('Recomendado');
  });

  it('exposes short supporting descriptions', () => {
    expect(getPcmsoMainDocumentDownloadDescription()).toContain(
      'sem os anexos',
    );
    expect(getPcmsoEssentialDownloadDescription()).toContain('GSE');
    expect(getPcmsoFullDownloadDescription()).toContain('anexos analíticos');
    expect(getPcmsoExamsByGseDownloadDescription()).toContain(
      'Grupo Similar de Exposição',
    );
  });

  it('keeps Documento and Anexos section titles', () => {
    expect(PCMSO_DOWNLOAD_SECTION_DOCUMENT).toBe('Documento');
    expect(PCMSO_DOWNLOAD_SECTION_ANNEXES).toBe('Anexos');
  });
});
