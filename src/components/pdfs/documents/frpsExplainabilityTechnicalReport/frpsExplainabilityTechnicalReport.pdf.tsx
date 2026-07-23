import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import {
  buildFrpsExplainabilityReportGroups,
  type FrpsReportValidatedEntry,
} from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/buildFrpsExplainabilityReportGroups';
import { FRPS_EXPLAINABILITY_UI_COPY } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/components/FormRisksAnalysis/frps-explainability/frps-explainability-ui-copy';
import type {
  FrpsExplainabilityTechnicalReportResult,
  FrpsTechnicalReportConceptualContent,
  FrpsTechnicalReportContextualAnalysis,
  FrpsTechnicalReportContextualContent,
  FrpsTechnicalReportItemType,
  FrpsTechnicalReportPendingItem,
  FrpsTechnicalReportValidatedItem,
} from '@v2/services/forms/form-questions-answers-analysis/frps-explainability-technical-report/frps-explainability-technical-report.types';

export type FrpsExplainabilityTechnicalReportPdfProps = {
  data: FrpsExplainabilityTechnicalReportResult;
};

const s = StyleSheet.create({
  page: {
    paddingTop: 40,
    paddingBottom: 40,
    paddingHorizontal: 40,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 15,
    fontWeight: 700,
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 10,
    color: '#333',
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
    padding: 8,
    backgroundColor: '#e8f4fc',
    border: '1 solid #90caf9',
    borderRadius: 4,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1f3b5b',
    marginBottom: 8,
    marginTop: 6,
  },
  subsectionTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#274d77',
    marginBottom: 6,
    marginTop: 8,
  },
  summaryRow: {
    fontSize: 9,
    color: '#333',
    marginBottom: 3,
  },
  frpsHeader: {
    marginBottom: 8,
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: '#1f3b5b',
    borderRadius: 4,
  },
  frpsHeaderText: {
    fontSize: 12,
    fontWeight: 700,
    color: '#ffffff',
  },
  card: {
    marginBottom: 12,
    padding: 10,
    border: '1 solid #e0e0e0',
    borderRadius: 4,
    backgroundColor: '#fafafa',
  },
  referenceCard: {
    marginBottom: 8,
    padding: 8,
    border: '1 solid #d0d7de',
    borderRadius: 4,
    backgroundColor: '#f5f7fa',
  },
  cardHeader: {
    fontSize: 11,
    fontWeight: 700,
    color: '#1f3b5b',
    marginBottom: 4,
  },
  cardMeta: {
    fontSize: 8.5,
    color: '#555',
    marginBottom: 2,
  },
  fieldLabel: {
    fontSize: 8.5,
    fontWeight: 700,
    color: '#274d77',
    marginTop: 6,
    marginBottom: 2,
  },
  fieldText: {
    fontSize: 8.5,
    lineHeight: 1.4,
    color: '#2b2b2b',
  },
  listItem: {
    fontSize: 8.5,
    lineHeight: 1.4,
    color: '#2b2b2b',
    marginLeft: 8,
    marginBottom: 1,
  },
  pendingRow: {
    fontSize: 8.5,
    color: '#333',
    marginBottom: 4,
    paddingBottom: 4,
    borderBottom: '1 solid #eee',
  },
  emptyText: {
    fontSize: 8.5,
    color: '#666',
    marginBottom: 4,
    fontStyle: 'italic',
  },
  noteText: {
    fontSize: 8.5,
    color: '#444',
    marginBottom: 6,
    lineHeight: 1.4,
  },
  notApplicableBox: {
    marginBottom: 10,
    padding: 10,
    border: '1 solid #d0d7de',
    borderRadius: 4,
    backgroundColor: '#f5f7fa',
  },
  contextualSection: {
    marginTop: 14,
  },
  contextualBadge: {
    alignSelf: 'flex-start',
    fontSize: 7.5,
    fontWeight: 700,
    letterSpacing: 0.6,
    color: '#0d47a1',
    backgroundColor: 'rgba(25, 118, 210, 0.08)',
    border: '1 solid rgba(25, 118, 210, 0.22)',
    borderRadius: 3,
    paddingVertical: 2,
    paddingHorizontal: 6,
    marginBottom: 6,
  },
  contextualTitle: {
    fontSize: 10,
    fontWeight: 700,
    color: '#1f3b5b',
    marginBottom: 4,
    lineHeight: 1.35,
  },
  contextualIntro: {
    fontSize: 8,
    color: '#555',
    lineHeight: 1.45,
    marginBottom: 8,
  },
  contextualCard: {
    padding: 10,
    borderRadius: 4,
    border: '1 solid rgba(25, 118, 210, 0.22)',
    backgroundColor: 'rgba(25, 118, 210, 0.035)',
  },
  contextualUsageLabel: {
    fontSize: 8,
    color: '#1e3a5f',
    marginBottom: 6,
    fontWeight: 700,
  },
  contextualStatusValidated: {
    fontSize: 8,
    fontWeight: 700,
    color: '#1b5e20',
    marginBottom: 4,
  },
  contextualStatusDraft: {
    fontSize: 8,
    fontWeight: 700,
    color: '#8a6d1d',
    marginBottom: 4,
  },
  contextualAudit: {
    fontSize: 7.5,
    color: '#555',
    marginBottom: 6,
  },
  contextualDraftBanner: {
    alignSelf: 'flex-start',
    fontSize: 7.5,
    fontWeight: 700,
    color: '#8a6d1d',
    backgroundColor: 'rgba(255, 193, 7, 0.12)',
    border: '1 solid rgba(183, 149, 11, 0.35)',
    borderRadius: 3,
    paddingVertical: 3,
    paddingHorizontal: 6,
    marginBottom: 6,
  },
});

/** Copy específica do PDF do relatório (não altera o drawer). */
const TECHNICAL_REPORT_CONTEXTUAL_COPY = {
  badge: 'ANÁLISE CONTEXTUAL',
  validatedSeal: 'Validada',
  validatedAudit: (name: string, dateLabel: string) =>
    `Validado por ${name} em ${dateLabel}`,
  draftWarning: 'Gerado por IA — pendente de validação profissional',
} as const;

const SCENARIO_LABELS: Record<string, string> = {
  FAVORAVEL: 'Favorável',
  INTERMEDIARIO: 'Intermediário',
  DESFAVORAVEL: 'Desfavorável',
};

function itemTypeLabel(type: FrpsTechnicalReportItemType): string {
  if (type === 'GENERATE_SOURCE') return 'Fonte Geradora';
  if (type === 'REC_MED_ENGINEERING') return 'Medida de Engenharia';
  return 'Medida Administrativa';
}

function pendingReasonLabel(reason: string): string {
  const map: Record<string, string> = {
    NEVER_GENERATED: 'Nunca gerado',
    DRAFT_AI: 'Rascunho de IA',
    REJECTED: 'Rejeitado',
    SUPERSEDED: 'Substituído',
    CUSTOM: 'Item customizado',
    MISSING_CATALOG_ID: 'Sem catálogo',
    GLOBAL_CATALOG_LINK_REQUIRED: 'Sem equivalência global',
    NO_EXPLANATION: 'Sem explicação utilizável',
  };
  return map[reason] ?? reason;
}

function contextualJustificationTitle(
  itemType: FrpsTechnicalReportItemType,
): string {
  return itemType === 'GENERATE_SOURCE'
    ? FRPS_EXPLAINABILITY_UI_COPY.contextualJustificationTitleSource
    : FRPS_EXPLAINABILITY_UI_COPY.contextualJustificationTitleRecommendation;
}

function hasContextualContent(
  content: FrpsTechnicalReportContextualContent | null | undefined,
): boolean {
  if (!content) return false;
  return Object.values(content).some((value) => {
    if (value == null) return false;
    return String(value).trim().length > 0;
  });
}

function Field({
  label,
  value,
}: {
  label: string;
  value?: string | string[] | null;
}) {
  if (value == null) return null;
  if (Array.isArray(value)) {
    if (!value.length) return null;
    return (
      <View>
        <Text style={s.fieldLabel}>{label}</Text>
        {value.map((item, index) => (
          <Text key={`${label}-${index}`} style={s.listItem}>
            • {item}
          </Text>
        ))}
      </View>
    );
  }
  if (!String(value).trim()) return null;
  return (
    <View>
      <Text style={s.fieldLabel}>{label}</Text>
      <Text style={s.fieldText}>{value}</Text>
    </View>
  );
}

function SourceFields({ content }: { content: FrpsTechnicalReportConceptualContent }) {
  return (
    <View>
      <Field label="Objetivo / Definição" value={content.definition} />
      <Field
        label="Relação com o fator de risco"
        value={content.relationToRiskFactor}
      />
      <Field
        label="Perguntas mensuráveis relacionadas"
        value={content.measurableQuestions}
      />
      <Field
        label="Manifestações organizacionais"
        value={content.organizationalManifestations}
      />
      <Field label="Sinais favoráveis" value={content.favorableSignals} />
      <Field label="Sinais intermediários" value={content.intermediateSignals} />
      <Field label="Sinais desfavoráveis" value={content.unfavorableSignals} />
      <Field
        label="Limites de interpretação"
        value={content.interpretationLimits}
      />
      <Field
        label="Validação profissional"
        value={content.professionalValidationGuidance}
      />
    </View>
  );
}

function RecommendationFields({
  content,
}: {
  content: FrpsTechnicalReportConceptualContent;
}) {
  return (
    <View>
      <Field label="Objetivo" value={content.objective} />
      <Field
        label="Relação com o fator de risco"
        value={content.relationToRiskFactor}
      />
      <Field
        label="Perguntas mensuráveis relacionadas"
        value={content.measurableQuestions}
      />
      <Field
        label="Contribuição esperada para redução do risco"
        value={content.whyItMayReduceRisk}
      />
      <Field
        label="Orientações de implementação"
        value={content.implementationGuidance}
      />
      <Field label="Exemplos práticos" value={content.practicalExamples} />
      <Field label="Resultados esperados" value={content.expectedResults} />
      <Field
        label="Indicadores de acompanhamento"
        value={content.monitoringIndicators}
      />
      <Field
        label="Limitações e cuidados"
        value={content.limitationsAndCautions}
      />
      <Field
        label="Validação profissional"
        value={content.professionalValidationGuidance}
      />
    </View>
  );
}

function ContextualFields({
  itemType,
  content,
}: {
  itemType: FrpsTechnicalReportItemType;
  content: FrpsTechnicalReportContextualContent;
}) {
  const scenarioRaw = content.leituraDoCenario?.trim() || '';
  const scenarioLabel = scenarioRaw
    ? SCENARIO_LABELS[scenarioRaw] || scenarioRaw
    : null;
  const showAdequacao = itemType !== 'GENERATE_SOURCE';

  return (
    <View>
      <Field label="Resumo contextual" value={content.resumoContextual} />
      <Field label="Leitura do cenário" value={scenarioLabel} />
      <Field label="Evidências agregadas" value={content.evidenciasAgregadas} />
      <Field label="Relação com o fator" value={content.relacaoComFator} />
      <Field label="Motivo da seleção" value={content.motivoDaSelecao} />
      {showAdequacao ? (
        <Field
          label="Adequação da recomendação"
          value={content.adequacaoDaRecomendacao}
        />
      ) : null}
      <Field
        label="Limites de interpretação"
        value={content.limitesDeInterpretacao}
      />
      <Field
        label="Orientação de validação profissional"
        value={content.orientacaoDeValidacaoProfissional}
      />
    </View>
  );
}

function ContextualAnalysisSection({
  itemType,
  analysis,
  showHierarchyLabel,
}: {
  itemType: FrpsTechnicalReportItemType;
  analysis: FrpsTechnicalReportContextualAnalysis;
  showHierarchyLabel: boolean;
}) {
  if (!hasContextualContent(analysis.content)) return null;

  const isValidated = analysis.validationStatus === 'VALIDATED';
  const isDraft = analysis.validationStatus === 'DRAFT_AI';
  const validatedAtLabel =
    isValidated && analysis.validatedAt
      ? new Date(analysis.validatedAt).toLocaleString('pt-BR')
      : null;
  const validatedByName =
    isValidated && analysis.validatedBy?.name?.trim()
      ? analysis.validatedBy.name.trim()
      : null;

  return (
    <View style={s.contextualSection} wrap={false}>
      <Text style={s.contextualBadge}>
        {TECHNICAL_REPORT_CONTEXTUAL_COPY.badge}
      </Text>
      {isValidated ? (
        <Text style={s.contextualStatusValidated}>
          {TECHNICAL_REPORT_CONTEXTUAL_COPY.validatedSeal}
        </Text>
      ) : null}
      {isDraft ? (
        <Text style={s.contextualDraftBanner}>
          {TECHNICAL_REPORT_CONTEXTUAL_COPY.draftWarning}
        </Text>
      ) : null}
      <Text style={s.contextualTitle}>
        {contextualJustificationTitle(itemType)}
      </Text>
      {showHierarchyLabel && analysis.hierarchyLabel ? (
        <Text style={s.contextualUsageLabel}>
          Hierarquia / uso: {analysis.hierarchyLabel}
          {analysis.riskName ? ` · ${analysis.riskName}` : ''}
        </Text>
      ) : null}
      {validatedByName && validatedAtLabel ? (
        <Text style={s.contextualAudit}>
          {TECHNICAL_REPORT_CONTEXTUAL_COPY.validatedAudit(
            validatedByName,
            validatedAtLabel,
          )}
        </Text>
      ) : null}
      <Text style={s.contextualIntro}>
        {FRPS_EXPLAINABILITY_UI_COPY.contextualJustificationIntro}
      </Text>
      <View style={s.contextualCard}>
        <ContextualFields itemType={itemType} content={analysis.content} />
      </View>
    </View>
  );
}

function ValidatedCard({ item }: { item: FrpsTechnicalReportValidatedItem }) {
  const risks = item.risks.map((r) => r.riskName).join('; ');
  const usages = item.usages
    .map((u) => `${u.groupingLabel}: ${u.groupingValue}`)
    .join('; ');
  const validatedAt = item.validatedAt
    ? new Date(item.validatedAt).toLocaleString('pt-BR')
    : '—';
  const contextualAnalyses = (item.contextualAnalyses ?? []).filter((ctx) => {
    if (
      ctx.validationStatus !== 'VALIDATED' &&
      ctx.validationStatus !== 'DRAFT_AI'
    ) {
      return false;
    }
    return hasContextualContent(ctx.content);
  });
  const showHierarchyLabel = contextualAnalyses.length > 1;

  return (
    <View style={s.card}>
      <Text style={s.cardHeader}>
        {itemTypeLabel(item.itemType)} — {item.name}
      </Text>
      <Text style={s.cardMeta}>Status: Validado</Text>
      <Text style={s.cardMeta}>FRPS relacionados: {risks || '—'}</Text>
      <Text style={s.cardMeta}>Utilizado em: {usages || '—'}</Text>
      <Text style={s.cardMeta}>
        Validado por: {item.validatedBy?.name || '—'}
      </Text>
      <Text style={s.cardMeta}>Validado em: {validatedAt}</Text>
      {item.itemType === 'GENERATE_SOURCE' ? (
        <SourceFields content={item.content} />
      ) : (
        <RecommendationFields content={item.content} />
      )}
      {contextualAnalyses.map((analysis) => (
        <ContextualAnalysisSection
          key={`${analysis.analysisId}:${analysis.hierarchyId}`}
          itemType={item.itemType}
          analysis={analysis}
          showHierarchyLabel={showHierarchyLabel}
        />
      ))}
    </View>
  );
}

function ReferenceCard({
  name,
  itemType,
  primaryFrpsName,
}: {
  name: string;
  itemType: FrpsTechnicalReportItemType;
  primaryFrpsName: string;
}) {
  return (
    <View style={s.referenceCard} wrap={false}>
      <Text style={s.cardHeader}>
        {itemTypeLabel(itemType)} — {name}
      </Text>
      <Text style={s.cardMeta}>Status: Validado</Text>
      <Text style={s.cardMeta}>
        Ficha técnica apresentada na seção: {primaryFrpsName}
      </Text>
    </View>
  );
}

function ValidatedEntries({
  title,
  entries,
}: {
  title: string;
  entries: FrpsReportValidatedEntry[];
}) {
  if (!entries.length) return null;
  return (
    <View>
      <Text style={s.subsectionTitle}>{title}</Text>
      {entries.map((entry) =>
        entry.kind === 'full' ? (
          <ValidatedCard key={`full-${entry.item.itemKey}`} item={entry.item} />
        ) : (
          <ReferenceCard
            key={`ref-${entry.itemKey}-${entry.primaryFrpsName}`}
            name={entry.name}
            itemType={entry.itemType}
            primaryFrpsName={entry.primaryFrpsName}
          />
        ),
      )}
    </View>
  );
}

function PendingList({
  title,
  items,
  showFrps = false,
}: {
  title: string;
  items: FrpsTechnicalReportPendingItem[];
  showFrps?: boolean;
}) {
  if (!items.length) return null;
  return (
    <View>
      <Text style={s.subsectionTitle}>{title}</Text>
      {items.map((item, index) => {
        const risks = item.risks.map((r) => r.riskName).join('; ');
        const usages = item.usages
          .map((u) => `${u.groupingLabel}: ${u.groupingValue}`)
          .join('; ');
        return (
          <Text
            key={`${item.name}-${item.reason}-${index}`}
            style={s.pendingRow}
            wrap={false}
          >
            {itemTypeLabel(item.itemType)} — {item.name}
            {'\n'}
            {showFrps ? `FRPS: ${risks || '—'} | ` : ''}
            Uso: {usages || '—'} | Motivo: {pendingReasonLabel(item.reason)}
          </Text>
        );
      })}
    </View>
  );
}

function FrpsChapterPage({
  group,
}: {
  group: ReturnType<typeof buildFrpsExplainabilityReportGroups>['groups'][number];
}) {
  return (
    <Page size="A4" style={s.page} wrap>
      <View style={s.frpsHeader} wrap={false}>
        <Text style={s.frpsHeaderText}>{group.riskName}</Text>
      </View>

      {group.inventoryInclusion === 'NOT_INCLUDED' ? (
        <View style={s.notApplicableBox} wrap={false}>
          <Text style={s.noteText}>Risco não adicionado ao inventário.</Text>
          <Text style={s.noteText}>
            Não se aplica análise de explicabilidade de fontes geradoras ou
            recomendações.
          </Text>
        </View>
      ) : (
        <View>
          {group.inventoryInclusion === 'PARTIAL' ? (
            <Text style={s.noteText} wrap={false}>
              Risco adicionado ao inventário em parte do recorte.
              {'\n'}
              O conteúdo abaixo considera somente as hierarquias inventariadas.
            </Text>
          ) : null}

          <ValidatedEntries
            title="Fontes Geradoras validadas"
            entries={group.sources}
          />
          <ValidatedEntries
            title="Medidas Administrativas validadas"
            entries={group.administrative}
          />
          <ValidatedEntries
            title="Medidas de Engenharia validadas"
            entries={group.engineering}
          />
          <PendingList title="Pendências deste FRPS" items={group.pending} />
        </View>
      )}
    </Page>
  );
}

export default function FrpsExplainabilityTechnicalReportPdf({
  data,
}: FrpsExplainabilityTechnicalReportPdfProps) {
  const { metadata, summary, items, pendingItems, frps = [] } = data;
  const issuedAt = new Date(metadata.emittedAt).toLocaleString('pt-BR');
  const { groups, pendingWithoutFrps, frpsSummary } =
    buildFrpsExplainabilityReportGroups({ items, pendingItems, frps });

  return (
    <Document>
      <Page size="A4" style={s.page} wrap>
        <Text style={s.title}>
          Relatório Técnico de Fontes Geradoras e Medidas de Prevenção
        </Text>
        <Text style={s.subtitle}>Empresa: {metadata.companyName}</Text>
        <Text style={s.subtitle}>Formulário: {metadata.formName}</Text>
        <Text style={s.subtitle}>Aplicação: {metadata.applicationName}</Text>
        {metadata.recorteLabel ? (
          <Text style={s.subtitle}>Recorte: {metadata.recorteLabel}</Text>
        ) : null}
        <Text style={s.subtitle}>
          Metodologia: {metadata.methodologyVersion}
        </Text>
        <Text style={s.issuedAt}>Emitido em: {issuedAt}</Text>
        {metadata.groupingLabel ? (
          <Text style={s.banner}>Agrupamento: {metadata.groupingLabel}</Text>
        ) : null}

        <Text style={s.sectionTitle}>Sumário</Text>
        <Text style={s.summaryRow}>FRPS: {summary.totalFrps}</Text>
        <Text style={s.summaryRow}>
          Fontes geradoras: {summary.totalSources}
        </Text>
        <Text style={s.summaryRow}>
          Medidas administrativas: {summary.totalAdministrativeMeasures}
        </Text>
        <Text style={s.summaryRow}>
          Medidas de engenharia: {summary.totalEngineeringMeasures}
        </Text>
        <Text style={s.summaryRow}>
          Fichas validadas: {summary.validated}
        </Text>
        <Text style={s.summaryRow}>Pendências: {summary.pending}</Text>

        <Text style={s.sectionTitle}>Sumário por FRPS</Text>
        {frpsSummary.length === 0 ? (
          <Text style={s.emptyText}>Nenhum FRPS identificado neste recorte.</Text>
        ) : (
          frpsSummary.map((row) => {
            if (row.inventoryInclusion === 'NOT_INCLUDED') {
              return (
                <Text key={row.riskId} style={s.summaryRow} wrap={false}>
                  {row.riskName}: Não adicionado ao inventário
                </Text>
              );
            }
            if (row.inventoryInclusion === 'PARTIAL') {
              return (
                <Text key={row.riskId} style={s.summaryRow} wrap={false}>
                  {row.riskName}: Adicionado ao inventário em parte do recorte
                  {'\n'}
                  {row.validatedSources} fonte(s), {row.validatedAdministrative}{' '}
                  administrativa(s), {row.validatedEngineering} engenharia,{' '}
                  {row.pending} pendência(s)
                </Text>
              );
            }
            return (
              <Text key={row.riskId} style={s.summaryRow} wrap={false}>
                {row.riskName}: {row.validatedSources} fonte(s),{' '}
                {row.validatedAdministrative} administrativa(s),{' '}
                {row.validatedEngineering} engenharia, {row.pending}{' '}
                pendência(s)
              </Text>
            );
          })
        )}

        {groups.length === 0 ? (
          <Text style={s.fieldText}>
            Nenhuma ficha conceitual validada disponível neste recorte.
          </Text>
        ) : null}
      </Page>

      {groups.map((group) => (
        <FrpsChapterPage key={group.riskId} group={group} />
      ))}

      {pendingWithoutFrps.length > 0 ? (
        <Page size="A4" style={s.page} wrap>
          <PendingList
            title="Pendências sem FRPS identificado"
            items={pendingWithoutFrps}
            showFrps
          />
        </Page>
      ) : null}
    </Document>
  );
}
