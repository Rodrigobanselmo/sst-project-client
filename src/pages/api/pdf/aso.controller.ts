// import { renderToStream, renderToString } from '@react-pdf/renderer';
// import PdfKitDocument from 'components/pdfs/documents/kit/kit-medico.pdf';
// import PDFTest from 'components/pdfs/documents/test/test.pdf';
import type { NextApiRequest, NextApiResponse } from 'next';
// import PDFMerger from 'pdf-merger-js';
// import { Readable } from 'stream';

// import { queryPdfKit } from 'core/services/hooks/queries/pdfs/useQueryPdfKit ';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  // function uint8ArrayToReadableStream(uint8Array: any) {
  //   const stream = new Readable();
  //   let offset = 0;
  //   stream._read = () => {
  //     const chunk = uint8Array.slice(offset, offset + 4096);
  //     offset += chunk.length;
  //     if (chunk.length === 0) {
  //       stream.push(null);
  //     } else {
  //       stream.push(chunk);
  //     }
  //   };
  //   return stream;
  // }
  // function bufferToReadableStream(buffer: Buffer) {
  //   const stream = new Readable();
  //   stream.push(buffer);
  //   stream.push(null); // Signal the end of the stream
  //   return stream;
  // }
  // async function mergePdfsFromBuffers(pdfBuffers: any) {
  //   const merger = new PDFMerger();
  //   for (const pdfBuffer of pdfBuffers) {
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //     await merger.add(pdfBuffer);
  //   }
  //   // Save the merged PDF as a buffer
  //   const mergedPdf = await merger.saveAsBuffer();
  //   return mergedPdf;
  // }
  // try {
  //   const data = await queryPdfKit(
  //     '79b887c7-396f-4116-afc5-59ec00e4537f',
  //     {
  //       employeeId: 7596,
  //       asoId: 603,
  //       // scheduleMedicalVisitId: 6,
  //     },
  //     { req },
  //   );
  //   const pdfString = await renderToString(
  //     PdfKitDocument({
  //       data,
  //     }),
  //   );
  //   const pdfBuffer = await mergePdfsFromBuffers([
  //     Buffer.from(pdfString),
  //     Buffer.from(pdfString),
  //   ]);
  //   res.setHeader('Content-Type', 'application/pdf');
  //   res.setHeader('Content-Disposition', 'inline; filename="document.pdf"');
  //   const readableStream = bufferToReadableStream(pdfBuffer);
  //   readableStream.pipe(res);
  // } catch (err: any) {
  //   res.status(500).json({ error: err.message });
  // }
}
