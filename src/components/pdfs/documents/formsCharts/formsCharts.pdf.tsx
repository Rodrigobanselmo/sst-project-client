import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import { FormChartDistributionPdf } from 'components/pdfs/shared/FormChartDistributionPdf';

import type { FormChartsPdfDataset } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/buildFormChartsPdfDataset';
import type { PieRowPdf } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/buildFormChartsPdfDataset';

export type PdfFormChartsProps = {
  data: FormChartsPdfDataset;
  meta: {
    formName: string;
    applicationName: string;
    issuedAt: string;
  };
};

function mapRowsToChartDistribution(rows: PieRowPdf[]) {
  return rows.map((row, index) => ({
    id: `${row.optionLabel}-${index}`,
    label: row.optionLabel,
    count: row.count,
    percentage: row.percentage,
    color: row.color ?? '#9e9e9e',
    optionValue: row.optionValue,
  }));
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
                <FormChartDistributionPdf
                  rows={mapRowsToChartDistribution(chart.rows)}
                  totalAnswers={chart.totalAnswers}
                  chartType={data.chartType}
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
                      {pg.shouldHideData ? (
                        <Text style={s.empty}>
                          🔒 Dados protegidos (menos de 3 respostas)
                        </Text>
                      ) : (
                        <FormChartDistributionPdf
                          rows={mapRowsToChartDistribution(pg.rows)}
                          totalAnswers={pg.totalAnswers}
                          chartType={data.chartType}
                        />
                      )}
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
