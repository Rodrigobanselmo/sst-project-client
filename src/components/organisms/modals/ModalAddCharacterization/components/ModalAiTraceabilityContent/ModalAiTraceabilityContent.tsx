import React, { useMemo, useState } from 'react';

import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import WarningAmberRoundedIcon from '@mui/icons-material/WarningAmberRounded';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Chip,
  CircularProgress,
} from '@mui/material';

import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { useFetchCharacterizationAiAssistTraces } from '@v2/services/security/characterization/characterization/ai-characterization-assist-traceability/hooks/useFetchCharacterizationAiAssistTraces';
import type {
  CharacterizationAiAssistAppliedField,
  CharacterizationAiAssistTraceItem,
} from '@v2/services/security/characterization/characterization/ai-characterization-assist-traceability/service/ai-characterization-assist-traceability.types';
import type { AiCharacterizationAssistTextItem } from '@v2/services/security/characterization/characterization/ai-characterization-assist/service/ai-characterization-assist.types';

import type { IUseEditCharacterization } from '../../hooks/useEditCharacterization';

const OUTPUT_INTENT_LABELS: Record<string, string> = {
  GENERATE_FINAL: 'Gerar texto final',
  REVIEW_EXISTING: 'Revisar texto existente',
  CRITICAL_ONLY: 'Somente análise crítica',
};

const PROMPT_MODE_LABELS: Record<string, string> = {
  DEFAULT: 'Prompt padrão',
  CUSTOM_SESSION: 'Prompt customizado (sessão)',
  SAVED_DEFAULT: 'Prompt padrão salvo',
};

const WEB_SEARCH_LABELS: Record<string, string> = {
  SKIPPED: 'Não solicitada',
  UNAVAILABLE: 'Indisponível',
  SUCCESS: 'Sucesso',
  FAILED: 'Falha',
  PARTIAL: 'Parcial',
};

const APPLIED_FIELD_LABELS: Record<string, string> = {
  description: 'Descrição aplicada',
  workActivities: 'Atividades aplicadas',
  considerations: 'Considerações aplicadas',
  suggestedName: 'Nome sugerido aplicado',
};

const URL_STATUS_LABELS: Record<string, string> = {
  READ_SUCCESS: 'Lida com sucesso',
  READ_FAILED: 'Falha',
  BLOCKED: 'Bloqueada',
  TRUNCATED: 'Truncada',
};

const asStringArray = (value: unknown): string[] =>
  Array.isArray(value) ? value.filter((item): item is string => typeof item === 'string') : [];

const asTextItems = (value: unknown): AiCharacterizationAssistTextItem[] => {
  if (!Array.isArray(value)) return [];
  return value.filter(
    (item): item is AiCharacterizationAssistTextItem =>
      Boolean(item) && typeof item === 'object' && typeof (item as { text?: unknown }).text === 'string',
  );
};

const formatDateTime = (value?: string | null) => {
  if (!value) return '—';
  try {
    return new Date(value).toLocaleString('pt-BR');
  } catch {
    return value;
  }
};

const TextItemsBlock: React.FC<{ title: string; items: AiCharacterizationAssistTextItem[] }> = ({
  title,
  items,
}) => {
  if (!items.length) {
    return (
      <Box sx={{ mb: 2 }}>
        <SText variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
          {title}
        </SText>
        <SText variant="caption" color="text.secondary">
          Nenhum conteúdo sugerido.
        </SText>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 2 }}>
      <SText variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
        {title}
      </SText>
      <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
        {items.map((item, index) => (
          <Box component="li" key={`${title}-${index}`} sx={{ mb: 0.5 }}>
            <SText variant="body2">{item.text}</SText>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const StringListBlock: React.FC<{ title: string; items: string[]; accent?: boolean }> = ({
  title,
  items,
  accent,
}) => {
  if (!items.length) return null;

  return (
    <Box sx={{ mb: 2 }}>
      <SText
        variant="body2"
        sx={{ fontWeight: 600, mb: 0.5, color: accent ? 'warning.dark' : 'text.primary' }}
      >
        {title}
      </SText>
      <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
        {items.map((item, index) => (
          <Box component="li" key={`${title}-${index}`} sx={{ mb: 0.5 }}>
            <SText variant="body2">{item}</SText>
          </Box>
        ))}
      </Box>
    </Box>
  );
};

const TraceCard: React.FC<{ trace: CharacterizationAiAssistTraceItem }> = ({ trace }) => {
  const [expanded, setExpanded] = useState(false);
  const appliedFields = (trace.appliedFields || []) as CharacterizationAiAssistAppliedField[];
  const externalSources = trace.externalSources as
    | {
        userProvidedUrls?: Array<{ url: string; status?: string; warning?: string }>;
        webSearch?: { status?: string; warning?: string; queries?: string[] };
      }
    | undefined;

  const alertTone =
    trace.hasInconsistencies || trace.hasFailedUrls
      ? 'warning'
      : trace.hasCautions
        ? 'info'
        : undefined;

  return (
    <Accordion
      expanded={expanded}
      onChange={(_, next) => setExpanded(next)}
      sx={{
        mb: 1.5,
        border: '1px solid',
        borderColor:
          alertTone === 'warning'
            ? 'warning.light'
            : alertTone === 'info'
              ? 'info.light'
              : 'divider',
        borderRadius: 1,
        '&:before': { display: 'none' },
        bgcolor: alertTone === 'warning' ? 'warning.50' : 'background.paper',
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <SFlex direction="column" gap={1} sx={{ width: '100%', pr: 1 }}>
          <SFlex align="center" gap={1} flexWrap="wrap">
            <SText variant="body2" sx={{ fontWeight: 700 }}>
              {formatDateTime(trace.createdAt)}
            </SText>
            {trace.hasInconsistencies && (
              <Chip
                size="small"
                color="warning"
                icon={<WarningAmberRoundedIcon />}
                label="Inconsistências"
              />
            )}
            {trace.hasCautions && !trace.hasInconsistencies && (
              <Chip size="small" color="info" label="Cautelas" />
            )}
            {trace.hasFailedUrls && (
              <Chip size="small" color="error" variant="outlined" label="Fontes com falha" />
            )}
            {trace.webSearchStatus === 'UNAVAILABLE' && (
              <Chip size="small" variant="outlined" label="Pesquisa web indisponível" />
            )}
            {appliedFields.map((field) => (
              <Chip
                key={`${trace.id}-${field.field}`}
                size="small"
                color="success"
                variant="outlined"
                label={APPLIED_FIELD_LABELS[field.field] || field.field}
              />
            ))}
            {trace.savedAfterApply && (
              <Chip size="small" color="success" label="Salvo após aplicar" />
            )}
          </SFlex>
          <SText variant="caption" color="text.secondary">
            {trace.generatedBy?.name || 'Usuário'} · modelo {trace.model || 'padrão'} ·{' '}
            {OUTPUT_INTENT_LABELS[trace.outputIntent] || trace.outputIntent}
          </SText>
        </SFlex>
      </AccordionSummary>
      <AccordionDetails>
        <SFlex gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
          <Chip size="small" label={`Status: ${trace.status}`} />
          <Chip
            size="small"
            label={PROMPT_MODE_LABELS[trace.promptMode] || trace.promptMode}
          />
          {trace.usedTemporaryPdf && <Chip size="small" label="PDF temporário" />}
          {trace.usedPhotos && <Chip size="small" label="Fotos" />}
          {trace.usedUserUrls && <Chip size="small" label="URLs do usuário" />}
          <Chip
            size="small"
            label={`Pesquisa web: ${
              WEB_SEARCH_LABELS[trace.webSearchStatus || 'SKIPPED'] ||
              trace.webSearchStatus ||
              'Não solicitada'
            }`}
          />
        </SFlex>

        {!!externalSources?.userProvidedUrls?.length && (
          <Box sx={{ mb: 2 }}>
            <SText variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              URLs processadas
            </SText>
            {externalSources.userProvidedUrls.map((item) => (
              <SText key={item.url} variant="caption" sx={{ display: 'block', mb: 0.5 }}>
                {item.url} — {URL_STATUS_LABELS[item.status || ''] || item.status || '—'}
                {item.warning ? ` (${item.warning})` : ''}
              </SText>
            ))}
          </Box>
        )}

        {!!externalSources?.webSearch?.warning && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {externalSources.webSearch.warning}
          </Alert>
        )}

        <StringListBlock
          title="Inconsistências"
          items={asStringArray(trace.inconsistencies)}
          accent
        />
        <StringListBlock title="Cautelas" items={asStringArray(trace.cautions)} accent />
        <StringListBlock
          title="Pontos de incerteza"
          items={asStringArray(trace.uncertaintyPoints)}
        />

        {trace.suggestedName && (
          <Box sx={{ mb: 2 }}>
            <SText variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Nome sugerido
            </SText>
            <SText variant="body2">{trace.suggestedName}</SText>
          </Box>
        )}

        <Accordion
          disableGutters
          elevation={0}
          sx={{ bgcolor: 'transparent', '&:before': { display: 'none' } }}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <SText variant="body2" sx={{ fontWeight: 600 }}>
              Sugestões geradas (recolhidas)
            </SText>
          </AccordionSummary>
          <AccordionDetails>
            <TextItemsBlock
              title="Descrição sugerida"
              items={asTextItems(trace.suggestedDescription)}
            />
            <TextItemsBlock
              title="Processos / atividades sugeridos"
              items={asTextItems(trace.suggestedWorkActivities)}
            />
            <TextItemsBlock
              title="Considerações sugeridas"
              items={asTextItems(trace.suggestedConsiderations)}
            />
          </AccordionDetails>
        </Accordion>

        {!!appliedFields.length && (
          <Box sx={{ mt: 2 }}>
            <SText variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Decisão do usuário (campos aplicados)
            </SText>
            {appliedFields.map((field) => (
              <SText
                key={`${trace.id}-applied-${field.field}`}
                variant="caption"
                sx={{ display: 'block', mb: 0.5 }}
              >
                {APPLIED_FIELD_LABELS[field.field] || field.field} · modo {field.mode} ·{' '}
                {formatDateTime(field.appliedAt)}
                {trace.appliedBy?.name ? ` · por ${trace.appliedBy.name}` : ''}
              </SText>
            ))}
            {trace.savedAfterApply && (
              <SText variant="caption" color="text.secondary">
                Caracterização salva após aplicação em{' '}
                {formatDateTime(trace.savedCharacterizationAt)}
              </SText>
            )}
          </Box>
        )}
      </AccordionDetails>
    </Accordion>
  );
};

export const ModalAiTraceabilityContent: React.FC<IUseEditCharacterization> = (props) => {
  const { data, isEdit } = props;
  const enabled = Boolean(
    isEdit && data?.id && data?.companyId && data?.workspaceId,
  );

  const { traces, isLoading, isError } = useFetchCharacterizationAiAssistTraces(
    {
      companyId: data.companyId || '',
      workspaceId: data.workspaceId || '',
      characterizationId: data.id || '',
    },
    { enabled },
  );

  const hasAnyAlert = useMemo(
    () => traces.some((trace) => trace.hasInconsistencies || trace.hasFailedUrls),
    [traces],
  );

  if (!isEdit) {
    return (
      <Box sx={{ px: 5, pb: 10 }}>
        <SText variant="body1">
          Salve a caracterização antes de consultar a rastreabilidade das execuções da IA.
        </SText>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 5, pb: 10 }}>
      <Alert severity="info" sx={{ mb: 2 }}>
        Esta área registra as sugestões geradas pela IA, fontes processadas, limitações,
        inconsistências e campos aplicados pelo usuário. O conteúdo é mantido para
        rastreabilidade técnica e não é inserido automaticamente nos documentos oficiais.
      </Alert>

      {hasAnyAlert && (
        <Alert severity="warning" sx={{ mb: 2 }} icon={<WarningAmberRoundedIcon />}>
          Há execuções com inconsistências ou fontes com falha. Expanda os registros para
          revisar os detalhes antes de usar o conteúdo em documentos oficiais.
        </Alert>
      )}

      {isLoading && (
        <SFlex justify="center" sx={{ py: 6 }}>
          <CircularProgress size={28} />
        </SFlex>
      )}

      {isError && !isLoading && (
        <Alert severity="error">
          Não foi possível carregar os registros de rastreabilidade da IA.
        </Alert>
      )}

      {!isLoading && !isError && !traces.length && (
        <SText variant="body2" color="text.secondary">
          Nenhuma execução do Assistente IA registrada para esta caracterização.
        </SText>
      )}

      {!isLoading &&
        !isError &&
        traces.map((trace) => <TraceCard key={trace.id} trace={trace} />)}
    </Box>
  );
};
