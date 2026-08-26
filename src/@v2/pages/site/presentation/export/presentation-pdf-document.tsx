import { Document, Image, Page, StyleSheet } from '@react-pdf/renderer';

const PAGE_WIDTH = 1920;
const PAGE_HEIGHT = 1080;

const styles = StyleSheet.create({
  page: {
    padding: 0,
    margin: 0,
    backgroundColor: '#ffffff',
  },
  image: {
    width: PAGE_WIDTH,
    height: PAGE_HEIGHT,
  },
});

type PresentationPdfDocumentProps = {
  pages: string[];
};

export function PresentationPdfDocument({ pages }: PresentationPdfDocumentProps) {
  return (
    <Document title="SimpleSST — Apresentação" author="SimpleSST" pageMode="fullScreen">
      {pages.map((src, index) => (
        <Page
          key={`presentation-page-${index + 1}`}
          size={[PAGE_WIDTH, PAGE_HEIGHT]}
          style={styles.page}
        >
          <Image src={src} style={styles.image} />
        </Page>
      ))}
    </Document>
  );
}
