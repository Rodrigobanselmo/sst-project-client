import React from 'react';
import { Document, Page, StyleSheet, Text, View } from '@react-pdf/renderer';

import {
  buildFrpsExplainabilityReportGroups,
  type FrpsReportValidatedEntry,
} from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/buildFrpsExplainabilityReportGroups';
import type {
  FrpsExplainabilityTechnicalReportResult,
  FrpsTechnicalReportConceptualContent,
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
    marginTop: 14,
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
});

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

function ValidatedCard({ item }: { item: FrpsTechnicalReportValidatedItem }) {
  const risks = item.risks.map((r) => r.riskName).join('; ');
  const usages = item.usages
    .map((u) => `${u.groupingLabel}: ${u.groupingValue}`)
    .join('; ');
  const validatedAt = item.validatedAt
    ? new Date(item.validatedAt).toLocaleString('pt-BR')
    : '—';

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

export default function FrpsExplainabilityTechnicalReportPdf({
  data,
}: FrpsExplainabilityTechnicalReportPdfProps) {
  const { metadata, summary, items, pendingItems } = data;
  const issuedAt = new Date(metadata.emittedAt).toLocaleString('pt-BR');
  const { groups, pendingWithoutFrps, frpsSummary } =
    buildFrpsExplainabilityReportGroups({ items, pendingItems });

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
          frpsSummary.map((row) => (
            <Text key={row.riskId} style={s.summaryRow} wrap={false}>
              {row.riskName}: {row.validatedSources} fonte(s),{' '}
              {row.validatedAdministrative} administrativa(s),{' '}
              {row.validatedEngineering} engenharia, {row.pending} pendência(s)
            </Text>
          ))
        )}

        {groups.length === 0 ? (
          <Text style={s.fieldText}>
            Nenhuma ficha conceitual validada disponível neste recorte.
          </Text>
        ) : (
          groups.map((group) => (
            <View key={group.riskId}>
              <View style={s.frpsHeader} wrap={false}>
                <Text style={s.frpsHeaderText}>{group.riskName}</Text>
              </View>

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
              <PendingList
                title="Pendências deste FRPS"
                items={group.pending}
              />
            </View>
          ))
        )}

        <PendingList
          title="Pendências sem FRPS identificado"
          items={pendingWithoutFrps}
          showFrps
        />
      </Page>
    </Document>
  );
}
