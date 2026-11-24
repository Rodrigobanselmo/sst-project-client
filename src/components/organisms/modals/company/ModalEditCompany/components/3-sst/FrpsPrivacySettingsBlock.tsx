import React, { useImperativeHandle, useMemo, useRef, useState } from 'react';

import {
  Box,
  Checkbox,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  FormControlLabel,
  Switch,
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
  FrpsParticipantGrant,
} from 'core/interfaces/api/IFrpsPrivacySettings';
import { useMutUpdateFrpsPrivacySettings } from 'core/services/hooks/mutations/company/useMutUpdateFrpsPrivacySettings/useMutUpdateFrpsPrivacySettings';
import { useQueryFrpsPrivacySettings } from 'core/services/hooks/queries/useQueryFrpsPrivacySettings/useQueryFrpsPrivacySettings';
import { canManageFrpsRiskAnalysisPrivacy } from 'core/utils/auth/frps-privacy-auth';
import { requiresFrpsRiskAnalysisPrivacyConfirmation } from 'core/utils/auth/frps-privacy-confirmation';
import { selectUserRoles } from 'store/reducers/user/userSlice';
import { useAppSelector } from 'core/hooks/useAppSelector';

export type SaveFrpsPrivacy = (onSaved: () => void) => void;

type Props = {
  saveRef?: React.Ref<SaveFrpsPrivacy>;
  companyId?: string;
  /**
   * Mantém o estado do modal alinhado após "Salvar privacidade",
   * evitando que o "Salvar" geral reenvie frpsPrivacy stale.
   */
  onPrivacySaved?: (
    riskAnalysisAiMinParticipants: FrpsRiskAnalysisAiMinParticipants,
  ) => void;
};

const AI_OPTIONS: FrpsRiskAnalysisAiMinParticipants[] = [1, 2, 3];

function formatMinimumParticipants(minimum: number) {
  return `Mínimo ${minimum} participante${minimum === 1 ? '' : 's'}`;
}

function buildReduceConfirmMessage(next: FrpsRiskAnalysisAiMinParticipants) {
  return [
    `Você está definindo o mínimo da Análise de Riscos com IA para ${next} participante(s).`,
    'Grupos menores aumentam o risco de identificação indireta dos respondentes.',
    'Esta decisão é assumida pela empresa.',
    'A política dos Indicadores e Gráficos continua obrigatoriamente em 3 participantes e não será alterada.',
  ].join('\n\n');
}

export function FrpsPrivacySettingsBlock({ companyId, onPrivacySaved, saveRef }: Props) {
  const roles = useAppSelector(selectUserRoles);
  const { isMaster } = useAccess();
  // Apresentação antecipada (antes/sem resposta da API). Fonte de verdade = data.canEdit.
  const canEditHint = isMaster || canManageFrpsRiskAnalysisPrivacy(roles ?? []);

  const { data, isLoading, isFetched } = useQueryFrpsPrivacySettings(companyId);
  const mutation = useMutUpdateFrpsPrivacySettings();

  const serverValue = data.riskAnalysisAiMinParticipants;
  const canEdit = isFetched ? Boolean(data.canEdit) : canEditHint;

  const [draft, setDraft] = useState<FrpsRiskAnalysisAiMinParticipants | null>(
    null,
  );
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingValue, setPendingValue] =
    useState<FrpsRiskAnalysisAiMinParticipants | null>(null);

  const [partialResultsDraft, setPartialResultsDraft] = useState<
    boolean | null
  >(null);
  const serverPartialResults = data.allowPartialResults === true;
  const partialResults = partialResultsDraft ?? serverPartialResults;
  const partialResultsChanged = partialResults !== serverPartialResults;

  const [restrictedDraft, setRestrictedDraft] = useState<boolean | null>(null);
  const [grantsDraft, setGrantsDraft] = useState<FrpsParticipantGrant[] | null>(null);
  const restricted = restrictedDraft ?? data.restrictParticipantIdentity === true;
  const grants = grantsDraft ?? data.participantGrants ?? [];
  const policyChanged = restricted !== (data.restrictParticipantIdentity === true) || JSON.stringify(grants) !== JSON.stringify(data.participantGrants ?? []);
  const newIndividualAccess = grants.some(g => g.level === 'ANSWERS' && !(data.participantGrants ?? []).some(old => old.userId === g.userId && old.level === 'ANSWERS'));
  const setGrant = (userId:number, level:FrpsParticipantGrant['level'] | null) => {
    setGrantsDraft([...grants.filter(g=>g.userId!==userId), ...(level ? [{userId,level}] : [])].sort((a,b)=>a.userId-b.userId));
  };

  const current = draft ?? serverValue;

  const dirty = useMemo(
    () => draft != null && draft !== serverValue,
    [draft, serverValue],
  );

  const handleSelect = (next: FrpsRiskAnalysisAiMinParticipants) => {
    if (!canEdit) return;
    setDraft(next);
  };

  const pendingOnSaved = useRef<(() => void) | undefined>(undefined);

  const closeConfirmation = () => {
    pendingOnSaved.current = undefined;
    setConfirmOpen(false);
    setPendingValue(null);
  };

  const requestSave = (onSaved?: () => void) => {
    if (mutation.isLoading) return;
    if (!dirty && !partialResultsChanged && !policyChanged) {
      onSaved?.();
      return;
    }
    if (!canEdit) return;
    const next = draft ?? serverValue;
    if (
      newIndividualAccess || requiresFrpsRiskAnalysisPrivacyConfirmation({
        current: serverValue,
        next,
      })
    ) {
      pendingOnSaved.current = onSaved;
      setPendingValue(next);
      setConfirmOpen(true);
      return;
    }
    persist(next, onSaved);
  };

  const persist = (
    next: FrpsRiskAnalysisAiMinParticipants,
    onSaved?: () => void,
  ) => {
    mutation.mutate(
      {
        companyId,
        ...(policyChanged && { restrictParticipantIdentity: restricted, participantGrants: grants, confirmIndividualAccess: newIndividualAccess }),
        ...(dirty && { riskAnalysisAiMinParticipants: next }),
        ...(partialResultsChanged && { allowPartialResults: partialResults }),
      },
      {
        onSuccess: (result) => {
          if (!result) return;
          if (dirty) onPrivacySaved?.(next);
          setRestrictedDraft(null);
          setGrantsDraft(null);
          setPartialResultsDraft(null);
          setDraft(null);
          closeConfirmation();
          onSaved?.();
        },
      },
    );
  };

  useImperativeHandle(saveRef, () => requestSave);

  if (isLoading && !data) {
    return null;
  }

  return (
    <Box>
      <SText mb={5} color="text.light" fontSize={12}>
        Regras de sigilo do módulo psicossocial. Indicadores e Gráficos
        permanecem fixos; a Análise de Riscos com IA pode ser ajustada pela
        empresa.
      </SText>

      <SFlex gap={5} flexWrap="wrap" align="flex-start">
        <TextField
          label="Indicadores e Gráficos"
          value={formatMinimumParticipants(
            data.indicatorsMinParticipants ?? 3,
          )}
          size="small"
          InputProps={{ readOnly: true }}
          helperText={
            <>
              <Box
                component="span"
                sx={(theme) => ({
                  color: theme.palette.mode === 'dark' ? '#FFD740' : '#806000',
                })}
              >
                Regra fixa <strong>inegociável</strong>
              </Box>
              {' — somente leitura'}
            </>
          }
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
              handleSelect(
                Number(e.target.value) as FrpsRiskAnalysisAiMinParticipants,
              )
            }
          >
            {AI_OPTIONS.map((option) => (
              <MenuItem key={option} value={option}>
                {formatMinimumParticipants(option)}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {canEdit && (
          <Button
            variant="contained"
            size="small"
            disabled={(!dirty && !partialResultsChanged && !policyChanged) || mutation.isLoading}
            onClick={() => requestSave()}
            sx={(theme) => ({
              '&.Mui-disabled': {
                ...(theme.palette.mode === 'dark' && {
                  color: theme.palette.text.secondary,
                  backgroundColor: theme.palette.background.divider,
                }),
              },
            })}
          >
            Salvar privacidade
          </Button>
        )}
      </SFlex>

      <Box mt={3}>
        <FormControlLabel
          control={
            <Switch
              checked={partialResults}
              sx={(theme) => ({
                '& .Mui-checked .MuiSwitch-thumb': {
                  ...(theme.palette.mode === 'dark' && {
                    boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
                  }),
                },
              })}
              onChange={(_, checked) => setPartialResultsDraft(checked)}
              disabled={!canEdit || isLoading || mutation.isLoading}
            />
          }
          label="Exibir Gráficos e Indicadores antes da conclusão"
          sx={{
            '& .MuiFormControlLabel-label:not(.Mui-disabled)': {
              color: 'text.primary',
            },
          }}
        />
        <Typography display="block" variant="caption" color="text.secondary">
          Campanhas concluídas exibem resultados automaticamente. O mínimo de
          três respostas válidas por pergunta no recorte vale para os resultados
          parciais.
        </Typography>
      </Box>

      <Box mt={8} sx={{borderTop:'1px solid',borderColor:'divider',pt:6}}>
        <FormControlLabel control={<Switch checked={restricted} disabled={!canEdit || mutation.isLoading} onChange={(_,checked)=>{setRestrictedDraft(checked);if(!checked)setGrantsDraft([]);}} />} label="Restringir a identificação dos participantes a usuários autorizados" />
        <Typography variant="body2" color="text.secondary">Desativado: mantém a identificação disponível conforme as permissões atuais. Ativado: somente os usuários selecionados abaixo veem quem respondeu. As regras dos resultados agregados permanecem.</Typography>
        {restricted && <Box mt={6}>
          <Typography fontWeight={600} mb={4}>Usuários autorizados nesta empresa</Typography>
          {(data.eligibleUsers ?? []).map(user=>{
            const grant=grants.find(g=>g.userId===user.userId);
            return <Box key={user.userId} sx={{display:'flex',alignItems:'center',flexWrap:'wrap',gap:6,py:4,borderBottom:'1px solid',borderColor:'divider'}}>
              <FormControlLabel sx={{flex:'1 1 240px'}} control={<Checkbox disabled={!canEdit || mutation.isLoading} checked={!!grant} onChange={(_,checked)=>setGrant(user.userId,checked?'IDENTITY':null)} />} label={<Box><Typography>{user.name}</Typography><Typography variant="caption" color="text.secondary">{user.email}</Typography></Box>} />
              {grant && <FormControl size="small" sx={{minWidth:260,flex:'1 1 300px'}} disabled={!canEdit || mutation.isLoading}>
                <InputLabel id={`frps-grant-${user.userId}`}>Nível de acesso</InputLabel>
                <Select labelId={`frps-grant-${user.userId}`} label="Nível de acesso" value={grant.level} onChange={e=>setGrant(user.userId,e.target.value as FrpsParticipantGrant['level'])}>
                  <MenuItem value="IDENTITY">Identificação e participação</MenuItem>
                  <MenuItem value="ANSWERS" disabled={!user.medicalRegistration}>Acesso completo às respostas individuais</MenuItem>
                </Select>
              </FormControl>}
              {grant && !user.medicalRegistration && <Box sx={{flexBasis:'100%'}}>
                <Typography variant="caption" color="warning.main">Para acesso individual, vincule o usuário a um cadastro de médico ativo com CRM e UF. CPF e anexo não são exigidos.</Typography>
                {isMaster && companyId && <Box mt={2}>
                  <Button component="a" href={`/dashboard/empresas/${encodeURIComponent(companyId)}/profissionais/todos`} target="_blank" rel="noopener noreferrer" size="small">Abrir cadastros profissionais para vincular</Button>
                  <Typography display="block" variant="caption" color="text.secondary">Abra o cadastro do médico e, em “Conta de acesso deste profissional e documentos”, selecione a conta de {user.name} e confirme que ela pertence ao profissional. Depois, volte a esta tela e selecione o acesso completo.</Typography>
                </Box>}
              </Box>}
              {grant && user.medicalRegistration && <Typography variant="caption">CRM-{user.medicalRegistration.councilUF} {user.medicalRegistration.councilId} · informado no cadastro</Typography>}
            </Box>;
          })}
          <Typography variant="body2" mt={4}>Identificação e participação permite ver quem respondeu. Acesso completo também permite consultar todas as respostas identificadas de cada empregado, desde que haja cadastro de médico ativo com CRM e UF vinculado à conta. O registro é informado no cadastro, sem verificação automática no conselho. Sem usuários selecionados, ninguém terá acesso nominal.</Typography>
        </Box>}
      </Box>

      {!canEdit && (
        <Typography mt={2} variant="caption" color="text.secondary">
          Somente Administrador Máximo da empresa ou MASTER do sistema podem
          alterar estas configurações.
        </Typography>
      )}

      <Dialog open={confirmOpen} onClose={closeConfirmation}>
        <DialogTitle>
          Confirmar alteração de privacidade
        </DialogTitle>
        <DialogContent>
          <Typography whiteSpace="pre-line">
            {newIndividualAccess ? `Você está liberando acesso a todas as respostas individuais identificadas dos empregados para: ${grants.filter(g=>g.level==='ANSWERS').map(g=>data.eligibleUsers?.find(u=>u.userId===g.userId)?.name ?? g.userId).join(', ')}. Essa autorização e seu responsável serão registrados.` : pendingValue != null ? buildReduceConfirmMessage(pendingValue) : ''}
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeConfirmation}>Cancelar</Button>
          <Button
            variant="contained"
            color="warning"
            disabled={mutation.isLoading || pendingValue == null}
            onClick={() => pendingValue != null && persist(pendingValue, pendingOnSaved.current)}
          >
            Confirmar e salvar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
