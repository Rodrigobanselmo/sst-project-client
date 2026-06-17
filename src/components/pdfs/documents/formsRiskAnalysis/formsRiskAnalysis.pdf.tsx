import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import type {
  RiskAnalysisPdfDataset,
  RiskAnalysisPdfRecommendationItem,
} from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/buildRiskAnalysisPdfDataset';

export type PdfFormRiskAnalysisProps = {
  data: RiskAnalysisPdfDataset;
  meta: {
    formName: string;
    applicationName: string;
    issuedAt: string;
  };
};

type NarrativeBlock =
  | { type: 'heading'; level: 1 | 2 | 3; text: string }
  | { type: 'bullet'; text: string }
  | { type: 'numbered'; text: string }
  | { type: 'paragraph'; text: string };

function parseNarrativeMarkdown(markdown: string): NarrativeBlock[] {
  const lines = markdown
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);

  return lines.map((line) => {
    if (line.startsWith('### ')) {
      return { type: 'heading', level: 3, text: line.slice(4).trim() };
    }
    if (line.startsWith('## ')) {
      return { type: 'heading', level: 2, text: line.slice(3).trim() };
    }
    if (line.startsWith('# ')) {
      return { type: 'heading', level: 1, text: line.slice(2).trim() };
    }
    if (/^[-*]\s+/.test(line)) {
      return { type: 'bullet', text: line.replace(/^[-*]\s+/, '').trim() };
    }
    if (/^\d+\.\s+/.test(line)) {
      return { type: 'numbered', text: line.replace(/^\d+\.\s+/, '').trim() };
    }
    return { type: 'paragraph', text: line };
  });
}

function Badge({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  return (
    <View style={[s.badge, { backgroundColor: color }]}>
      <Text style={s.badgeText}>
        {label}: {value}
      </Text>
    </View>
  );
}

function RecommendationList({
  title,
  items,
}: {
  title: string;
  items: RiskAnalysisPdfRecommendationItem[];
}) {
  if (items.length === 0) return null;

  return (
    <View style={s.recSection}>
      <Text style={s.recTitle}>{title}</Text>
      {items.map((item, index) => (
        <View key={`${title}-${index}`} style={s.recItem}>
          <Text style={s.recName}>• {item.nome}</Text>
          {item.justificativa ? (
            <Text style={s.recJustification}>{item.justificativa}</Text>
          ) : null}
        </View>
      ))}
    </View>
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
    marginBottom: 16,
    padding: 8,
    backgroundColor: '#e8f4fc',
    border: '1 solid #90caf9',
    borderRadius: 4,
  },
  narrativeSection: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#f8fbff',
    border: '1 solid #dce8f5',
    borderRadius: 4,
  },
  narrativeTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1f3b5b',
    marginBottom: 8,
  },
  narrativeHeading1: {
    fontSize: 10,
    fontWeight: 700,
    color: '#1f3b5b',
    marginTop: 6,
    marginBottom: 4,
  },
  narrativeHeading2: {
    fontSize: 9,
    fontWeight: 700,
    color: '#274d77',
    marginTop: 5,
    marginBottom: 3,
  },
  narrativeHeading3: {
    fontSize: 8.5,
    fontWeight: 700,
    color: '#365f8f',
    marginTop: 4,
    marginBottom: 2,
  },
  narrativeParagraph: {
    fontSize: 8.5,
    lineHeight: 1.45,
    color: '#2b2b2b',
    marginBottom: 3,
  },
  narrativeListItem: {
    fontSize: 8.5,
    lineHeight: 1.45,
    color: '#2b2b2b',
    marginBottom: 2,
    marginLeft: 8,
  },
  factorSection: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottom: '1 solid #e0e0e0',
  },
  factorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  typeBadge: {
    fontSize: 8,
    fontWeight: 700,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 3,
    backgroundColor: '#fff8e1',
    border: '1 solid #f9a825',
    color: '#f57f17',
  },
  factorName: {
    fontSize: 12,
    fontWeight: 700,
    color: '#222',
    flex: 1,
  },
  establishmentTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#555',
    marginTop: 6,
    marginBottom: 6,
  },
  sectorBlock: {
    marginBottom: 10,
    padding: 8,
    backgroundColor: '#fafafa',
    border: '1 solid #eeeeee',
    borderRadius: 4,
  },
  sectorHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
    flexWrap: 'wrap',
    gap: 4,
  },
  sectorType: {
    fontSize: 8,
    color: '#666',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 2,
  },
  sectorName: {
    fontSize: 10,
    fontWeight: 600,
    color: '#333',
    flex: 1,
  },
  badgesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
    marginBottom: 4,
  },
  badge: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 3,
    border: '1 solid #dddddd',
  },
  badgeText: {
    fontSize: 8,
    color: '#222',
  },
  aiNote: {
    fontSize: 8,
    color: '#666',
    fontStyle: 'italic',
    marginBottom: 4,
  },
  recSection: {
    marginTop: 6,
    marginLeft: 4,
  },
  recTitle: {
    fontSize: 9,
    fontWeight: 700,
    color: '#333',
    marginBottom: 4,
  },
  recItem: {
    marginBottom: 4,
  },
  recName: {
    fontSize: 8,
    color: '#222',
    lineHeight: 1.35,
  },
  recJustification: {
    fontSize: 7,
    color: '#666',
    marginLeft: 8,
    marginTop: 2,
    lineHeight: 1.35,
  },
  empty: {
    fontSize: 10,
    color: '#666',
    textAlign: 'center',
    marginTop: 24,
  },
  summarySection: {
    marginBottom: 16,
    padding: 10,
    backgroundColor: '#f5f5f5',
    border: '1 solid #e0e0e0',
    borderRadius: 4,
  },
  summaryTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#333',
    marginBottom: 6,
  },
  summaryLine: {
    fontSize: 8.5,
    color: '#444',
    lineHeight: 1.4,
    marginBottom: 2,
  },
  viewSectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#333',
    marginTop: 8,
    marginBottom: 8,
  },
  traceabilityLine: {
    fontSize: 7.5,
    color: '#666',
    marginBottom: 4,
    lineHeight: 1.35,
  },
});

export default function PdfFormRiskAnalysis({
  data,
  meta,
}: PdfFormRiskAnalysisProps) {
  const groupingLabel = data.isConsolidatedView
    ? data.grouping.active === true
      ? `Recorte: ${data.grouping.questionLabel}`
      : 'Recorte: visão consolidada read-only'
    : data.grouping.active === true
      ? `Recorte: agrupamento por identificação — ${data.grouping.questionLabel}`
      : 'Recorte: todos os participantes (sem agrupamento)';
  const narrativeBlocks =
    data.narrativeDiagnosticMarkdown?.trim()
      ? parseNarrativeMarkdown(data.narrativeDiagnosticMarkdown)
      : [];
  const narrativeTitle =
    data.narrativeSectionTitle ?? 'Diagnóstico narrativo com IA';
  const sectionsToRender =
    data.viewSections && data.viewSections.length > 0
      ? data.viewSections
      : [{ label: '', factors: data.factors }];

  return (
    <Document>
      <Page size="A4" style={s.page} wrap>
        <Text style={s.title}>Relatório de Análise de Riscos</Text>
        <Text style={s.subtitle}>Formulário: {meta.formName}</Text>
        <Text style={s.subtitle}>Aplicação: {meta.applicationName}</Text>
        <Text style={s.issuedAt}>Emitido em: {meta.issuedAt}</Text>
        <Text style={s.groupingBanner}>{groupingLabel}</Text>

        {data.consolidatedSummary && data.consolidatedSummary.length > 0 ? (
          <View style={s.summarySection}>
            <Text style={s.summaryTitle}>Resumo consolidado</Text>
            {data.consolidatedSummary.map((line, index) => (
              <Text key={`summary-${index}`} style={s.summaryLine}>
                • {line}
              </Text>
            ))}
          </View>
        ) : null}

        {narrativeBlocks.length > 0 ? (
          <View style={s.narrativeSection}>
            <Text style={s.narrativeTitle}>{narrativeTitle}</Text>
            {narrativeBlocks.map((block, index) => {
              if (block.type === 'heading') {
                const headingStyle =
                  block.level === 1
                    ? s.narrativeHeading1
                    : block.level === 2
                      ? s.narrativeHeading2
                      : s.narrativeHeading3;
                return (
                  <Text key={`narrative-heading-${index}`} style={headingStyle}>
                    {block.text}
                  </Text>
                );
              }

              if (block.type === 'bullet') {
                return (
                  <Text key={`narrative-bullet-${index}`} style={s.narrativeListItem}>
                    • {block.text}
                  </Text>
                );
              }

              if (block.type === 'numbered') {
                return (
                  <Text key={`narrative-numbered-${index}`} style={s.narrativeListItem}>
                    - {block.text}
                  </Text>
                );
              }

              return (
                <Text key={`narrative-paragraph-${index}`} style={s.narrativeParagraph}>
                  {block.text}
                </Text>
              );
            })}
          </View>
        ) : null}

        {data.factors.length === 0 ? (
          <Text style={s.empty}>
            Nenhum fator de risco identificado para o recorte selecionado.
          </Text>
        ) : (
          sectionsToRender.map((viewSection, sectionIndex) => (
            <View key={`view-section-${sectionIndex}`}>
              {viewSection.label ? (
                <Text style={s.viewSectionTitle}>
                  {viewSection.label} (
                  {viewSection.itemCount ?? viewSection.factors.length})
                </Text>
              ) : null}

              {viewSection.factors.map((factor) => (
            <View key={factor.riskId} style={s.factorSection}>
              <View style={s.factorHeader}>
                <Text style={s.typeBadge}>{factor.typeLabel}</Text>
                <Text style={s.factorName}>{factor.name}</Text>
              </View>

              {factor.establishmentBlocks.map((block) => (
                <View key={`${factor.riskId}-${block.establishment || 'all'}`}>
                  {block.establishment ? (
                    <Text style={s.establishmentTitle}>{block.establishment}</Text>
                  ) : null}

                  {block.sectors.map((sector, sectorIndex) => (
                    <View
                      key={`${factor.riskId}-${block.establishment}-${sectorIndex}`}
                      style={s.sectorBlock}
                    >
                      <View style={s.sectorHeader}>
                        <Text style={s.sectorType}>{sector.sectorTypeLabel}</Text>
                        <Text style={s.sectorName}>{sector.sectorName}</Text>
                      </View>

                      {sector.traceabilityLine ? (
                        <Text style={s.traceabilityLine}>
                          {sector.traceabilityLine}
                        </Text>
                      ) : null}

                      <View style={s.badgesRow}>
                        <Badge
                          label="Probabilidade"
                          value={sector.classification.probabilityLabel}
                          color={sector.classification.probabilityColor}
                        />
                        <Badge
                          label="Severidade"
                          value={sector.classification.severityLabel}
                          color={sector.classification.severityColor}
                        />
                        <Badge
                          label="Risco Ocupacional"
                          value={sector.classification.occupationalRiskLabel}
                          color={sector.classification.occupationalRiskColor}
                        />
                      </View>

                      {sector.aiAnalysisSource === 'hierarchy_group_fallback' ? (
                        <Text style={s.aiNote}>
                          Análise aplicada pelo agrupamento de setores.
                        </Text>
                      ) : null}

                      {sector.aiConfidencePercent != null ? (
                        <Text style={s.aiNote}>
                          Análise de IA disponível — confiança:{' '}
                          {sector.aiConfidencePercent}%
                        </Text>
                      ) : null}

                      <RecommendationList
                        title="Fontes Geradoras"
                        items={sector.fontesGeradoras}
                      />
                      <RecommendationList
                        title="Recomendações (Medidas de Engenharia)"
                        items={sector.medidasEngenharia}
                      />
                      <RecommendationList
                        title="Recomendações (Medidas Administrativas)"
                        items={sector.medidasAdministrativas}
                      />
                    </View>
                  ))}
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
