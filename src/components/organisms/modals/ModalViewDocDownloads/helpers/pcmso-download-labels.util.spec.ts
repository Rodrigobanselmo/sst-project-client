import {
  buildPcmsoConsolidatedDownloadUrl,
  getPcmsoFullDownloadLabel,
  getPcmsoMainDocumentDownloadLabel,
} from './pcmso-download-labels.util';

describe('pcmso-download-labels.util', () => {
  it('builds the PCMSO consolidated download URL', () => {
    expect(
      buildPcmsoConsolidatedDownloadUrl({
        docId: 'doc-1',
        companyId: 'company-1',
      }),
    ).toBe('/documents/base/pcmso-consolidated/docx/doc-1/company-1');
  });

  it('exposes the expected PCMSO download labels', () => {
    expect(getPcmsoMainDocumentDownloadLabel()).toBe('Baixar documento (sem anexos)');
    expect(getPcmsoFullDownloadLabel()).toBe(
      'Baixar PCMSO completo (incluindo anexos 1, 2 e 3)',
    );
  });
});
