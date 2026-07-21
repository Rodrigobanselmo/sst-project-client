import { Box, Skeleton, Typography } from '@mui/material';
import { SText } from '@v2/components/atoms/SText/SText';
import type {
  FormAiConceptualExplanationContent,
  FormAiContextualExplanationContent,
  FrpsExplanationItemType,
} from '@v2/services/forms/form-questions-answers-analysis/frps-explainability';
import {
  isPlainContentObject,
  normalizeDisplayList,
  normalizeDisplayText,
} from './frps-explainability-safe-content.util';
import { getValidationStatusLabel } from './frps-explainability.utils';

export { getValidationStatusLabel };

function SectionField({
  label,
  value,
  asList = false,
}: {
  label: string;
  value?: unknown;
  asList?: boolean;
}) {
  if (asList || Array.isArray(value)) {
    const items = normalizeDisplayList(value);
    if (!items.length) return null;
    return (
      <Box mb={2.25}>
        <SText variant="body2" fontWeight="bold" fontSize={13} mb={0.75}>
          {label}
        </SText>
        <Box component="ul" sx={{ m: 0, pl: 2.75 }}>
          {items.map((item, index) => (
            <Typography
              key={`${index}-${item.slice(0, 48)}`}
              component="li"
              variant="body2"
              color="text.secondary"
              sx={{ fontSize: 13, mb: 0.75, lineHeight: 1.55 }}
            >
              {item}
            </Typography>
          ))}
        </Box>
      </Box>
    );
  }

  const text = normalizeDisplayText(value);
  if (!text) return null;

  return (
    <Box mb={2.25}>
      <SText variant="body2" fontWeight="bold" fontSize={13} mb={0.75}>
        {label}
      </SText>
      <SText
        variant="body2"
        color="text.secondary"
        fontSize={13}
        sx={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}
      >
        {text}
      </SText>
    </Box>
  );
}

const SCENARIO_LABELS: Record<string, string> = {
  FAVORAVEL: 'Favorável',
  INTERMEDIARIO: 'Intermediário',
  DESFAVORAVEL: 'Desfavorável',
};

function asContentRecord(
  content:
    | FormAiConceptualExplanationContent
    | FormAiContextualExplanationContent
    | null
    | undefined,
): Record<string, unknown> {
  return isPlainContentObject(content) ? content : {};
}

export function FrpsConceptualContent({
  itemType,
  content,
}: {
  itemType: FrpsExplanationItemType;
  content: FormAiConceptualExplanationContent | null | undefined;
}) {
  const c = asContentRecord(content);
  const isSource = itemType === 'SOURCE';

  if (isSource) {
    return (
      <>
        <SectionField label="Definição" value={c.definition} />
        <SectionField
          label="Relação com o fator de risco"
          value={c.relationToRiskFactor}
        />
        <SectionField
          label="Perguntas mensuráveis relacionadas"
          value={c.measurableQuestions}
          asList
        />
        <SectionField
          label="Manifestações possíveis"
          value={c.organizationalManifestations}
        />
        <SectionField label="Sinais favoráveis" value={c.favorableSignals} />
        <SectionField
          label="Sinais intermediários"
          value={c.intermediateSignals}
        />
        <SectionField
          label="Sinais desfavoráveis"
          value={c.unfavorableSignals}
        />
        <SectionField
          label="Limites de interpretação"
          value={c.interpretationLimits}
        />
        <SectionField
          label="Validação profissional"
          value={c.professionalValidationGuidance}
        />
      </>
    );
  }

  return (
    <>
      <SectionField label="Objetivo" value={c.objective} />
      <SectionField
        label="Relação com o fator de risco"
        value={c.relationToRiskFactor}
      />
      <SectionField
        label="Perguntas mensuráveis relacionadas"
        value={c.measurableQuestions}
        asList
      />
      <SectionField
        label="Contribuição esperada para redução do risco"
        value={c.whyItMayReduceRisk}
      />
      <SectionField
        label="Orientações de implementação"
        value={c.implementationGuidance}
      />
      <SectionField label="Exemplos práticos" value={c.practicalExamples} />
      <SectionField label="Resultados esperados" value={c.expectedResults} />
      <SectionField
        label="Indicadores de acompanhamento"
        value={c.monitoringIndicators}
      />
      <SectionField
        label="Limitações e cuidados"
        value={c.limitationsAndCautions}
      />
      <SectionField
        label="Validação profissional"
        value={c.professionalValidationGuidance}
      />
    </>
  );
}

export function FrpsContextualContent({
  itemType,
  content,
}: {
  itemType: FrpsExplanationItemType;
  content: FormAiContextualExplanationContent | null | undefined;
}) {
  const c = asContentRecord(content);
  const scenarioRaw = normalizeDisplayText(c.leituraDoCenario);
  const scenarioLabel = scenarioRaw
    ? SCENARIO_LABELS[scenarioRaw] || scenarioRaw
    : null;
  const adequacao = normalizeDisplayText(c.adequacaoDaRecomendacao);
  const showAdequacao = itemType !== 'SOURCE' && Boolean(adequacao);

  return (
    <>
      <SectionField label="Resumo contextual" value={c.resumoContextual} />
      <SectionField label="Leitura do cenário" value={scenarioLabel} />
      <SectionField
        label="Evidências agregadas"
        value={c.evidenciasAgregadas}
      />
      <SectionField label="Relação com o fator" value={c.relacaoComFator} />
      <SectionField label="Motivo da seleção" value={c.motivoDaSelecao} />
      {showAdequacao && (
        <SectionField label="Adequação da recomendação" value={adequacao} />
      )}
      <SectionField
        label="Limites de interpretação"
        value={c.limitesDeInterpretacao}
      />
      <SectionField
        label="Orientação de validação profissional"
        value={c.orientacaoDeValidacaoProfissional}
      />
    </>
  );
}

export function FrpsExplainabilityLoadingSkeleton() {
  return (
    <Box>
      <Skeleton variant="text" width="40%" height={28} />
      <Skeleton variant="rectangular" height={80} sx={{ mb: 2, mt: 1 }} />
      <Skeleton variant="text" width="55%" height={28} />
      <Skeleton variant="rectangular" height={120} sx={{ mt: 1 }} />
    </Box>
  );
}
