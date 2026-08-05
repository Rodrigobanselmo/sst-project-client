import {
  buildPgrConsolidatedDownloadUrl,
  getPgrEssentialDownloadLabel,
  getPgrFullDownloadLabel,
  getPgrMainDocumentDownloadLabel,
} from './pgr-download-labels.util';
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

const legacyAttachments = [
  { id: 'att-elemento', name: 'Relação de Exames por Elemento Caracterizável' },
  { id: 'att-hierarquia', name: 'Relação de Exames por Hierarquia' },
  { id: 'att-mesclada', name: 'Relação de Exames por Hierarquia Mesclada' },
];

describe('pcmso-download-modal.util', () => {
  it('builds three document options: sem anexos, essencial and completo', () => {
    const options = buildPcmsoDownloadModalOptions(baseParams);
    const { document } = groupPcmsoDownloadOptionsBySection(options);

    expect(document).toHaveLength(3);
    expect(document.map((o) => o.id)).toEqual([
      'pcmso-main',
      'pcmso-essential',
      'pcmso-full',
    ]);
    expect(document[0].label).toBe('Baixar documento sem anexos');
    expect(document[1].label).toBe('Baixar PCMSO com anexos essenciais');
    expect(document[2].label).toBe('Baixar PCMSO completo');
  });

  it('marks essencial as recommended with badge', () => {
    const { document } = groupPcmsoDownloadOptionsBySection(
      buildPcmsoDownloadModalOptions(baseParams),
    );
    const essential = document.find((o) => o.id === 'pcmso-essential');
    expect(essential?.recommended).toBe(true);
    expect(essential?.badge).toBe('Recomendado');
    expect(document.find((o) => o.id === 'pcmso-full')?.recommended).toBeFalsy();
  });

  it('uses profile=essential for essencial download', () => {
    const essential = buildPcmsoDownloadModalOptions(baseParams).find(
      (o) => o.id === 'pcmso-essential',
    );
    expect(essential?.url).toBe(
      '/documents/base/pcmso-consolidated/docx/doc-pcmso-1/company-1?profile=essential',
    );
  });

  it('uses explicit profile=full for completo download', () => {
    const full = buildPcmsoDownloadModalOptions(baseParams).find(
      (o) => o.id === 'pcmso-full',
    );
    expect(full?.url).toBe(
      '/documents/base/pcmso-consolidated/docx/doc-pcmso-1/company-1?profile=full',
    );
    expect(full?.url).toContain('profile=full');
    expect(full?.url).not.toMatch(/\?profile=essential/);
  });

  it('uses main document route for sem anexos', () => {
    const main = buildPcmsoDownloadModalOptions(baseParams).find(
      (o) => o.id === 'pcmso-main',
    );
    expect(main?.url).toBe('/documents/base/doc-pcmso-1/company-1');
    expect(main?.url).not.toContain('pcmso-consolidated');
  });

  it('adds avulso GSE annex with companyId and workspaceId', () => {
    const gse = buildPcmsoDownloadModalOptions(baseParams).find(
      (o) => o.id === 'pcmso-annex-gse',
    );
    expect(gse?.label).toBe('Baixar Relação de Riscos e Exames por GSE');
    expect(gse?.url).toBe(
      '/documents/base/pcmso-exams-by-gse/docx/company-1/workspace-1',
    );
    expect(gse?.section).toBe('Anexos');
  });

  it('keeps Documento and Anexos sections separated', () => {
    const options = buildPcmsoDownloadModalOptions({
      ...baseParams,
      attachments: legacyAttachments,
    });
    const grouped = groupPcmsoDownloadOptionsBySection(options);

    expect(grouped.document.every((o) => o.section === 'Documento')).toBe(true);
    expect(grouped.annexes.every((o) => o.section === 'Anexos')).toBe(true);
    expect(grouped.document.some((o) => o.id === 'pcmso-annex-gse')).toBe(
      false,
    );
    expect(grouped.annexes.some((o) => o.id === 'pcmso-essential')).toBe(false);
  });

  it('places GSE annex before legacy analytical attachments', () => {
    const { annexes } = groupPcmsoDownloadOptionsBySection(
      buildPcmsoDownloadModalOptions({
        ...baseParams,
        attachments: legacyAttachments,
      }),
    );

    expect(annexes.map((o) => o.id)).toEqual([
      'pcmso-annex-gse',
      'pcmso-attachment-att-elemento',
      'pcmso-attachment-att-hierarquia',
      'pcmso-attachment-att-mesclada',
    ]);
    expect(annexes[1].label).toBe(
      'Baixar Relação de Exames por Elemento Caracterizável',
    );
    expect(annexes[2].label).toBe('Baixar Relação de Exames por Hierarquia');
    expect(annexes[3].label).toBe(
      'Baixar Relação de Exames por Hierarquia Mesclada',
    );
  });

  it('shows Lista de Médicos Examinadores only when present in attachments', () => {
    const withoutDoctors = groupPcmsoDownloadOptionsBySection(
      buildPcmsoDownloadModalOptions({
        ...baseParams,
        attachments: legacyAttachments,
      }),
    ).annexes;
    expect(
      withoutDoctors.some((o) => o.label.includes('Médicos Examinadores')),
    ).toBe(false);

    const withDoctors = groupPcmsoDownloadOptionsBySection(
      buildPcmsoDownloadModalOptions({
        ...baseParams,
        attachments: [
          ...legacyAttachments,
          { id: 'att-medicos', name: 'Lista de Médicos Examinadores' },
        ],
      }),
    ).annexes;

    expect(withDoctors.map((o) => o.id).at(-1)).toBe(
      'pcmso-attachment-att-medicos',
    );
    expect(withDoctors.at(-1)?.label).toBe(
      'Baixar Lista de Médicos Examinadores',
    );
  });

  it('does not regress legacy annex attachment URLs', () => {
    const elemento = buildPcmsoDownloadModalOptions({
      ...baseParams,
      attachments: legacyAttachments,
    }).find((o) => o.id === 'pcmso-attachment-att-elemento');

    expect(elemento?.url).toBe(
      '/documents/base/doc-pcmso-1/attachment/att-elemento/company-1',
    );
  });

  it('tracks loading independently per URL and blocks duplicate click on same URL', () => {
    const essentialUrl =
      '/documents/base/pcmso-consolidated/docx/doc-pcmso-1/company-1?profile=essential';
    const fullUrl =
      '/documents/base/pcmso-consolidated/docx/doc-pcmso-1/company-1?profile=full';

    const loadingEssential = {
      isLoading: true,
      variables: essentialUrl,
    };

    expect(isPcmsoDownloadUrlLoading(essentialUrl, loadingEssential)).toBe(
      true,
    );
    expect(isPcmsoDownloadUrlLoading(fullUrl, loadingEssential)).toBe(false);
    expect(
      isPcmsoDownloadUrlLoading(essentialUrl, {
        isLoading: false,
        variables: essentialUrl,
      }),
    ).toBe(false);
  });

  it('releases loading after success or error (idle mutation)', () => {
    const url =
      '/documents/base/pcmso-consolidated/docx/doc-pcmso-1/company-1?profile=full';
    expect(isPcmsoDownloadUrlLoading(url, { isLoading: false })).toBe(false);
    expect(isPcmsoDownloadUrlLoading(url, {})).toBe(false);
  });

  it('documents friendly error contract: mutation errors do not close modal', () => {
    // Modal keeps open; useMutDownloadFile surfaces API message via handleBlobError.
    // This option builder never emits a close signal.
    const options = buildPcmsoDownloadModalOptions(baseParams);
    expect(options.every((o) => typeof o.url === 'string')).toBe(true);
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
