import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import type { UseScenarioBoardPdfDataset } from '@v2/pages/companies/chemical-products/components/exportUseScenarioBoardPdfInBrowser';

export type PdfUseScenarioBoardProps = {
  data: UseScenarioBoardPdfDataset;
  meta: {
    issuedAt: string;
  };
};

const COLS = [
  { key: 'product', label: 'Produto', width: '16%' },
  { key: 'riskFactors', label: 'Fator(es) de risco', width: '18%' },
  { key: 'activity', label: 'Tarefa', width: '11%' },
  { key: 'sector', label: 'Setor', width: '9%' },
  { key: 'gse', label: 'GSE', width: '7%' },
  { key: 'frequency', label: 'Freq.', width: '8%' },
  { key: 'duration', label: 'Duração', width: '7%' },
  { key: 'quantity', label: 'Qtd', width: '8%' },
  { key: 'sourceRows', label: 'Linhas', width: '6%' },
  { key: 'status', label: 'Status', width: '10%' },
] as const;

const s = StyleSheet.create({
  page: {
    paddingTop: 24,
    paddingBottom: 24,
    paddingHorizontal: 18,
  },
  title: {
    fontSize: 13,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 4,
  },
  issuedAt: {
    fontSize: 8,
    color: '#666',
    textAlign: 'center',
    marginBottom: 6,
  },
  filterLine: {
    fontSize: 8,
    color: '#444',
    textAlign: 'center',
    marginBottom: 2,
  },
  table: {
    marginTop: 8,
    width: '100%',
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderTop: '0.5pt solid #000',
    borderBottom: '0.5pt solid #000',
    borderLeft: '0.5pt solid #000',
  },
  dataRow: {
    flexDirection: 'row',
    borderBottom: '0.5pt solid #000',
    borderLeft: '0.5pt solid #000',
  },
  cell: {
    borderRight: '0.5pt solid #000',
    paddingHorizontal: 3,
    paddingVertical: 3,
    justifyContent: 'center',
  },
  headerText: {
    fontSize: 7,
    fontWeight: 700,
  },
  cellText: {
    fontSize: 7,
  },
});

function Cell({
  width,
  text,
  header,
}: {
  width: string;
  text: string;
  header?: boolean;
}) {
  return (
    <View style={[s.cell, { width }]}>
      <Text style={header ? s.headerText : s.cellText}>{text}</Text>
    </View>
  );
}

export default function PdfUseScenarioBoard({
  data,
  meta,
}: PdfUseScenarioBoardProps) {
  return (
    <Document>
      <Page size="A4" orientation="landscape" style={s.page} wrap>
        <Text style={s.title}>Cenários de uso de produtos químicos</Text>
        <Text style={s.issuedAt}>Emitido em: {meta.issuedAt}</Text>
        {data.filterSummary.length ? (
          <Text style={s.filterLine}>
            Recorte: {data.filterSummary.join(' · ')}
          </Text>
        ) : (
          <Text style={s.filterLine}>Recorte: todos os cenários visíveis</Text>
        )}
        <View style={s.table}>
          <View wrap={false} fixed style={s.headerRow}>
            {COLS.map((col) => (
              <Cell key={col.key} width={col.width} text={col.label} header />
            ))}
          </View>
          {data.rows.map((row) => (
            <View wrap={false} key={row.id} style={s.dataRow}>
              {COLS.map((col) => (
                <Cell key={col.key} width={col.width} text={row[col.key]} />
              ))}
            </View>
          ))}
        </View>
      </Page>
    </Document>
  );
}
