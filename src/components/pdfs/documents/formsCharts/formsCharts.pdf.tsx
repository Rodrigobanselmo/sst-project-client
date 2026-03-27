import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import type { FormChartsPdfDataset } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/buildFormChartsPdfDataset';

export type PdfFormChartsProps = {
  data: FormChartsPdfDataset;
  meta: {
    formName: string;
    applicationName: string;
    issuedAt: string;
  };
};

function getColorByValue(value?: number): string {
  if (value === undefined || value === 0) {
    return '#9e9e9e';
  }
  if (value > 5) {
    return '#2196f3';
  }
  const valueColorMap: Record<number, string> = {
    5: '#3cbe7d',
    4: '#8fa728',
    3: '#d9d10b',
    2: '#d96c2f',
    1: '#F44336',
  };
  return valueColorMap[value] || '#9e9e9e';
}

const identifierColors = [
  '#FF6B6B',
  '#4ECDC4',
  '#FFEAA7',
  '#00c8f5',
  '#DDA0DD',
  '#F8C471',
  '#F7DC6F',
  '#98D8C8',
  '#BB8FCE',
  '#85C1E9',
  '#96CEB4',
  '#82E0AA',
];

function DistributionTable({
  rows,
  totalAnswers,
  colorScheme,
}: {
  rows: FormChartsPdfDataset['formGroups'][0]['questions'][0]['byParticipantGroup'][0]['rows'];
  totalAnswers: number;
  colorScheme: 'identifier' | 'general';
}) {
  if (rows.length === 0) {
    return <Text style={s.muted}>Nenhuma resposta encontrada</Text>;
  }
  return (
    <View>
      {rows.map((row, idx) => {
        const color =
          colorScheme === 'identifier'
            ? identifierColors[idx % identifierColors.length]
            : getColorByValue(row.optionValue);
        return (
          <View key={`${row.optionLabel}-${idx}`} style={s.optionBlock}>
            <View style={s.optionLine}>
              <View style={s.labelWithSwatch}>
                <View style={[s.swatch, { backgroundColor: color }]} />
                <Text style={s.optionText}>{row.optionLabel}</Text>
              </View>
              <Text style={s.optionNum}>{row.count}</Text>
              <Text style={s.optionNum}>{row.percentage}%</Text>
            </View>
            <View style={s.barTrack}>
              <View
                style={[
                  s.barFill,
                  {
                    width: `${row.percentage}%`,
                    backgroundColor: color,
                  },
                ]}
              />
            </View>
          </View>
        );
      })}
      <Text style={s.totalLine}>Total: {totalAnswers} resposta(s)</Text>
    </View>
  );
}

const s = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 15,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 3,
  },
  issuedAt: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  banner: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 14,
  },
  sectionHeading: {
    fontSize: 11,
    fontWeight: 700,
    marginTop: 12,
    marginBottom: 8,
  },
  categoryName: {
    fontSize: 9,
    fontWeight: 700,
    marginBottom: 4,
  },
  questionHeading: {
    fontSize: 10,
    fontWeight: 700,
    marginBottom: 6,
  },
  questionSection: {
    marginBottom: 16,
  },
  formCategoryHeading: {
    fontSize: 10,
    fontWeight: 700,
    marginTop: 14,
    marginBottom: 10,
  },
  participantLine: {
    fontSize: 9,
    fontWeight: 600,
    marginTop: 6,
    marginBottom: 4,
    color: '#333',
  },
  participantLineFirst: {
    fontSize: 9,
    fontWeight: 600,
    marginTop: 0,
    marginBottom: 4,
    color: '#333',
  },
  muted: {
    fontSize: 9,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  optionBlock: {
    marginBottom: 3,
  },
  optionLine: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  labelWithSwatch: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    marginRight: 8,
  },
  swatch: {
    width: 6,
    height: 6,
    marginRight: 6,
    marginTop: 2,
  },
  optionText: {
    fontSize: 9,
    flex: 1,
  },
  optionNum: {
    fontSize: 9,
    width: 32,
    textAlign: 'right',
  },
  barTrack: {
    height: 4,
    marginTop: 2,
    marginLeft: 12,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  totalLine: {
    fontSize: 9,
    fontWeight: 700,
    marginTop: 6,
  },
  empty: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
  },
});

export default function PdfFormCharts({ data, meta }: PdfFormChartsProps) {
  const groupingLabel =
    data.grouping.active === true
      ? `Agrupamento por identificação: ${data.grouping.questionLabel}`
      : 'Sem agrupamento — distribuições consolidadas com todos os participantes';

  return (
    <Document>
      <Page size="A4" style={s.page} wrap>
        <Text style={s.title}>Relatório de Gráficos</Text>
        <Text style={s.subtitle}>Formulário: {meta.formName}</Text>
        <Text style={s.subtitle}>Aplicação: {meta.applicationName}</Text>
        <Text style={s.issuedAt}>Emitido em: {meta.issuedAt}</Text>
        <Text style={s.banner}>{groupingLabel}</Text>

        {data.identifierCharts.length > 0 ? (
          <>
            <Text style={s.sectionHeading}>Informações de Identificação</Text>
            {data.identifierCharts.map((chart) => (
              <View key={chart.questionId} style={s.questionSection}>
                <Text style={s.categoryName}>{chart.groupName}</Text>
                <Text style={s.questionHeading}>{chart.questionLabel}</Text>
                <DistributionTable
                  rows={chart.rows}
                  totalAnswers={chart.totalAnswers}
                  colorScheme="identifier"
                />
              </View>
            ))}
          </>
        ) : null}

        <Text style={s.sectionHeading}>Perguntas gerais</Text>

        {data.formGroups.length === 0 ? (
          <Text style={s.empty}>
            Não há perguntas com opções para exibir nesta aplicação.
          </Text>
        ) : (
          data.formGroups.map((fg) => (
            <View key={fg.groupId}>
              <Text style={s.formCategoryHeading}>{fg.groupName}</Text>
              {fg.questions.map((q) => (
                <View key={q.questionId} style={s.questionSection}>
                  <Text style={s.questionHeading}>{q.questionLabel}</Text>
                  {q.byParticipantGroup.map((pg, idx) => (
                    <View key={pg.participantGroupId}>
                      <Text
                        style={
                          idx === 0 ? s.participantLineFirst : s.participantLine
                        }
                      >
                        {pg.participantGroupName} ({pg.participantCount}{' '}
                        participantes)
                      </Text>
                      <DistributionTable
                        rows={pg.rows}
                        totalAnswers={pg.totalAnswers}
                        colorScheme="general"
                      />
                    </View>
                  ))}
                </View>
              ))}
            </View>
          ))
        )}
      </Page>
    </Document>
  );
}
