import { Document, Font } from '@react-pdf/renderer';

import LaudoPcdPage from './components/laudoPcdPage.pdf';

Font.register({
  family: 'Open Sans',
  fonts: [
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-regular.ttf',
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-500.ttf',
      fontWeight: 500, //medium
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-600.ttf',
      fontWeight: 600, //semibold
    },
    {
      src: 'https://cdn.jsdelivr.net/npm/open-sans-all@0.1.3/fonts/open-sans-700.ttf',
      fontWeight: 700, //bold
    },
  ],
});

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
