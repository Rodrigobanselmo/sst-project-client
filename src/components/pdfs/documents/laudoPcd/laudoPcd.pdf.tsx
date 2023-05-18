import { Document } from '@react-pdf/renderer';

import LaudoPcdPage from './components/laudoPcdPage.pdf';

export default function PdfLaudoPcdDocument({
  documentProps,
}: {
  documentProps?: { onRender?: () => void };
}) {
  return (
    <Document
      subject={'Laudo PCD'}
      author={'simpleSST'}
      creator={'simpleSST'}
      producer={'simpleSST'}
      keywords={'Laudo, PCD'}
      title={'Laudo-Caracterizador-OFICIAL.pdf'}
      {...documentProps}
    >
      <LaudoPcdPage />
    </Document>
  );
}
