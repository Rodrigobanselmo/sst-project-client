import { FC, ReactNode, useCallback, useMemo, useState } from 'react';

import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import {
  Alert,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Grid,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { SAutocompleteSelect } from '@v2/components/forms/fields/SAutocompleteSelect/SAutocompleteSelect';
import { SInputFileDropZone } from '@v2/components/forms/fields/SInputFileDropZone/SInputFileDropZone';
import { useGetCompanyId } from 'core/hooks/useGetCompanyId';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import { useFetchHoMethodRiskSearch } from '@v2/services/occupational-hygiene/ho-method/hooks/useFetchHoMethodRiskSearch';
import { useMutateCreateHoMethod } from '@v2/services/occupational-hygiene/ho-method/hooks/useMutateHoMethod';
import {
  parseHoMethodPdf,
  uploadHoMethodDocument,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.service';
import type {
  HoMethodImportAgentSuggestion,
  HoMethodImportConfidence,
  HoMethodImportParseResult,
  HoMethodRiskFactorSnapshot,
} from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';
import { HoMethodSourceEnum } from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';
import { useDebouncedCallback } from 'use-debounce';

import { HO_METHOD_SOURCE_OPTIONS } from '../maps/ho-method.maps';
import { getHoMethodApiErrorMessage } from '../utils/ho-method-error.util';
import {
  IMPORT_CONFIDENCE_LABELS,
  buildImportSubmitPayload,
  importAgentsFromParseResult,
  importFormFromParseResult,
  type HoMethodImportFormState,
} from '../utils/ho-method-import.util';
import {
  buildRiskOptionLabel,
  mapRiskFactorsToHoMethodSnapshot,
  mapRiskSnapshotToRiskFactors,
} from '../utils/ho-method-evaluation.util';

type Props = {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

type ImportFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  confidence?: HoMethodImportConfidence;
  helperText?: string;
  multiline?: boolean;
  select?: boolean;
  options?: { value: string; label: string }[];
};

const confidenceColor = (confidence?: HoMethodImportConfidence) => {
  if (confidence === 'low') return 'warning';
  if (confidence === 'medium') return 'info';
  return 'default';
};

const ImportField: FC<ImportFieldProps> = ({
  label,
  value,
  onChange,
  confidence,
  helperText,
  multiline,
  select,
  options,
}) => (
  <TextField
    fullWidth
    label={label}
    value={value}
    onChange={(e) => onChange(e.target.value)}
    multiline={multiline}
    minRows={multiline ? 2 : undefined}
    select={select}
    helperText={
      helperText ??
      (confidence
        ? `Confiança da extração: ${IMPORT_CONFIDENCE_LABELS[confidence]}`
        : undefined)
    }
    color={confidence === 'low' ? 'warning' : undefined}
    focused={confidence === 'low'}
    InputProps={{
      endAdornment: confidence ? (
        <Chip
          size="small"
          label={IMPORT_CONFIDENCE_LABELS[confidence]}
          color={confidenceColor(confidence)}
          sx={{ ml: 1 }}
        />
      ) : undefined,
    }}
  >
    {select &&
      options?.map((option) => (
        <MenuItem key={option.value} value={option.value}>
          {option.label}
        </MenuItem>
      ))}
  </TextField>
);

export const HoMethodImportPdfModal: FC<Props> = ({
  open,
  onClose,
  onSuccess,
}) => {
  const { companyId } = useGetCompanyId();
  const createMutation = useMutateCreateHoMethod();

  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [parseResult, setParseResult] = useState<HoMethodImportParseResult | null>(
    null,
  );
  const [form, setForm] = useState<HoMethodImportFormState | null>(null);
  const [parsing, setParsing] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setAgentSearch] = useState('');
  const [debouncedAgentSearch, setDebouncedAgentSearch] = useState('');

  const debouncedSearch = useDebouncedCallback((value: string) => {
    setDebouncedAgentSearch(value);
  }, 350);

  const { data: riskOptions = [], isLoading: loadingRisks } =
    useFetchHoMethodRiskSearch(debouncedAgentSearch, companyId, open);

  const riskAutocompleteOptions = useMemo(
    () => riskOptions.map(mapRiskSnapshotToRiskFactors),
    [riskOptions],
  );

  const resetState = useCallback(() => {
    setPdfFile(null);
    setParseResult(null);
    setForm(null);
    setParsing(false);
    setSubmitting(false);
    setError(null);
    setAgentSearch('');
    setDebouncedAgentSearch('');
  }, []);

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileSelect = async (file: File | null) => {
    setPdfFile(file);
    setParseResult(null);
    setForm(null);
    setError(null);

    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.pdf')) {
      setError('Selecione um arquivo PDF (.pdf).');
      return;
    }

    setParsing(true);
    try {
      const result = await parseHoMethodPdf(file);
      setParseResult(result);
      setForm(importFormFromParseResult(result));
    } catch (err) {
      setError(getHoMethodApiErrorMessage(err, 'Falha ao extrair campos do PDF.'));
    } finally {
      setParsing(false);
    }
  };

  const updateForm = (patch: Partial<HoMethodImportFormState>) => {
    setForm((current) => (current ? { ...current, ...patch } : current));
  };

  const updateAgentMatch = (
    index: number,
    risk: HoMethodRiskFactorSnapshot | null,
  ) => {
    setParseResult((current) => {
      if (!current) return current;

      const agents = [...current.agents];
      agents[index] = {
        ...agents[index],
        matchedRiskFactor: risk,
        found: Boolean(risk),
      };

      const unmatched = agents.filter((agent) => !agent.found);
      const canConfirm =
        current.isSupportedMethod &&
        Boolean(current.fields.methodCode.value ?? form?.methodCode) &&
        agents.length > 0 &&
        unmatched.length === 0;

      return {
        ...current,
        agents,
        canConfirm,
        confirmBlockReason: canConfirm
          ? null
          : unmatched.length > 0
            ? 'Vincule todos os agentes a fatores de risco químicos cadastrados antes de confirmar.'
            : current.confirmBlockReason,
      };
    });
  };

  const canConfirmImport =
    parseResult?.canConfirm &&
    allAgentsLinked(parseResult.agents) &&
    Boolean(form?.methodCode.trim());

  const handleConfirm = async () => {
    if (!pdfFile || !parseResult || !form || !companyId) return;

    if (!canConfirmImport) {
      setError(
        parseResult.confirmBlockReason ??
          'Revise os campos e vincule os agentes antes de confirmar.',
      );
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const upload = await uploadHoMethodDocument({
        companyId,
        file: pdfFile,
      });

      const agents = importAgentsFromParseResult(parseResult);
      const payload = buildImportSubmitPayload({
        form,
        agents,
        fileUpload: {
          fileId: upload.fileId,
          name: upload.name,
          uploadedAt: upload.uploadedAt,
        },
      });

      await createMutation.mutateAsync(payload);
      onSuccess?.();
      handleClose();
    } catch (err) {
      setError(getHoMethodApiErrorMessage(err, 'Falha ao extrair campos do PDF.'));
    } finally {
      setSubmitting(false);
    }
  };

  const fields = parseResult?.fields;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="lg" fullWidth>
      <DialogTitle>Importar método por PDF</DialogTitle>
      <DialogContent dividers>
        <Box display="flex" flexDirection="column" gap={2}>
          <Alert severity="info">
            Envie um PDF de método NIOSH/NMAM. O sistema extrai os campos
            principais para revisão antes de salvar no cadastro. Agentes sem
            fator de risco químico cadastrado devem ser vinculados manualmente.
          </Alert>

          {error && <Alert severity="error">{error}</Alert>}

          <SInputFileDropZone
            accept={{ 'application/pdf': ['.pdf'] }}
            label="Arraste o PDF do método NIOSH/NMAM ou clique para selecionar"
            maxFiles={1}
            disabled={parsing || submitting}
            onDrop={(acceptedFiles) => {
              void handleFileSelect(acceptedFiles[0] ?? null);
            }}
          />

          {parsing && (
            <Box display="flex" alignItems="center" gap={1}>
              <CircularProgress size={20} />
              <Typography variant="body2">
                Extraindo campos do PDF…
              </Typography>
            </Box>
          )}

          {parseResult && form && fields && (
            <>
              {parseResult.warnings.map((warning) => (
                <Alert key={warning} severity="warning">
                  {warning}
                </Alert>
              ))}

              {parseResult.possibleDuplicate.exists && (
                <Alert severity="warning">
                  {parseResult.possibleDuplicate.message ??
                    'Método possivelmente já cadastrado.'}
                </Alert>
              )}

              {parseResult.confirmBlockReason && !canConfirmImport && (
                <Alert severity="error">{parseResult.confirmBlockReason}</Alert>
              )}

              <Section title="Identificação">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <ImportField
                      label="Instituição / fonte"
                      value={form.institution}
                      confidence={fields.institution.confidence}
                      onChange={(value) =>
                        updateForm({
                          institution: value as HoMethodSourceEnum,
                        })
                      }
                      select
                      options={HO_METHOD_SOURCE_OPTIONS.map((option) => ({
                        value: option.value,
                        label: option.label,
                      }))}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ImportField
                      label="Código do método"
                      value={form.methodCode}
                      confidence={fields.methodCode.confidence}
                      onChange={(value) => updateForm({ methodCode: value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ImportField
                      label="Issue / versão"
                      value={form.methodVersion}
                      confidence={fields.methodVersion.confidence}
                      onChange={(value) => updateForm({ methodVersion: value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ImportField
                      label="Data da issue"
                      value={form.issueDate}
                      confidence={fields.issueDate.confidence}
                      onChange={(value) => updateForm({ issueDate: value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ImportField
                      label="Evaluation"
                      value={form.evaluation}
                      confidence={fields.evaluation.confidence}
                      onChange={(value) => updateForm({ evaluation: value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ImportField
                      label="Nome de exibição"
                      value={form.displayName}
                      confidence={fields.displayName.confidence}
                      onChange={(value) => updateForm({ displayName: value })}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ImportField
                      label="Método analítico"
                      value={form.analyticalMethod}
                      confidence={fields.analyticalMethod.confidence}
                      onChange={(value) =>
                        updateForm({ analyticalMethod: value })
                      }
                    />
                  </Grid>
                </Grid>
              </Section>

              <Section title="Agentes">
                {parseResult.agents.map((agent, index) => (
                  <AgentRow
                    key={`${agent.substanceName}-${agent.cas ?? index}`}
                    agent={agent}
                    riskOptions={riskAutocompleteOptions}
                    loadingRisks={loadingRisks}
                    onSearch={(value) => {
                      setAgentSearch(value);
                      debouncedSearch(value);
                    }}
                    onSelectRisk={(risk) =>
                      updateAgentMatch(
                        index,
                        risk ? mapRiskFactorsToHoMethodSnapshot(risk) : null,
                      )
                    }
                  />
                ))}
              </Section>

              <Section title="Amostragem permitida pelo método">
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <ImportField
                      label="Amostrador sugerido (SAMPLER)"
                      value={form.samplerName}
                      confidence={fields.sampler.confidence}
                      onChange={(value) => updateForm({ samplerName: value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <ImportField
                      label="Vazão mínima"
                      value={form.minimumFlowRate}
                      confidence={fields.minimumFlowRate.confidence}
                      onChange={(value) =>
                        updateForm({ minimumFlowRate: value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <ImportField
                      label="Vazão máxima"
                      value={form.maximumFlowRate}
                      confidence={fields.maximumFlowRate.confidence}
                      onChange={(value) =>
                        updateForm({ maximumFlowRate: value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <ImportField
                      label="Unidade de vazão"
                      value={form.flowRateUnit}
                      confidence={fields.flowRateUnit.confidence}
                      onChange={(value) => updateForm({ flowRateUnit: value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <ImportField
                      label="Envio (SHIPMENT)"
                      value={form.shipment}
                      confidence={fields.shipment.confidence}
                      onChange={(value) => updateForm({ shipment: value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <ImportField
                      label="Volume mínimo (VOL-MIN)"
                      value={form.minimumVolume}
                      confidence={fields.minimumVolume.confidence}
                      onChange={(value) =>
                        updateForm({ minimumVolume: value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <ImportField
                      label="Volume máximo (MAX)"
                      value={form.maximumVolume}
                      confidence={fields.maximumVolume.confidence}
                      onChange={(value) =>
                        updateForm({ maximumVolume: value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={3}>
                    <ImportField
                      label="Unidade de volume"
                      value={form.volumeUnit}
                      confidence={fields.volumeUnit.confidence}
                      onChange={(value) => updateForm({ volumeUnit: value })}
                    />
                  </Grid>
                </Grid>
              </Section>

              <Section title="Conservação / preparo">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={4}>
                    <ImportField
                      label="Estabilidade (dias)"
                      value={form.stabilityDays}
                      confidence={fields.stabilityDays.confidence}
                      onChange={(value) => updateForm({ stabilityDays: value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={8}>
                    <ImportField
                      label="Estabilidade (texto)"
                      value={form.stabilityText}
                      confidence={fields.stabilityText.confidence}
                      onChange={(value) => updateForm({ stabilityText: value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ImportField
                      label="Temperatura de armazenamento"
                      value={form.storageTemperature}
                      confidence={fields.storageTemperature.confidence}
                      onChange={(value) =>
                        updateForm({ storageTemperature: value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ImportField
                      label="Unidade de temperatura"
                      value={form.storageTemperatureUnit}
                      confidence={fields.storageTemperatureUnit.confidence}
                      onChange={(value) =>
                        updateForm({ storageTemperatureUnit: value })
                      }
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ImportField
                      label="Desorption / solvente"
                      value={form.extractionSolvent}
                      confidence={fields.extractionSolvent.confidence}
                      onChange={(value) =>
                        updateForm({ extractionSolvent: value })
                      }
                    />
                  </Grid>
                </Grid>
              </Section>

              <Section title="Técnica analítica">
                <Grid container spacing={2}>
                  <Grid item xs={12} md={6}>
                    <ImportField
                      label="Technique"
                      value={form.technique}
                      confidence={fields.technique.confidence}
                      onChange={(value) => updateForm({ technique: value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <ImportField
                      label="Analyte"
                      value={form.analyte}
                      confidence={fields.analyte.confidence}
                      onChange={(value) => updateForm({ analyte: value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ImportField
                      label="Detector"
                      value={form.detector}
                      confidence={fields.detector.confidence}
                      onChange={(value) => updateForm({ detector: value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ImportField
                      label="LOD"
                      value={form.lod}
                      confidence={fields.lod.confidence}
                      onChange={(value) => updateForm({ lod: value })}
                    />
                  </Grid>
                  <Grid item xs={12} md={4}>
                    <ImportField
                      label="Range"
                      value={form.range}
                      confidence={fields.range.confidence}
                      onChange={(value) => updateForm({ range: value })}
                    />
                  </Grid>
                </Grid>
              </Section>

              <Section title="Observações">
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <ImportField
                      label="Applicability"
                      value={form.applicability}
                      confidence={fields.applicability.confidence}
                      onChange={(value) => updateForm({ applicability: value })}
                      multiline
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ImportField
                      label="Interferences"
                      value={form.interferences}
                      confidence={fields.interferences.confidence}
                      onChange={(value) => updateForm({ interferences: value })}
                      multiline
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <ImportField
                      label="Observações consolidadas"
                      value={form.notes}
                      onChange={(value) => updateForm({ notes: value })}
                      multiline
                    />
                  </Grid>
                </Grid>
              </Section>

              <Section title="PDF original">
                <Paper variant="outlined" sx={{ p: 2 }}>
                  <Box display="flex" alignItems="center" gap={1}>
                    <PictureAsPdfIcon color="error" />
                    <Box>
                      <Typography variant="body2">{pdfFile?.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        O PDF será anexado ao método após a confirmação.
                      </Typography>
                    </Box>
                  </Box>
                </Paper>
              </Section>
            </>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={submitting}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleConfirm}
          disabled={!canConfirmImport || submitting || parsing}
        >
          {submitting ? 'Salvando…' : 'Confirmar importação'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

function allAgentsLinked(agents: HoMethodImportAgentSuggestion[]) {
  return agents.length > 0 && agents.every((agent) => agent.found);
}

const Section: FC<{ title: string; children: ReactNode }> = ({
  title,
  children,
}) => (
  <Box>
    <Typography variant="subtitle1" gutterBottom>
      {title}
    </Typography>
    {children}
  </Box>
);

type AgentRowProps = {
  agent: HoMethodImportAgentSuggestion;
  riskOptions: IRiskFactors[];
  loadingRisks: boolean;
  onSearch: (value: string) => void;
  onSelectRisk: (risk: IRiskFactors | null) => void;
};

const AgentRow: FC<AgentRowProps> = ({
  agent,
  riskOptions,
  loadingRisks,
  onSearch,
  onSelectRisk,
}) => {
  const selectedRisk = agent.matchedRiskFactor
    ? mapRiskSnapshotToRiskFactors(agent.matchedRiskFactor)
    : null;

  return (
    <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
      <Grid container spacing={2} alignItems="center">
        <Grid item xs={12} md={4}>
          <Typography variant="body2" fontWeight={600}>
            {agent.substanceName}
          </Typography>
          {agent.cas && (
            <Typography variant="caption" color="text.secondary">
              CAS {agent.cas}
            </Typography>
          )}
          {agent.synonyms.length > 0 && (
            <Typography variant="caption" display="block" color="text.secondary">
              Sinônimos: {agent.synonyms.join(', ')}
            </Typography>
          )}
        </Grid>
        <Grid item xs={12} md={8}>
          <SAutocompleteSelect
            label="Fator de risco químico"
            options={riskOptions}
            loading={loadingRisks}
            value={selectedRisk}
            getOptionLabel={(option) => buildRiskOptionLabel(option)}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            filterOptions={(options) => options}
            openOnFocus
            onInputChange={(_, value) => onSearch(value)}
            onChange={(_, value) => onSelectRisk(value)}
            placeholder="Buscar por nome, sinônimo ou CAS"
            errorMessage={
              agent.found
                ? undefined
                : 'Agente não encontrado — vincule a um fator de risco cadastrado.'
            }
          />
        </Grid>
      </Grid>
    </Paper>
  );
};
