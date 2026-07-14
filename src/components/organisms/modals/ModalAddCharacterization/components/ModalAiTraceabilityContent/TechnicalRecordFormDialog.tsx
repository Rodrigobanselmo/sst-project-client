import React, { useEffect, useMemo, useState } from 'react';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Checkbox,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  FormGroup,
  IconButton,
  MenuItem,
  TextField,
} from '@mui/material';

import { SButton } from '@v2/components/atoms/SButton/SButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SText } from '@v2/components/atoms/SText/SText';
import { useAuth } from 'core/contexts/AuthContext';
import type {
  CharacterizationFinalSnapshot,
  CharacterizationTechnicalRecordItem,
  CharacterizationTechnicalRecordPayload,
  CharacterizationTechnicalRecordSourceInput,
} from '@v2/services/security/characterization/characterization/technical-traceability/service/technical-traceability.types';
import {
  useMutateCaptureCharacterizationTechnicalSnapshot,
  useMutateCreateCharacterizationTechnicalRecord,
  useMutateUpdateCharacterizationTechnicalRecord,
} from '@v2/services/security/characterization/characterization/technical-traceability/hooks/useMutateCharacterizationTechnicalRecord';

import {
  ANALYSIS_ORIGIN_LABELS,
  ANALYSIS_ORIGIN_OPTIONS,
  EXTERNAL_AI_TOOL_OPTIONS,
  RECORD_STATUS_LABELS,
  RECORD_STATUS_OPTIONS,
  RECORD_TYPE_LABELS,
  RECORD_TYPE_OPTIONS,
  RELATED_FIELD_LABELS,
  RELATED_FIELD_OPTIONS,
  SOURCE_STRENGTH_LABELS,
  SOURCE_STRENGTH_OPTIONS,
  SOURCE_TYPE_LABELS,
  SOURCE_TYPE_OPTIONS,
} from './technical-traceability.labels';

type FormSource = CharacterizationTechnicalRecordSourceInput & {
  localKey: string;
};

type FormState = {
  title: string;
  recordType: CharacterizationTechnicalRecordPayload['recordType'];
  analysisDate: string;
  responsibleName: string;
  analysisOrigin: CharacterizationTechnicalRecordPayload['analysisOrigin'];
  externalAiTool: string;
  externalAiModel: string;
  status: CharacterizationTechnicalRecordPayload['status'];
  technicalReport: string;
  relatedFields: CharacterizationTechnicalRecordPayload['relatedFields'];
  finalCharacterizationSnapshot: CharacterizationFinalSnapshot | null;
  sources: FormSource[];
};

const todayIsoDate = () => new Date().toISOString().slice(0, 10);

const createEmptySource = (sortOrder: number): FormSource => ({
  localKey: `source-${Date.now()}-${sortOrder}-${Math.random().toString(36).slice(2, 7)}`,
  sourceType: 'TECHNICAL_DATASHEET',
  authorInstitution: '',
  title: '',
  publicationOrRevisionDate: '',
  referenceOrRevision: '',
  fileName: '',
  url: '',
  accessedAt: '',
  sourceStrength: 'UNDEFINED',
  sourceClassification: '',
  informationUsed: '',
  limitations: '',
  applicationInCharacterization: '',
  sortOrder,
});

const buildInitialState = (
  record: CharacterizationTechnicalRecordItem | null,
  defaultResponsibleName: string,
): FormState => {
  if (!record) {
    return {
      title: '',
      recordType: 'TECHNICAL_FOUNDATION',
      analysisDate: todayIsoDate(),
      responsibleName: defaultResponsibleName,
      analysisOrigin: 'INTERNAL_RESEARCH',
      externalAiTool: '',
      externalAiModel: '',
      status: 'DRAFT',
      technicalReport: '',
      relatedFields: [],
      finalCharacterizationSnapshot: null,
      sources: [],
    };
  }

  return {
    title: record.title,
    recordType: record.recordType,
    analysisDate: record.analysisDate,
    responsibleName: record.responsibleName,
    analysisOrigin: record.analysisOrigin,
    externalAiTool: record.externalAiTool || '',
    externalAiModel: record.externalAiModel || '',
    status: record.status,
    technicalReport: record.technicalReport || '',
    relatedFields: record.relatedFields || [],
    finalCharacterizationSnapshot: record.finalCharacterizationSnapshot,
    sources: (record.sources || []).map((source, index) => ({
      localKey: source.id || `source-${index}`,
      id: source.id,
      sourceType: source.sourceType,
      authorInstitution: source.authorInstitution || '',
      title: source.title || '',
      publicationOrRevisionDate: source.publicationOrRevisionDate || '',
      referenceOrRevision: source.referenceOrRevision || '',
      fileName: source.fileName || '',
      url: source.url || '',
      accessedAt: source.accessedAt ? source.accessedAt.slice(0, 10) : '',
      sourceStrength: source.sourceStrength,
      sourceClassification: source.sourceClassification || '',
      informationUsed: source.informationUsed || '',
      limitations: source.limitations || '',
      applicationInCharacterization:
        source.applicationInCharacterization || '',
      sortOrder: source.sortOrder ?? index,
    })),
  };
};

const formatSnapshotText = (value: string[] | string | null | undefined) => {
  if (!value) return '—';
  if (Array.isArray(value)) {
    const cleaned = value
      .map((item) => String(item).replace(/\{type\}=.+$/, '').trim())
      .filter(Boolean);
    return cleaned.length ? cleaned.join('\n') : '—';
  }
  return String(value);
};

type TechnicalRecordFormDialogProps = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId: string;
  characterizationId: string;
  record: CharacterizationTechnicalRecordItem | null;
};

export const TechnicalRecordFormDialog: React.FC<
  TechnicalRecordFormDialogProps
> = ({
  open,
  onClose,
  companyId,
  workspaceId,
  characterizationId,
  record,
}) => {
  const { user } = useAuth();
  const defaultResponsibleName = user?.name || '';
  const [form, setForm] = useState<FormState>(() =>
    buildInitialState(record, defaultResponsibleName),
  );
  const [formError, setFormError] = useState<string | null>(null);
  const [expandedSourceKey, setExpandedSourceKey] = useState<string | false>(
    false,
  );

  const createMutation = useMutateCreateCharacterizationTechnicalRecord();
  const updateMutation = useMutateUpdateCharacterizationTechnicalRecord();
  const captureMutation = useMutateCaptureCharacterizationTechnicalSnapshot();

  const saving = createMutation.isPending || updateMutation.isPending;

  useEffect(() => {
    if (!open) return;
    const next = buildInitialState(record, defaultResponsibleName);
    setForm(next);
    setFormError(null);
    setExpandedSourceKey(next.sources[0]?.localKey || false);
  }, [open, record, defaultResponsibleName]);

  const isExternalAi =
    form.analysisOrigin === 'EXTERNAL_AI_USER_DECLARED';

  const canSubmit = useMemo(() => {
    const hasReport = Boolean(form.technicalReport.trim());
    const hasSources = form.sources.length > 0;
    return (
      Boolean(form.title.trim()) &&
      Boolean(form.analysisDate) &&
      Boolean(form.responsibleName.trim()) &&
      (hasReport || hasSources) &&
      (!isExternalAi || Boolean(form.externalAiTool.trim()))
    );
  }, [form, isExternalAi]);

  const updateField = <K extends keyof FormState>(
    key: K,
    value: FormState[K],
  ) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const updateSource = (
    localKey: string,
    patch: Partial<FormSource>,
  ) => {
    setForm((prev) => ({
      ...prev,
      sources: prev.sources.map((source) =>
        source.localKey === localKey ? { ...source, ...patch } : source,
      ),
    }));
  };

  const addSource = () => {
    const next = createEmptySource(form.sources.length);
    setForm((prev) => ({ ...prev, sources: [...prev.sources, next] }));
    setExpandedSourceKey(next.localKey);
  };

  const removeSource = (localKey: string) => {
    setForm((prev) => ({
      ...prev,
      sources: prev.sources
        .filter((source) => source.localKey !== localKey)
        .map((source, index) => ({ ...source, sortOrder: index })),
    }));
  };

  const moveSource = (localKey: string, direction: -1 | 1) => {
    setForm((prev) => {
      const index = prev.sources.findIndex((s) => s.localKey === localKey);
      const target = index + direction;
      if (index < 0 || target < 0 || target >= prev.sources.length) return prev;
      const next = [...prev.sources];
      const [item] = next.splice(index, 1);
      next.splice(target, 0, item);
      return {
        ...prev,
        sources: next.map((source, sortOrder) => ({ ...source, sortOrder })),
      };
    });
  };

  const toggleRelatedField = (
    field: NonNullable<FormState['relatedFields']>[number],
  ) => {
    setForm((prev) => {
      const current = prev.relatedFields || [];
      const exists = current.includes(field);
      return {
        ...prev,
        relatedFields: exists
          ? current.filter((item) => item !== field)
          : [...current, field],
      };
    });
  };

  const handleCaptureSnapshot = async () => {
    const snapshot = await captureMutation.mutateAsync({
      companyId,
      workspaceId,
      characterizationId,
    });
    updateField('finalCharacterizationSnapshot', snapshot);
  };

  const handleSubmit = async () => {
    setFormError(null);
    if (!canSubmit) {
      setFormError(
        'Preencha título, data, responsável e informe o relatório técnico ou ao menos uma fonte.',
      );
      return;
    }

    const payload: CharacterizationTechnicalRecordPayload = {
      title: form.title.trim(),
      recordType: form.recordType,
      analysisDate: form.analysisDate,
      responsibleName: form.responsibleName.trim(),
      analysisOrigin: form.analysisOrigin,
      externalAiTool: isExternalAi ? form.externalAiTool.trim() : null,
      externalAiModel: isExternalAi
        ? form.externalAiModel.trim() || null
        : null,
      status: form.status || 'DRAFT',
      technicalReport: form.technicalReport.trim() || null,
      relatedFields: form.relatedFields || [],
      finalCharacterizationSnapshot: form.finalCharacterizationSnapshot,
      sources: form.sources.map((source, index) => ({
        sourceType: source.sourceType,
        authorInstitution: source.authorInstitution || null,
        title: source.title || null,
        publicationOrRevisionDate: source.publicationOrRevisionDate || null,
        referenceOrRevision: source.referenceOrRevision || null,
        fileName: source.fileName || null,
        url: source.url || null,
        accessedAt: source.accessedAt || null,
        sourceStrength: source.sourceStrength || 'UNDEFINED',
        sourceClassification: source.sourceClassification || null,
        informationUsed: source.informationUsed || null,
        limitations: source.limitations || null,
        applicationInCharacterization:
          source.applicationInCharacterization || null,
        sortOrder: index,
      })),
    };

    if (record?.id) {
      await updateMutation.mutateAsync({
        companyId,
        workspaceId,
        characterizationId,
        recordId: record.id,
        ...payload,
      });
    } else {
      await createMutation.mutateAsync({
        companyId,
        workspaceId,
        characterizationId,
        ...payload,
      });
    }

    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        {record ? 'Editar registro técnico' : 'Adicionar registro técnico'}
      </DialogTitle>
      <DialogContent dividers>
        <Alert severity="info" sx={{ mb: 2 }}>
          Este registro é de rastreabilidade técnica. Ele não é inserido
          automaticamente nos documentos oficiais nem altera os campos da
          caracterização.
        </Alert>

        {formError && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {formError}
          </Alert>
        )}

        <SFlex direction="column" gap={2}>
          <TextField
            label="Título"
            required
            fullWidth
            value={form.title}
            onChange={(e) => updateField('title', e.target.value)}
          />

          <SFlex gap={2} flexWrap="wrap">
            <TextField
              select
              label="Tipo de registro"
              required
              sx={{ minWidth: 240, flex: 1 }}
              value={form.recordType}
              onChange={(e) =>
                updateField(
                  'recordType',
                  e.target.value as FormState['recordType'],
                )
              }
            >
              {RECORD_TYPE_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {RECORD_TYPE_LABELS[option]}
                </MenuItem>
              ))}
            </TextField>

            <TextField
              label="Data da análise"
              type="date"
              required
              sx={{ minWidth: 200 }}
              InputLabelProps={{ shrink: true }}
              value={form.analysisDate}
              onChange={(e) => updateField('analysisDate', e.target.value)}
            />

            <TextField
              select
              label="Situação do registro"
              sx={{ minWidth: 220, flex: 1 }}
              value={form.status}
              onChange={(e) =>
                updateField('status', e.target.value as FormState['status'])
              }
            >
              {RECORD_STATUS_OPTIONS.map((option) => (
                <MenuItem key={option} value={option}>
                  {RECORD_STATUS_LABELS[option]}
                </MenuItem>
              ))}
            </TextField>
          </SFlex>

          <TextField
            label="Responsável pelo registro"
            required
            fullWidth
            value={form.responsibleName}
            onChange={(e) => updateField('responsibleName', e.target.value)}
          />

          <TextField
            select
            label="Origem da análise"
            required
            fullWidth
            value={form.analysisOrigin}
            onChange={(e) =>
              updateField(
                'analysisOrigin',
                e.target.value as FormState['analysisOrigin'],
              )
            }
          >
            {ANALYSIS_ORIGIN_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {ANALYSIS_ORIGIN_LABELS[option]}
              </MenuItem>
            ))}
          </TextField>

          {isExternalAi && (
            <Box
              sx={{
                p: 2,
                border: '1px dashed',
                borderColor: 'warning.main',
                borderRadius: 1,
                bgcolor: 'warning.50',
              }}
            >
              <Alert severity="warning" sx={{ mb: 2 }}>
                Informação declarada pelo usuário. Não é uma execução automática
                do Assistente IA do SimpleSST.
              </Alert>
              <SFlex gap={2} flexWrap="wrap">
                <TextField
                  select
                  label="Ferramenta utilizada"
                  required
                  sx={{ minWidth: 220, flex: 1 }}
                  value={form.externalAiTool}
                  onChange={(e) =>
                    updateField('externalAiTool', e.target.value)
                  }
                >
                  {EXTERNAL_AI_TOOL_OPTIONS.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  label="Modelo utilizado (se conhecido)"
                  sx={{ minWidth: 240, flex: 1 }}
                  value={form.externalAiModel}
                  onChange={(e) =>
                    updateField('externalAiModel', e.target.value)
                  }
                  placeholder="Ex.: GPT-5.6 Thinking"
                />
              </SFlex>
            </Box>
          )}

          <TextField
            label="Relatório técnico da análise"
            fullWidth
            multiline
            minRows={8}
            value={form.technicalReport}
            onChange={(e) => updateField('technicalReport', e.target.value)}
            helperText="Pode incluir objeto, resumo técnico, divergências, limitações, critérios, decisões e conclusões."
          />

          <Box>
            <SFlex align="center" justify="space-between" sx={{ mb: 1 }}>
              <SText variant="body1" sx={{ fontWeight: 600 }}>
                Fontes vinculadas
              </SText>
              <SButton
                variant="outlined"
                text="+ Adicionar fonte"
                onClick={addSource}
              />
            </SFlex>

            {!form.sources.length && (
              <SText variant="caption" color="text.secondary">
                Nenhuma fonte vinculada. Você pode salvar com relatório técnico
                ou adicionar fontes.
              </SText>
            )}

            {form.sources.map((source, index) => (
              <Accordion
                key={source.localKey}
                expanded={expandedSourceKey === source.localKey}
                onChange={(_, expanded) =>
                  setExpandedSourceKey(expanded ? source.localKey : false)
                }
                sx={{ mb: 1 }}
              >
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <SFlex align="center" gap={1} sx={{ width: '100%', pr: 1 }}>
                    <SText variant="body2" sx={{ fontWeight: 600, flex: 1 }}>
                      Fonte {index + 1}
                      {source.title ? ` — ${source.title}` : ''}
                      {source.sourceType
                        ? ` (${SOURCE_TYPE_LABELS[source.sourceType]})`
                        : ''}
                    </SText>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSource(source.localKey, -1);
                      }}
                      disabled={index === 0}
                    >
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        moveSource(source.localKey, 1);
                      }}
                      disabled={index === form.sources.length - 1}
                    >
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeSource(source.localKey);
                      }}
                    >
                      <DeleteOutlineIcon fontSize="small" />
                    </IconButton>
                  </SFlex>
                </AccordionSummary>
                <AccordionDetails>
                  <SFlex direction="column" gap={2}>
                    <SFlex gap={2} flexWrap="wrap">
                      <TextField
                        select
                        label="Tipo de fonte"
                        sx={{ minWidth: 240, flex: 1 }}
                        value={source.sourceType}
                        onChange={(e) =>
                          updateSource(source.localKey, {
                            sourceType: e.target
                              .value as FormSource['sourceType'],
                          })
                        }
                      >
                        {SOURCE_TYPE_OPTIONS.map((option) => (
                          <MenuItem key={option} value={option}>
                            {SOURCE_TYPE_LABELS[option]}
                          </MenuItem>
                        ))}
                      </TextField>
                      <TextField
                        select
                        label="Força da fonte"
                        sx={{ minWidth: 180 }}
                        value={source.sourceStrength}
                        onChange={(e) =>
                          updateSource(source.localKey, {
                            sourceStrength: e.target
                              .value as FormSource['sourceStrength'],
                          })
                        }
                      >
                        {SOURCE_STRENGTH_OPTIONS.map((option) => (
                          <MenuItem key={option} value={option}>
                            {SOURCE_STRENGTH_LABELS[option]}
                          </MenuItem>
                        ))}
                      </TextField>
                    </SFlex>

                    <TextField
                      label="Autor / instituição"
                      fullWidth
                      value={source.authorInstitution || ''}
                      onChange={(e) =>
                        updateSource(source.localKey, {
                          authorInstitution: e.target.value,
                        })
                      }
                    />
                    <TextField
                      label="Título da fonte"
                      fullWidth
                      value={source.title || ''}
                      onChange={(e) =>
                        updateSource(source.localKey, { title: e.target.value })
                      }
                    />
                    <SFlex gap={2} flexWrap="wrap">
                      <TextField
                        label="Data de publicação/revisão"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 220 }}
                        value={source.publicationOrRevisionDate || ''}
                        onChange={(e) =>
                          updateSource(source.localKey, {
                            publicationOrRevisionDate: e.target.value,
                          })
                        }
                      />
                      <TextField
                        label="Referência / revisão"
                        sx={{ minWidth: 220, flex: 1 }}
                        value={source.referenceOrRevision || ''}
                        onChange={(e) =>
                          updateSource(source.localKey, {
                            referenceOrRevision: e.target.value,
                          })
                        }
                      />
                    </SFlex>
                    <SFlex gap={2} flexWrap="wrap">
                      <TextField
                        label="Nome do arquivo (referência textual)"
                        sx={{ minWidth: 220, flex: 1 }}
                        value={source.fileName || ''}
                        onChange={(e) =>
                          updateSource(source.localKey, {
                            fileName: e.target.value,
                          })
                        }
                        helperText="Anexos reais ficarão para uma fatia posterior."
                      />
                      <TextField
                        label="URL"
                        sx={{ minWidth: 220, flex: 1 }}
                        value={source.url || ''}
                        onChange={(e) =>
                          updateSource(source.localKey, { url: e.target.value })
                        }
                      />
                      <TextField
                        label="Data de acesso"
                        type="date"
                        InputLabelProps={{ shrink: true }}
                        sx={{ minWidth: 180 }}
                        value={source.accessedAt || ''}
                        onChange={(e) =>
                          updateSource(source.localKey, {
                            accessedAt: e.target.value,
                          })
                        }
                      />
                    </SFlex>
                    <TextField
                      label="Classificação da fonte"
                      fullWidth
                      value={source.sourceClassification || ''}
                      onChange={(e) =>
                        updateSource(source.localKey, {
                          sourceClassification: e.target.value,
                        })
                      }
                    />
                    <TextField
                      label="Informações utilizadas"
                      fullWidth
                      multiline
                      minRows={3}
                      value={source.informationUsed || ''}
                      onChange={(e) =>
                        updateSource(source.localKey, {
                          informationUsed: e.target.value,
                        })
                      }
                    />
                    <TextField
                      label="Limitações"
                      fullWidth
                      multiline
                      minRows={2}
                      value={source.limitations || ''}
                      onChange={(e) =>
                        updateSource(source.localKey, {
                          limitations: e.target.value,
                        })
                      }
                    />
                    <TextField
                      label="Aplicação na caracterização"
                      fullWidth
                      multiline
                      minRows={2}
                      value={source.applicationInCharacterization || ''}
                      onChange={(e) =>
                        updateSource(source.localKey, {
                          applicationInCharacterization: e.target.value,
                        })
                      }
                    />
                  </SFlex>
                </AccordionDetails>
              </Accordion>
            ))}
          </Box>

          <Box>
            <SText variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
              Relação com os campos da caracterização
            </SText>
            <FormGroup>
              {RELATED_FIELD_OPTIONS.map((field) => (
                <FormControlLabel
                  key={field}
                  control={
                    <Checkbox
                      checked={(form.relatedFields || []).includes(field)}
                      onChange={() => toggleRelatedField(field)}
                    />
                  }
                  label={RELATED_FIELD_LABELS[field]}
                />
              ))}
            </FormGroup>
          </Box>

          <Box>
            <SFlex align="center" justify="space-between" sx={{ mb: 1 }}>
              <SText variant="body1" sx={{ fontWeight: 600 }}>
                Texto final resultante (snapshot histórico)
              </SText>
              <SButton
                variant="outlined"
                text="Capturar versão atual da caracterização"
                onClick={handleCaptureSnapshot}
                loading={captureMutation.isPending}
              />
            </SFlex>

            {form.finalCharacterizationSnapshot ? (
              <Box
                sx={{
                  p: 2,
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: 'grey.50',
                }}
              >
                <Alert severity="info" sx={{ mb: 1 }}>
                  Cópia histórica independente. Alterações futuras na
                  caracterização não atualizam este snapshot.
                </Alert>
                <SText variant="caption" sx={{ display: 'block', mb: 1 }}>
                  Capturado em{' '}
                  {new Date(
                    form.finalCharacterizationSnapshot.capturedAt,
                  ).toLocaleString('pt-BR')}
                  {form.finalCharacterizationSnapshot.capturedByName
                    ? ` · por ${form.finalCharacterizationSnapshot.capturedByName}`
                    : ''}
                </SText>
                <SText variant="body2" sx={{ fontWeight: 600 }}>
                  Nome
                </SText>
                <SText variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                  {form.finalCharacterizationSnapshot.name || '—'}
                </SText>
                <SText variant="body2" sx={{ fontWeight: 600 }}>
                  Descrição
                </SText>
                <SText variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                  {formatSnapshotText(
                    form.finalCharacterizationSnapshot.description,
                  )}
                </SText>
                <SText variant="body2" sx={{ fontWeight: 600 }}>
                  Processos/atividades
                </SText>
                <SText variant="body2" sx={{ mb: 1, whiteSpace: 'pre-wrap' }}>
                  {formatSnapshotText(
                    form.finalCharacterizationSnapshot.workActivities,
                  )}
                </SText>
                <SText variant="body2" sx={{ fontWeight: 600 }}>
                  Considerações
                </SText>
                <SText variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
                  {formatSnapshotText(
                    form.finalCharacterizationSnapshot.considerations,
                  )}
                </SText>
              </Box>
            ) : (
              <SText variant="caption" color="text.secondary">
                Nenhum snapshot capturado ainda.
              </SText>
            )}
          </Box>
        </SFlex>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2 }}>
        <SButton variant="outlined" text="Cancelar" onClick={onClose} />
        <SButton
          variant="contained"
          text={record ? 'Salvar alterações' : 'Salvar registro'}
          onClick={handleSubmit}
          loading={saving}
          disabled={!canSubmit || saving}
        />
      </DialogActions>
    </Dialog>
  );
};
