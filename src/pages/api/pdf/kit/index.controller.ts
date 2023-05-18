import { renderToStream } from '@react-pdf/renderer';
import PdfKitDocument, {
  getKitFileName,
} from 'components/pdfs/documents/kit/kit-medico.pdf';
import type { NextApiRequest, NextApiResponse } from 'next';

import { queryPdfKit } from 'core/services/hooks/queries/pdfs/useQueryPdfKit ';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'GET')
    res.status(405).json({ message: 'Method Not Allowed' });

  try {
    const { companyId, employeeId, asoId, scheduleMedicalVisitId } = req.query;

    const data = await queryPdfKit(
      companyId as string,
      {
        employeeId: employeeId as any,
        asoId: asoId as any,
        scheduleMedicalVisitId: scheduleMedicalVisitId as any,
      },
      { req },
    );

    const pdfBuffer = await renderToStream(PdfKitDocument({ data }));

    // const logoPath = 'public/icons/brand/logo-simple.svg';
    // const logoBuffer = fs.readFileSync(logoPath);

    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader(
      'Content-Disposition',
      `inline; filename="${getKitFileName(data)}.pdf"`,
    );

    pdfBuffer.pipe(res);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}
