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

/** Mesmos hex da legenda da tela Indicadores (somente referência visual). */
const LEGEND_ITEMS: ReadonlyArray<{
  rangeLabel: string;
  name: string;
  color: string;
}> = [
  { rangeLabel: '0–19%', name: 'Muito negativo', color: '#F44336' },
  { rangeLabel: '20–39%', name: 'Negativo', color: '#d96c2f' },
  { rangeLabel: '40–59%', name: 'Neutro', color: '#d9d10b' },
  { rangeLabel: '60–79%', name: 'Positivo', color: '#8fa728' },
  { rangeLabel: '80–100%', name: 'Muito positivo', color: '#3cbe7d' },
];

const SCALE_MARKS = [0, 20, 40, 60, 80, 100] as const;

function IndicatorsInterpretationLegendPdf() {
  return (
    <View style={s.legendBox}>
      <Text style={s.legendTitle}>Interpretação do indicador de qualidade</Text>
      <Text style={s.legendBody}>
        O percentual exibido representa a qualidade do indicador com base nas
        respostas. Percentuais menores indicam condição mais crítica; percentuais
        maiores, condição mais favorável.
      </Text>
      <Text style={s.legendNote}>
        Quanto maior o percentual, mais favorável é o resultado do indicador.
      </Text>
      {LEGEND_ITEMS.map((item) => (
        <View key={item.name} style={s.legendRow}>
          <View style={[s.legendSwatch, { backgroundColor: item.color }]} />
          <View style={s.legendTextCol}>
            <Text style={s.legendName}>{item.name}</Text>
            <Text style={s.legendRange}>{item.rangeLabel}</Text>
          </View>
        </View>
      ))}
    </View>
  );
}

function IndicatorBarTrackWithScale({
  percentage,
  score,
}: {
  percentage: number;
  score: number;
}) {
  return (
    <View style={s.barScaleWrap}>
      <View style={s.barTrack}>
        <View
          style={[
            s.barFill,
            {
              width: `${percentage}%`,
              backgroundColor: getIndicatorColor(score),
            },
          ]}
        />
      </View>
      <View style={s.scaleTicksRow}>
        {SCALE_MARKS.map((m) => (
          <View key={m} style={s.scaleTick} />
        ))}
      </View>
      <View style={s.scaleLabelsRow}>
        {SCALE_MARKS.map((m) => (
          <Text key={m} style={s.scaleLabel}>
            {m}
          </Text>
        ))}
      </View>
    </View>
  );
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
              {ind.shouldHideData
                ? '🔒'
                : ind.hasValidAnswers
                  ? `${ind.percentage}%`
                  : '—'}
            </Text>
          </View>
          {groupingActive ? (
            <Text style={s.scoreLine}>
              Participantes no grupo: {ind.participantCount}
            </Text>
          ) : null}
          {ind.shouldHideData ? (
            <Text style={s.scoreLine}>
              Dados protegidos (menos de 3 respostas)
            </Text>
          ) : !ind.hasValidAnswers ? (
            <Text style={s.scoreLine}>Sem respostas válidas</Text>
          ) : (
            <>
              <Text style={s.scoreLine}>Score: {ind.score.toFixed(3)}</Text>
              <IndicatorBarTrackWithScale
                percentage={ind.percentage}
                score={ind.score}
              />
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
  barScaleWrap: {
    width: '100%',
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
  scaleTicksRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 2,
    paddingHorizontal: 0,
  },
  scaleTick: {
    width: 1,
    height: 5,
    backgroundColor: '#888888',
    opacity: 0.85,
  },
  scaleLabelsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 2,
  },
  scaleLabel: {
    fontSize: 6,
    color: '#666666',
  },
  legendBox: {
    marginBottom: 14,
    padding: 8,
    border: '1 solid #e0e0e0',
    borderRadius: 4,
    backgroundColor: '#fafafa',
  },
  legendTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: '#222222',
    marginBottom: 6,
  },
  legendBody: {
    fontSize: 8,
    color: '#555555',
    lineHeight: 1.35,
    marginBottom: 4,
  },
  legendNote: {
    fontSize: 7,
    color: '#666666',
    lineHeight: 1.35,
    marginBottom: 8,
  },
  legendRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  legendSwatch: {
    width: 10,
    height: 10,
    borderRadius: 2,
    marginRight: 6,
    marginTop: 1,
    border: '1 solid #dddddd',
  },
  legendTextCol: {
    flex: 1,
  },
  legendName: {
    fontSize: 8,
    fontWeight: 700,
    color: '#222222',
  },
  legendRange: {
    fontSize: 7,
    color: '#666666',
    marginTop: 1,
  },
  empty: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
  },
});

export default function PdfFormIndicators({
  data,
  meta,
}: PdfFormIndicatorsProps) {
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

        <IndicatorsInterpretationLegendPdf />

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
