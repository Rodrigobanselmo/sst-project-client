import { renderToStream } from '@react-pdf/renderer';
import PdfLaudoPcdDocument from 'components/pdfs/documents/laudoPcd/laudoPcd.pdf';
import type { NextApiRequest, NextApiResponse } from 'next';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET')
    res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const pdfBuffer = await renderToStream(PdfLaudoPcdDocument({}));

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      'inline; filename="Laudo-Caracterizador-OFICIAL.pdf"',
    );

    pdfBuffer.pipe(res);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
