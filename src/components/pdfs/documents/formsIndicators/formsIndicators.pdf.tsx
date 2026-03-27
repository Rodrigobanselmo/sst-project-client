import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import type {
  IndicatorRowPdf,
  IndicatorsPdfDataset,
} from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/buildIndicatorsPdfDataset';

export type PdfFormIndicatorsProps = {
  data: IndicatorsPdfDataset;
  meta: {
    formName: string;
    applicationName: string;
    issuedAt: string;
  };
};

function getIndicatorColor(value: number): string {
  if (value >= 0.8) return '#3cbe7d';
  if (value >= 0.6) return '#8fa728';
  if (value >= 0.4) return '#d9d10b';
  if (value >= 0.2) return '#d96c2f';
  return '#F44336';
}

function IndicatorRows({
  indicators,
  groupingActive,
  keyPrefix,
}: {
  indicators: IndicatorRowPdf[];
  groupingActive: boolean;
  keyPrefix: string;
}) {
  return (
    <>
      {indicators.map((ind) => (
        <View
          key={`${keyPrefix}-${ind.participantGroupId}`}
          style={s.indicatorRow}
        >
          <View style={s.indicatorHeader}>
            <Text style={s.indicatorName}>
              {groupingActive
                ? ind.participantGroupName
                : 'Indicador consolidado'}
            </Text>
            <Text style={s.indicatorPct}>
              {ind.hasValidAnswers ? `${ind.percentage}%` : '—'}
            </Text>
          </View>
          {groupingActive ? (
            <Text style={s.scoreLine}>
              Participantes no grupo: {ind.participantCount}
            </Text>
          ) : null}
          {!ind.hasValidAnswers ? (
            <Text style={s.scoreLine}>Sem respostas válidas</Text>
          ) : (
            <>
              <Text style={s.scoreLine}>Score: {ind.score.toFixed(3)}</Text>
              <View style={s.barTrack}>
                <View
                  style={[
                    s.barFill,
                    {
                      width: `${ind.percentage}%`,
                      backgroundColor: getIndicatorColor(ind.score),
                    },
                  ]}
                />
              </View>
            </>
          )}
        </View>
      ))}
    </>
  );
}

const s = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 16,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 11,
    color: '#333',
    textAlign: 'center',
    marginBottom: 4,
  },
  issuedAt: {
    fontSize: 9,
    color: '#666',
    textAlign: 'center',
    marginBottom: 12,
  },
  groupingBanner: {
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 8,
    padding: 8,
    backgroundColor: '#e8f4fc',
    border: '1 solid #90caf9',
    borderRadius: 4,
  },
  displayModeBanner: {
    fontSize: 9,
    textAlign: 'center',
    marginBottom: 16,
    padding: 6,
    backgroundColor: '#f5f5f5',
    border: '1 solid #e0e0e0',
    borderRadius: 4,
    color: '#424242',
  },
  groupSection: {
    marginBottom: 18,
  },
  groupTitle: {
    fontSize: 12,
    fontWeight: 700,
    backgroundColor: '#f0f0f0',
    padding: 6,
    marginBottom: 8,
  },
  questionBlock: {
    marginBottom: 12,
    marginLeft: 4,
    paddingLeft: 8,
    borderLeft: '2 solid #bdbdbd',
  },
  questionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#333',
    marginBottom: 6,
  },
  subsectionLabel: {
    fontSize: 9,
    color: '#666',
    marginBottom: 4,
  },
  indicatorRow: {
    marginBottom: 10,
  },
  indicatorHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  indicatorName: {
    fontSize: 10,
    color: '#222',
  },
  indicatorPct: {
    fontSize: 10,
    fontWeight: 700,
    color: '#222',
  },
  scoreLine: {
    fontSize: 8,
    color: '#666',
    marginBottom: 4,
  },
  barTrack: {
    height: 8,
    border: '1 solid #ccc',
    borderRadius: 4,
    overflow: 'hidden',
  },
  barFill: {
    height: '100%',
  },
  empty: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
  },
});

export default function PdfFormIndicators({ data, meta }: PdfFormIndicatorsProps) {
  const groupingLabel =
    data.grouping.active === true
      ? `Agrupamento por identificação: ${data.grouping.questionLabel}`
      : 'Sem agrupamento — indicadores consolidados por grupo do formulário';

  const displayModeLabel = data.showOnlyGroupIndicators
    ? 'Exibição: apenas indicadores por categoria (sem perguntas individuais)'
    : 'Exibição: indicadores por categoria e por pergunta';

  const groupingActive = data.grouping.active;

  return (
    <Document>
      <Page size="A4" style={s.page} wrap>
        <Text style={s.title}>Relatório de Indicadores</Text>
        <Text style={s.subtitle}>Formulário: {meta.formName}</Text>
        <Text style={s.subtitle}>Aplicação: {meta.applicationName}</Text>
        <Text style={s.issuedAt}>Emitido em: {meta.issuedAt}</Text>
        <Text style={s.groupingBanner}>{groupingLabel}</Text>
        <Text style={s.displayModeBanner}>{displayModeLabel}</Text>

        {data.formGroups.length === 0 ? (
          <Text style={s.empty}>
            Não há grupos de perguntas com opções para exibir indicadores nesta
            aplicação.
          </Text>
        ) : (
          data.formGroups.map((group) => (
            <View key={group.groupId} style={s.groupSection}>
              <Text style={s.groupTitle}>{group.groupName}</Text>
              <Text style={s.subsectionLabel}>
                Indicadores por categoria (grupo do formulário)
              </Text>
              <IndicatorRows
                indicators={group.indicators}
                groupingActive={groupingActive}
                keyPrefix={`g-${group.groupId}`}
              />

              {!data.showOnlyGroupIndicators && group.questions?.length ? (
                <>
                  <Text style={[s.subsectionLabel, { marginTop: 8 }]}>
                    Por pergunta
                  </Text>
                  {group.questions.map((q) => (
                    <View key={q.questionId} style={s.questionBlock}>
                      <Text style={s.questionTitle}>{q.questionLabel}</Text>
                      <IndicatorRows
                        indicators={q.indicators}
                        groupingActive={groupingActive}
                        keyPrefix={`g-${group.groupId}-q-${q.questionId}`}
                      />
                    </View>
                  ))}
                </>
              ) : null}
            </View>
          ))
        )}
      </Page>
    </Document>
  );
}
