import React, { useEffect, useMemo, useState } from 'react';

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

import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { useFetchCharacterizationAiAssistTraces } from '@v2/services/security/characterization/characterization/ai-characterization-assist-traceability/hooks/useFetchCharacterizationAiAssistTraces';
import type {
  CharacterizationAiAssistAppliedField,
  CharacterizationAiAssistTraceItem,
} from '@v2/services/security/characterization/characterization/ai-characterization-assist-traceability/service/ai-characterization-assist-traceability.types';
import type { AiCharacterizationAssistTextItem } from '@v2/services/security/characterization/characterization/ai-characterization-assist/service/ai-characterization-assist.types';
import { useFetchCharacterizationTechnicalRecords } from '@v2/services/security/characterization/characterization/technical-traceability/hooks/useFetchCharacterizationTechnicalRecords';
import { useMutateDeleteCharacterizationTechnicalRecord } from '@v2/services/security/characterization/characterization/technical-traceability/hooks/useMutateCharacterizationTechnicalRecord';
import type { CharacterizationTechnicalRecordItem } from '@v2/services/security/characterization/characterization/technical-traceability/service/technical-traceability.types';

import type { IUseEditCharacterization } from '../../hooks/useEditCharacterization';
import { TechnicalRecordFormDialog } from './TechnicalRecordFormDialog';
import { AiEvidenceImportDialog } from './AiEvidenceImportDialog';
import {
  ANALYSIS_ORIGIN_LABELS,
  RECORD_STATUS_LABELS,
  RECORD_TYPE_LABELS,
  RELATED_FIELD_LABELS,
  SOURCE_TYPE_LABELS,
} from './technical-traceability.labels';
import { browseTechnicalAiEvidenceSuggestions } from '@v2/services/security/characterization/characterization/technical-traceability/service/technical-traceability.service';
import type { CharacterizationTechnicalRecordSourceInput } from '@v2/services/security/characterization/characterization/technical-traceability/service/technical-traceability.types';

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
    if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [year, month, day] = value.split('-');
      return `${day}/${month}/${year}`;
    }
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
            {trace.generatedBy?.name || 'Usuário'} · modelo{' '}
            {trace.model || 'padrão do sistema'} ·{' '}
            {OUTPUT_INTENT_LABELS[trace.outputIntent] || trace.outputIntent}
          </SText>
        </SFlex>
      </AccordionSummary>
      <AccordionDetails>
        <SFlex gap={1} flexWrap="wrap" sx={{ mb: 2 }}>
          <Chip size="small" label={`Status: ${trace.status}`} />
          <Chip
            size="small"
            color="info"
            variant="outlined"
            label={`Modelo: ${trace.model || 'padrão do sistema'}`}
          />
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

const TechnicalRecordCard: React.FC<{
  record: CharacterizationTechnicalRecordItem;
  onEdit: () => void;
  onDeleteOrArchive: () => void;
}> = ({ record, onEdit, onDeleteOrArchive }) => {
  const isExternalAi = record.analysisOrigin === 'EXTERNAL_AI_USER_DECLARED';
  const isDraft = record.status === 'DRAFT';

  return (
    <Accordion
      sx={{
        mb: 1.5,
        border: '1px solid',
        borderColor: isExternalAi ? 'warning.light' : 'divider',
        borderLeft: isExternalAi ? '4px solid' : undefined,
        borderLeftColor: isExternalAi ? 'warning.main' : undefined,
      }}
    >
      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
        <Box sx={{ width: '100%', pr: 1 }}>
          <SText variant="body1" sx={{ fontWeight: 600 }}>
            {record.title}
          </SText>
          <SText variant="caption" color="text.secondary" sx={{ display: 'block' }}>
            {formatDateTime(record.analysisDate)} · {record.responsibleName}
            {record.createdBy?.name ? ` · criado por ${record.createdBy.name}` : ''}
          </SText>
          <SFlex gap={0.75} flexWrap="wrap" sx={{ mt: 1 }}>
            <Chip size="small" label={RECORD_TYPE_LABELS[record.recordType]} />
            <Chip
              size="small"
              label={ANALYSIS_ORIGIN_LABELS[record.analysisOrigin]}
              color={isExternalAi ? 'warning' : 'default'}
            />
            <Chip size="small" label={RECORD_STATUS_LABELS[record.status]} />
            <Chip
              size="small"
              variant="outlined"
              label={`${record.sources.length} fonte(s)`}
            />
            {record.finalCharacterizationSnapshot && (
              <Chip size="small" variant="outlined" label="Snapshot capturado" />
            )}
          </SFlex>
        </Box>
      </AccordionSummary>
      <AccordionDetails>
        {isExternalAi && (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Análise com IA externa declarada pelo usuário
            {record.externalAiTool ? ` (${record.externalAiTool}` : ''}
            {record.externalAiModel ? ` · ${record.externalAiModel}` : ''}
            {record.externalAiTool ? ')' : ''}. Não é execução automática do
            Assistente IA do SimpleSST.
          </Alert>
        )}

        {record.technicalReport && (
          <Box sx={{ mb: 2 }}>
            <SText variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Relatório técnico
            </SText>
            <SText variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
              {record.technicalReport}
            </SText>
          </Box>
        )}

        {!!record.relatedFields?.length && (
          <Box sx={{ mb: 2 }}>
            <SText variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Campos relacionados
            </SText>
            <SFlex gap={0.75} flexWrap="wrap">
              {record.relatedFields.map((field) => (
                <Chip key={field} size="small" label={RELATED_FIELD_LABELS[field]} />
              ))}
            </SFlex>
          </Box>
        )}

        {!!record.sources.length && (
          <Box sx={{ mb: 2 }}>
            <SText variant="body2" sx={{ fontWeight: 600, mb: 1 }}>
              Fontes vinculadas
            </SText>
            {record.sources.map((source, index) => (
              <Box
                key={source.id}
                sx={{
                  mb: 1.5,
                  p: 1.5,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                }}
              >
                <SText variant="body2" sx={{ fontWeight: 600 }}>
                  {index + 1}. {SOURCE_TYPE_LABELS[source.sourceType]}
                  {source.title ? ` — ${source.title}` : ''}
                </SText>
                {source.authorInstitution && (
                  <SText variant="caption" sx={{ display: 'block' }}>
                    Instituição: {source.authorInstitution}
                  </SText>
                )}
                {source.informationUsed && (
                  <SText variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                    Informações usadas: {source.informationUsed}
                  </SText>
                )}
                {source.limitations && (
                  <SText variant="caption" sx={{ display: 'block' }}>
                    Limitações: {source.limitations}
                  </SText>
                )}
                {source.applicationInCharacterization && (
                  <SText variant="caption" sx={{ display: 'block', mt: 0.5 }}>
                    Aplicação: {source.applicationInCharacterization}
                  </SText>
                )}
                {source.url && (
                  <SText variant="caption" sx={{ display: 'block' }}>
                    URL: {source.url}
                  </SText>
                )}
              </Box>
            ))}
          </Box>
        )}

        {record.finalCharacterizationSnapshot && (
          <Box sx={{ mb: 2 }}>
            <Alert severity="info" sx={{ mb: 1 }}>
              Snapshot histórico (cópia independente da caracterização atual).
            </Alert>
            <SText
              variant="caption"
              color="text.secondary"
              sx={{ display: 'block', mb: 1 }}
            >
              Capturado em{' '}
              {formatDateTime(record.finalCharacterizationSnapshot.capturedAt)}
              {record.finalCharacterizationSnapshot.capturedByName
                ? ` · por ${record.finalCharacterizationSnapshot.capturedByName}`
                : ''}
            </SText>
            <SText variant="body2" sx={{ fontWeight: 600 }}>
              Nome: {record.finalCharacterizationSnapshot.name || '—'}
            </SText>
          </Box>
        )}

        <SText
          variant="caption"
          color="text.secondary"
          sx={{ display: 'block', mb: 2 }}
        >
          Criado em {formatDateTime(record.createdAt)}
          {record.createdBy?.name ? ` · ${record.createdBy.name}` : ''}
          {' · '}
          Atualizado em {formatDateTime(record.updatedAt)}
          {record.updatedBy?.name ? ` · ${record.updatedBy.name}` : ''}
        </SText>

        <SFlex gap={1}>
          <SButton variant="outlined" text="Editar" onClick={onEdit} />
          <SButton
            variant="outlined"
            color="danger"
            text={isDraft ? 'Excluir' : 'Arquivar'}
            onClick={onDeleteOrArchive}
          />
        </SFlex>
      </AccordionDetails>
    </Accordion>
  );
};

export const ModalAiTraceabilityContent: React.FC<IUseEditCharacterization> = (
  props,
) => {
  const { data, isEdit } = props;
  const { showConfirmation } = useConfirmationModal();
  const [formOpen, setFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] =
    useState<CharacterizationTechnicalRecordItem | null>(null);
  const [aiImportOpen, setAiImportOpen] = useState(false);
  const [aiEvidenceCount, setAiEvidenceCount] = useState(0);
  const [pendingImportSources, setPendingImportSources] = useState<
    CharacterizationTechnicalRecordSourceInput[] | null
  >(null);

  const enabled = Boolean(
    isEdit && data?.id && data?.companyId && data?.workspaceId,
  );

  const scope = {
    companyId: data.companyId || '',
    workspaceId: data.workspaceId || '',
    characterizationId: data.id || '',
  };

  const { traces, isLoading, isError } = useFetchCharacterizationAiAssistTraces(
    scope,
    { enabled },
  );

  const {
    records,
    isLoading: isLoadingRecords,
    isError: isErrorRecords,
  } = useFetchCharacterizationTechnicalRecords(scope, { enabled });

  const deleteMutation = useMutateDeleteCharacterizationTechnicalRecord();

  useEffect(() => {
    if (!enabled) {
      setAiEvidenceCount(0);
      return;
    }
    let cancelled = false;
    browseTechnicalAiEvidenceSuggestions(scope)
      .then((result) => {
        if (!cancelled) {
          setAiEvidenceCount(
            result.suggestions.filter(
              (item) => item.verified || item.kind === 'URL_FAILED',
            ).length,
          );
        }
      })
      .catch(() => {
        if (!cancelled) setAiEvidenceCount(0);
      });
    return () => {
      cancelled = true;
    };
  }, [enabled, scope.companyId, scope.workspaceId, scope.characterizationId, records.length]);

  const hasAnyAlert = useMemo(
    () => traces.some((trace) => trace.hasInconsistencies || trace.hasFailedUrls),
    [traces],
  );

  const handleDeleteOrArchive = async (
    record: CharacterizationTechnicalRecordItem,
  ) => {
    const isDraft = record.status === 'DRAFT';
    const confirmed = await showConfirmation({
      title: isDraft ? 'Excluir registro técnico' : 'Arquivar registro técnico',
      message: isDraft
        ? 'Confirma a exclusão definitiva deste registro em rascunho?'
        : 'Registros revisados ou usados como suporte são arquivados (não excluídos). Confirma o arquivamento?',
      confirmText: isDraft ? 'Excluir' : 'Arquivar',
      cancelText: 'Cancelar',
      variant: isDraft ? 'danger' : 'warning',
    });

    if (!confirmed) return;

    await deleteMutation.mutateAsync({
      ...scope,
      recordId: record.id,
    });
  };

  if (!isEdit) {
    return (
      <Box sx={{ px: 5, pb: 10 }}>
        <SText variant="body1">
          Salve a caracterização antes de consultar a rastreabilidade técnica.
        </SText>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 5, pb: 10 }}>
      <Alert severity="info" sx={{ mb: 3 }}>
        Esta área registra as fontes, pesquisas, análises, decisões e execuções de IA
        utilizadas na elaboração da caracterização. O conteúdo é mantido para
        rastreabilidade técnica e não é inserido automaticamente nos documentos oficiais.
      </Alert>

      {aiEvidenceCount > 0 && (
        <Alert
          severity="warning"
          sx={{ mb: 3 }}
          action={
            <SButton
              variant="outlined"
              text="Revisar e importar"
              onClick={() => setAiImportOpen(true)}
            />
          }
        >
          Foram identificadas {aiEvidenceCount} evidências utilizadas pelo Assistente
          IA nesta caracterização. Deseja revisá-las e importá-las?
        </Alert>
      )}

      <Box sx={{ mb: 4 }}>
        <SFlex align="center" justify="space-between" sx={{ mb: 1.5 }}>
          <SText variant="h6" sx={{ fontWeight: 700, fontSize: '1.05rem' }}>
            Registros técnicos e pesquisas
          </SText>
          <SButton
            variant="contained"
            text="+ Adicionar registro técnico"
            onClick={() => {
              setEditingRecord(null);
              setPendingImportSources(null);
              setFormOpen(true);
            }}
          />
        </SFlex>

        {isLoadingRecords && (
          <SFlex justify="center" sx={{ py: 4 }}>
            <CircularProgress size={24} />
          </SFlex>
        )}

        {isErrorRecords && !isLoadingRecords && (
          <Alert severity="error" sx={{ mb: 2 }}>
            Não foi possível carregar os registros técnicos manuais.
          </Alert>
        )}

        {!isLoadingRecords && !isErrorRecords && !records.length && (
          <SText variant="body2" color="text.secondary">
            Nenhum registro técnico manual cadastrado para esta caracterização.
          </SText>
        )}

        {!isLoadingRecords &&
          !isErrorRecords &&
          records.map((record) => (
            <TechnicalRecordCard
              key={record.id}
              record={record}
              onEdit={() => {
                setEditingRecord(record);
                setFormOpen(true);
              }}
              onDeleteOrArchive={() => handleDeleteOrArchive(record)}
            />
          ))}
      </Box>

      <Box>
        <SText
          variant="h6"
          sx={{ fontWeight: 700, fontSize: '1.05rem', mb: 1.5 }}
        >
          Execuções do Assistente IA
        </SText>

        {hasAnyAlert && (
          <Alert
            severity="warning"
            sx={{ mb: 2 }}
            icon={<WarningAmberRoundedIcon />}
          >
            Há execuções com inconsistências ou fontes com falha. Expanda os
            registros para revisar os detalhes antes de usar o conteúdo em
            documentos oficiais.
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

      <TechnicalRecordFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingRecord(null);
          setPendingImportSources(null);
        }}
        companyId={scope.companyId}
        workspaceId={scope.workspaceId}
        characterizationId={scope.characterizationId}
        record={editingRecord}
        initialSources={pendingImportSources || undefined}
      />

      <AiEvidenceImportDialog
        open={aiImportOpen}
        onClose={() => setAiImportOpen(false)}
        companyId={scope.companyId}
        workspaceId={scope.workspaceId}
        characterizationId={scope.characterizationId}
        existingUrls={records.flatMap((record) =>
          record.sources.map((source) => source.url || '').filter(Boolean),
        )}
        onConfirm={(sources) => {
          setPendingImportSources(sources);
          setEditingRecord(null);
          setFormOpen(true);
        }}
      />
    </Box>
  );
};
