import { saveAs } from 'file-saver';

export const PRESENTATION_PDF_HREF = '/site/presentation/exports/SimpleSST-Apresentacao.pdf';
export const PRESENTATION_PDF_NAME = 'SimpleSST-Apresentacao.pdf';

export async function downloadPresentationPdf() {
  const response = await fetch(PRESENTATION_PDF_HREF);

  if (!response.ok) {
    throw new Error('Não foi possível baixar o PDF.');
  }

  saveAs(await response.blob(), PRESENTATION_PDF_NAME);
}
