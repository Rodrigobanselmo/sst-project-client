import React, { useMemo, useState } from 'react';

import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from '@mui/material';
import SFlex from 'components/atoms/SFlex';
import SText from 'components/atoms/SText';
import { useAccess } from 'core/hooks/useAccess';
import {
  FrpsRiskAnalysisAiMinParticipants,
  IFrpsPrivacySettings,
} from 'core/interfaces/api/IFrpsPrivacySettings';
import { useMutUpdateFrpsPrivacySettings } from 'core/services/hooks/mutations/company/useMutUpdateFrpsPrivacySettings/useMutUpdateFrpsPrivacySettings';
import { useQueryFrpsPrivacySettings } from 'core/services/hooks/queries/useQueryFrpsPrivacySettings/useQueryFrpsPrivacySettings';
import { canManageFrpsRiskAnalysisPrivacy } from 'core/utils/auth/frps-privacy-auth';
import { requiresFrpsRiskAnalysisPrivacyConfirmation } from 'core/utils/auth/frps-privacy-confirmation';
import { selectUserRoles } from 'store/reducers/user/userSlice';
import { useAppSelector } from 'core/hooks/useAppSelector';

type Props = {
  companyId?: string;
};

const AI_OPTIONS: FrpsRiskAnalysisAiMinParticipants[] = [1, 2, 3];

function buildReduceConfirmMessage(next: FrpsRiskAnalysisAiMinParticipants) {
  return [
    `Você está definindo o mínimo da Análise de Riscos com IA para ${next} participante(s).`,
    'Grupos menores aumentam o risco de identificação indireta dos respondentes.',
    'Esta decisão é assumida pela empresa.',
    'A política dos Indicadores e Gráficos continua obrigatoriamente em 3 participantes e não será alterada.',
  ].join('\n\n');
}

export function FrpsPrivacySettingsBlock({ companyId }: Props) {
  const roles = useAppSelector(selectUserRoles);
  const { isMaster } = useAccess();
  // Apresentação antecipada (antes/sem resposta da API). Fonte de verdade = data.canEdit.
  const canEditHint =
    isMaster || canManageFrpsRiskAnalysisPrivacy(roles ?? []);

  const { data, isLoading, isFetched } = useQueryFrpsPrivacySettings(companyId);
  const mutation = useMutUpdateFrpsPrivacySettings();

  const serverValue = data.riskAnalysisAiMinParticipants;
  const canEdit = isFetched ? Boolean(data.canEdit) : canEditHint;

  const [draft, setDraft] =
    useState<FrpsRiskAnalysisAiMinParticipants | null>(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValue, setPendingValue] =
    useState<FrpsRiskAnalysisAiMinParticipants | null>(null);

  const current = draft ?? serverValue;

  const dirty = useMemo(
    () => draft != null && draft !== serverValue,
    [draft, serverValue],
  );

  const handleSelect = (next: FrpsRiskAnalysisAiMinParticipants) => {
    if (!canEdit) return;
    setDraft(next);
  };

  const requestSave = () => {
    if (!canEdit || !dirty) return;
    const next = draft ?? serverValue;
    if (
      requiresFrpsRiskAnalysisPrivacyConfirmation({
        current: serverValue,
        next,
      })
    ) {
      setPendingValue(next);
      setConfirmOpen(true);
      return;
    }
    void persist(next);
  };

  const persist = async (next: FrpsRiskAnalysisAiMinParticipants) => {
    await mutation.mutateAsync({
      companyId,
      riskAnalysisAiMinParticipants: next,
    });
    setDraft(null);
    setConfirmOpen(false);
    setPendingValue(null);
  };

  if (isLoading && !data) {
    return null;
  }

  return (
    <Box mt={8} mb={2}>
      <SText mb={2} color="text.label" fontSize={14} fontWeight={600}>
        Privacidade psicossocial
      </SText>
      <SText mb={5} color="text.light" fontSize={12}>
        Regras de sigilo do módulo psicossocial. Indicadores e Gráficos
        permanecem fixos; a Análise de Riscos com IA pode ser ajustada pela
        empresa.
      </SText>

      <SFlex gap={5} flexWrap="wrap" align="flex-end">
        <TextField
          label="Indicadores e Gráficos (mín. participantes)"
          value={String(
            (data as IFrpsPrivacySettings).indicatorsMinParticipants ?? 3,
          )}
          size="small"
          InputProps={{ readOnly: true }}
          helperText="Regra fixa e inegociável — somente leitura"
          sx={{ minWidth: 280 }}
        />

        <FormControl size="small" sx={{ minWidth: 280 }} disabled={!canEdit}>
          <InputLabel id="frps-ai-min-label">
            Análise de Riscos com IA
          </InputLabel>
          <Select
            labelId="frps-ai-min-label"
            label="Análise de Riscos com IA"
            value={current}
            onChange={(e) =>
              handleSelect(Number(e.target.value) as FrpsRiskAnalysisAiMinParticipants)
            }
          >
            {AI_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                Mínimo {option} participante{option > 1 ? 's' : ''}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {canEdit && (
          <Button
            variant="contained"
            size="small"
            disabled={!dirty || mutation.isLoading}
            onClick={requestSave}
          >
            Salvar privacidade
          </Button>
        )}
      </SFlex>

      {!canEdit && (
        <Typography mt={2} variant="caption" color="text.secondary">
          Somente Administrador Máximo da empresa ou MASTER do sistema podem
          alterar o mínimo da Análise de Riscos com IA.
        </Typography>
      )}

      <Dialog open={confirmOpen} onClose={() => setConfirmOpen(false)}>
        <DialogTitle>Confirmar política de sigilo da Análise de Riscos</DialogTitle>
        <DialogContent>
          <Typography whiteSpace="pre-line">
            {pendingValue != null
              ? buildReduceConfirmMessage(pendingValue)
              : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmOpen(false)}>Cancelar</Button>
          <Button
            variant="contained"
            color="warning"
            disabled={mutation.isLoading || pendingValue == null}
            onClick={() => pendingValue != null && void persist(pendingValue)}
          >
            Confirmar e salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
