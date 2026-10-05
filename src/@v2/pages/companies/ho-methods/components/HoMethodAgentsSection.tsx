import { FC, useEffect, useState } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Box,
  Button,
  Chip,
  Grid,
  IconButton,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { SAutocompleteSelect } from '@v2/components/forms/fields/SAutocompleteSelect/SAutocompleteSelect';
import { IRiskFactors } from 'core/interfaces/api/IRiskFactors';
import type { HoMethodRiskMatchConfidence } from '@v2/services/occupational-hygiene/ho-method/service/ho-method.types';

import {
  HO_METHOD_CHEMICAL_PHASE_INFO,
  buildRiskOptionLabel,
} from '../utils/ho-method-evaluation.util';
import { HO_METHOD_MATCH_CONFIDENCE_LABELS } from '../utils/ho-method-create-risk.util';
import type { MethodAgentFormItem } from '../utils/ho-method-agents.util';
import {
  applyAgentCollection,
  deriveAgentCollection,
  formatAgentCollectionLine,
  parseAgentCollectionNumber,
  type AgentCollectionSampling,
} from '../utils/ho-method-agent-sampling.util';

type Props = {
  methodAgents: MethodAgentFormItem[];
  activeAgentLocalId: string | null;
  onChangeActiveAgent: (localId: string) => void;
  onRemoveAgent: (localId: string) => void;
  agentPickerRisk: IRiskFactors | null;
  riskOptions: IRiskFactors[];
  loadingRisks: boolean;
  casValue: string;
  onAgentSearchInput: (value: string) => void;
  onSelectAgentToAdd: (risk: IRiskFactors | null) => void;
  onCasChange: (value: string) => void;
  onCreateRisk?: () => void;
  onChangeAgentCollection?: (
    localId: string,
    conditions: MethodAgentFormItem['evaluationConditions'],
  ) => void;
  matchConfidence?: HoMethodRiskMatchConfidence;
  riskFactorError?: string;
};

export const HoMethodAgentsSection: FC<Props> = ({
  methodAgents,
  activeAgentLocalId,
  onChangeActiveAgent,
  onRemoveAgent,
  agentPickerRisk,
  riskOptions,
  loadingRisks,
  casValue,
  onAgentSearchInput,
  onSelectAgentToAdd,
  onCasChange,
  onCreateRisk,
  onChangeAgentCollection,
  matchConfidence,
  riskFactorError,
}) => {
  const activeAgent =
    methodAgents.find((agent) => agent.localId === activeAgentLocalId) ??
    methodAgents[0] ??
    null;

  return (
    <>
      <Typography variant="subtitle2" gutterBottom>
        Agentes e classificação
      </Typography>
      <Grid container spacing={2} mb={1}>
        <Grid item xs={12} md={8}>
          <SAutocompleteSelect
            label="Adicionar agente (fator de risco)"
            options={riskOptions}
            loading={loadingRisks}
            value={agentPickerRisk}
            getOptionLabel={(option) => buildRiskOptionLabel(option)}
            isOptionEqualToValue={(a, b) => a.id === b.id}
            filterOptions={(options) => options}
            openOnFocus
            onInputChange={(_, value) => onAgentSearchInput(value)}
            onChange={(_, value) => onSelectAgentToAdd(value)}
            placeholder="Buscar por nome, sinônimo ou CAS (somente químicos)"
            errorMessage={riskFactorError}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="CAS"
            value={casValue}
            onChange={(e) => onCasChange(e.target.value)}
            placeholder="Digite o CAS para buscar o agente"
            helperText="Busca remota por CAS, nome e sinônimos (químicos)"
          />
        </Grid>
        {onCreateRisk && (
          <Grid item xs={12}>
            <Button variant="outlined" size="small" onClick={onCreateRisk}>
              Criar fator de risco químico
            </Button>
            {matchConfidence && matchConfidence !== 'high' && (
              <Typography variant="caption" color="text.secondary" display="block" mt={0.5}>
                {HO_METHOD_MATCH_CONFIDENCE_LABELS[matchConfidence]}
              </Typography>
            )}
          </Grid>
        )}
        <Grid item xs={12}>
          <Alert severity="info">{HO_METHOD_CHEMICAL_PHASE_INFO}</Alert>
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            label="Tipo de agente"
            value="Químico"
            disabled
            helperText="Nesta fase, apenas agentes químicos"
          />
        </Grid>
      </Grid>

      {methodAgents.length > 0 ? (
        <Box display="flex" flexDirection="column" gap={1} mb={3}>
          {methodAgents.map((agent) => {
            const isActive =
              agent.localId === (activeAgentLocalId ?? methodAgents[0]?.localId);
            return (
              <Paper
                key={agent.localId}
                variant="outlined"
                sx={{
                  p: 1.5,
                  borderColor: isActive ? 'primary.main' : 'divider',
                  bgcolor: isActive ? 'action.hover' : 'background.paper',
                }}
              >
                <Box
                  display="flex"
                  alignItems="center"
                  justifyContent="space-between"
                  gap={1}
                >
                  <Box
                    flex={1}
                    onClick={() => onChangeActiveAgent(agent.localId)}
                    sx={{ cursor: 'pointer' }}
                  >
                    <Typography variant="body2">{agent.agentName}</Typography>
                    <Typography variant="caption" color="text.secondary" display="block">
                      {agent.cas ? `CAS ${agent.cas}` : 'CAS não informado no cadastro'}
                      {' · '}
                      {agent.evaluationConditions.length} condição(ões)
                    </Typography>
                    <AgentCollectionSummary agent={agent} />
                  </Box>
                  <Chip
                    size="small"
                    label={isActive ? 'Ativo' : 'Selecionar'}
                    color={isActive ? 'primary' : 'default'}
                    onClick={() => onChangeActiveAgent(agent.localId)}
                  />
                  <IconButton
                    size="small"
                    color="error"
                    aria-label="Remover agente"
                    onClick={() => onRemoveAgent(agent.localId)}
                  >
                    <CloseIcon fontSize="small" />
                  </IconButton>
                </Box>
                {isActive && onChangeAgentCollection && (
                  <AgentCollectionEditor
                    key={agent.localId}
                    agent={agent}
                    onChange={(patch) =>
                      onChangeAgentCollection(
                        agent.localId,
                        applyAgentCollection(agent.evaluationConditions, patch),
                      )
                    }
                  />
                )}
              </Paper>
            );
          })}
        </Box>
      ) : (
        <Alert severity="warning" sx={{ mb: 3 }}>
          Adicione ao menos um agente/fator de risco para configurar limites e
          condições de avaliação.
        </Alert>
      )}

      {!activeAgent && methodAgents.length === 0 && onCreateRisk && (
        <Alert severity="info" sx={{ mb: 3 }}>
          Se o agente não existir no cadastro, use &quot;Criar fator de risco
          químico&quot; para adicioná-lo sem sair desta tela.
        </Alert>
      )}
    </>
  );
};

const AgentCollectionSummary = ({ agent }: { agent: MethodAgentFormItem }) => {
  const derived = deriveAgentCollection(agent.evaluationConditions);
  if (derived.kind === 'absent') return null;

  return (
    <Typography variant="caption" color="text.secondary" display="block">
      {derived.kind === 'uniform'
        ? `Coleta: ${formatAgentCollectionLine(derived.sampling)}`
        : 'Coleta diferente entre as condições ocupacionais'}
    </Typography>
  );
};

type CollectionDraft = {
  minimumFlowRate: string;
  maximumFlowRate: string;
  flowRateUnit: string;
  minimumVolume: string;
  maximumVolume: string;
  volumeUnit: string;
};

const formatDraftNumber = (value: number | null) =>
  value == null ? '' : String(value).replace('.', ',');

const AgentCollectionEditor = ({
  agent,
  onChange,
}: {
  agent: MethodAgentFormItem;
  onChange: (patch: Partial<AgentCollectionSampling>) => void;
}) => {
  const derived = deriveAgentCollection(agent.evaluationConditions);
  const sampling = derived.kind === 'absent' ? null : derived.sampling;
  const [draft, setDraft] = useState<CollectionDraft>(() => ({
    minimumFlowRate: formatDraftNumber(sampling?.minimumFlowRate ?? null),
    maximumFlowRate: formatDraftNumber(sampling?.maximumFlowRate ?? null),
    flowRateUnit: sampling?.flowRateUnit ?? '',
    minimumVolume: formatDraftNumber(sampling?.minimumVolume ?? null),
    maximumVolume: formatDraftNumber(sampling?.maximumVolume ?? null),
    volumeUnit: sampling?.volumeUnit ?? '',
  }));

  const samplingKey = sampling
    ? [
        sampling.minimumFlowRate,
        sampling.maximumFlowRate,
        sampling.minimumVolume,
        sampling.maximumVolume,
        sampling.flowRateUnit,
        sampling.volumeUnit,
      ].join('|')
    : '';

  useEffect(() => {
    if (!sampling) return;
    setDraft((current) => {
      const parsed = {
        minimumFlowRate: parseAgentCollectionNumber(current.minimumFlowRate),
        maximumFlowRate: parseAgentCollectionNumber(current.maximumFlowRate),
        minimumVolume: parseAgentCollectionNumber(current.minimumVolume),
        maximumVolume: parseAgentCollectionNumber(current.maximumVolume),
      };
      const incomplete = Object.values(parsed).some((value) => value === undefined);
      if (incomplete) return current;
      const same =
        parsed.minimumFlowRate === sampling.minimumFlowRate &&
        parsed.maximumFlowRate === sampling.maximumFlowRate &&
        parsed.minimumVolume === sampling.minimumVolume &&
        parsed.maximumVolume === sampling.maximumVolume &&
        current.flowRateUnit === (sampling.flowRateUnit ?? '') &&
        current.volumeUnit === (sampling.volumeUnit ?? '');
      if (same) return current;
      return {
        minimumFlowRate: formatDraftNumber(sampling.minimumFlowRate),
        maximumFlowRate: formatDraftNumber(sampling.maximumFlowRate),
        flowRateUnit: sampling.flowRateUnit ?? '',
        minimumVolume: formatDraftNumber(sampling.minimumVolume),
        maximumVolume: formatDraftNumber(sampling.maximumVolume),
        volumeUnit: sampling.volumeUnit ?? '',
      };
    });
  }, [sampling, samplingKey]);

  if (!sampling || derived.kind === 'absent') return null;

  const updateNumber = (
    key: 'minimumFlowRate' | 'maximumFlowRate' | 'minimumVolume' | 'maximumVolume',
    value: string,
  ) => {
    setDraft((current) => ({ ...current, [key]: value }));
    const parsed = parseAgentCollectionNumber(value);
    if (parsed === undefined) return;
    onChange({ [key]: parsed });
  };

  const updateUnit = (key: 'flowRateUnit' | 'volumeUnit', value: string) => {
    setDraft((current) => ({ ...current, [key]: value }));
    onChange({ [key]: value.trim() ? value : null });
  };

  return (
    <Box mt={1.5}>
      <Typography variant="caption" display="block" sx={{ mb: 1 }}>
        Condição de coleta
        {derived.kind === 'mixed'
          ? ' — os valores diferem entre as condições ocupacionais. Editar aplica a mesma coleta a todas elas.'
          : ' — vale para todas as condições ocupacionais deste agente.'}
      </Typography>
      <Grid container spacing={1.5}>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Vazão mínima"
            value={draft.minimumFlowRate}
            onChange={(event) => updateNumber('minimumFlowRate', event.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Vazão máxima"
            value={draft.maximumFlowRate}
            onChange={(event) => updateNumber('maximumFlowRate', event.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Unidade de vazão"
            value={draft.flowRateUnit}
            onChange={(event) => updateUnit('flowRateUnit', event.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Volume mínimo"
            value={draft.minimumVolume}
            onChange={(event) => updateNumber('minimumVolume', event.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Volume máximo"
            value={draft.maximumVolume}
            onChange={(event) => updateNumber('maximumVolume', event.target.value)}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <TextField
            fullWidth
            size="small"
            label="Unidade de volume"
            value={draft.volumeUnit}
            onChange={(event) => updateUnit('volumeUnit', event.target.value)}
          />
        </Grid>
      </Grid>
    </Box>
  );
};
