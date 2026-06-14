import { FC } from 'react';

import CloseIcon from '@mui/icons-material/Close';
import {
  Alert,
  Box,
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

import {
  HO_METHOD_CHEMICAL_PHASE_INFO,
  buildRiskOptionLabel,
} from '../utils/ho-method-evaluation.util';
import type { MethodAgentFormItem } from '../utils/ho-method-agents.util';

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
        <Grid item xs={12}>
          <Alert severity="info">{HO_METHOD_CHEMICAL_PHASE_INFO}</Alert>
        </Grid>
        <Grid item xs={12}>
          <Alert severity="info">
            Cadastre o fator de risco químico antes de vinculá-lo ao método de
            HO. Esta tela não cria novos agentes.
          </Alert>
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
                    <Typography variant="caption" color="text.secondary">
                      {agent.cas ? `CAS ${agent.cas}` : 'CAS não informado no cadastro'}
                      {' · '}
                      {agent.evaluationConditions.length} condição(ões)
                    </Typography>
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
    </>
  );
};
