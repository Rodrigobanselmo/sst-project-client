import { FC, useState } from 'react';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import SettingsIcon from '@mui/icons-material/Settings';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from '@mui/material';

import type { SystemAiMasterConfig } from '@v2/components/molecules/AiActionButtonGroup/system-ai-master-config.types';
import { useGenerateCompanyExamRiskAiPromptDraft } from '@v2/services/medicine/company-exam-risk-ai-suggestions/hooks/useGenerateCompanyExamRiskAiPromptDraft';
import type { IGenerateCompanyExamRiskAiPromptDraftResponse } from '@v2/services/medicine/company-exam-risk-ai-suggestions/company-exam-risk-ai-suggestions.types';

import { ExamRiskAiPromptDraftMasterConfigDialog } from './ExamRiskAiPromptDraftMasterConfigDialog';
import {
  applyExamRiskAiPromptDraft,
  hasAnyExamRiskAiPromptDraftFieldFilled,
  type ExamRiskAiPromptDraftCurrentState,
  type ExamRiskAiPromptDraftMergeMode,
} from './exam-risk-ai-prompt-draft-merge.util';

type Props = {
  companyId: string;
  riskId: string;
  workspaceId?: string;
  isMasterAdmin?: boolean;
  currentState: ExamRiskAiPromptDraftCurrentState;
  onApplyDraft: (next: ExamRiskAiPromptDraftCurrentState) => void;
  onRiskContextResolved?: (
    draft: IGenerateCompanyExamRiskAiPromptDraftResponse,
  ) => void;
};

export const ExamRiskAiPromptDraftSection: FC<Props> = ({
  companyId,
  riskId,
  workspaceId,
  isMasterAdmin = false,
  currentState,
  onApplyDraft,
  onRiskContextResolved,
}) => {
  const promptDraftMutation = useGenerateCompanyExamRiskAiPromptDraft();
  const [userGuidance, setUserGuidance] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingDraft, setPendingDraft] =
    useState<IGenerateCompanyExamRiskAiPromptDraftResponse | null>(null);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [masterConfigOpen, setMasterConfigOpen] = useState(false);
  const [masterSessionConfig, setMasterSessionConfig] =
    useState<SystemAiMasterConfig>({});

  const buildCurrentFields = () => ({
    modelName: currentState.presetName,
    modelDescription: currentState.presetDescription,
    examSearch: currentState.formValues.examSearch,
    examType: currentState.formValues.examType,
    suggestedCandidateLimit: currentState.formValues.limit,
    instructions: currentState.formValues.instructions,
    positiveExamples: currentState.formValues.positiveExamples,
    negativeExamples: currentState.formValues.negativeExamples,
    cautions: currentState.formValues.cautionRules,
    sessionAdditionalInstruction: currentState.formValues.sessionInstruction,
  });

  const applyDraftWithMode = (
    draft: IGenerateCompanyExamRiskAiPromptDraftResponse,
    mode: ExamRiskAiPromptDraftMergeMode,
  ) => {
    onApplyDraft(applyExamRiskAiPromptDraft(currentState, draft, mode));
    setSuccessMessage(
      'Sugestão aplicada nos campos editáveis. Revise antes de rodar o dry-run.',
    );
    setErrorMessage('');
    setPendingDraft(null);
    setMergeDialogOpen(false);
  };

  const handleDraftReady = (
    draft: IGenerateCompanyExamRiskAiPromptDraftResponse,
  ) => {
    onRiskContextResolved?.(draft);

    if (hasAnyExamRiskAiPromptDraftFieldFilled(currentState)) {
      setPendingDraft(draft);
      setMergeDialogOpen(true);
      return;
    }

    applyDraftWithMode(draft, 'empty-only');
  };

  const onGeneratePromptDraft = async () => {
    setErrorMessage('');
    setSuccessMessage('');

    try {
      const draft = await promptDraftMutation.mutateAsync({
        companyId,
        riskId,
        workspaceId,
        userGuidance: userGuidance.trim() || undefined,
        currentFields: buildCurrentFields(),
        ...(isMasterAdmin
          ? {
              model: masterSessionConfig.model,
              sessionCustomPrompt: masterSessionConfig.customPrompt,
            }
          : {}),
      });
      handleDraftReady(draft);
    } catch {
      setErrorMessage(
        'Não foi possível gerar a sugestão de prompt com IA. Os campos atuais foram mantidos.',
      );
    }
  };

  return (
    <>
      <Stack spacing={2}>
        <Typography variant="subtitle1">Sugestão de prompt com IA</Typography>
        <Alert severity="info">
          A IA apenas sugere textos e filtros para revisão. Nada será salvo,
          vinculado ou analisado automaticamente.
        </Alert>
        <TextField
          label="Orientação para gerar o prompt"
          value={userGuidance}
          onChange={(event) => setUserGuidance(event.target.value)}
          multiline
          minRows={2}
          fullWidth
          placeholder="Ex.: seja conservador; focar avaliação clínica ocupacional; evitar exames laboratoriais"
        />
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          <Button
            variant="outlined"
            disabled={promptDraftMutation.isLoading}
            startIcon={
              promptDraftMutation.isLoading ? (
                <CircularProgress size={16} />
              ) : (
                <AutoAwesomeIcon />
              )
            }
            onClick={onGeneratePromptDraft}
          >
            {promptDraftMutation.isLoading
              ? 'Gerando sugestão...'
              : 'Gerar sugestão de prompt com IA'}
          </Button>
          {isMasterAdmin && (
            <Button
              variant="text"
              startIcon={<SettingsIcon />}
              onClick={() => setMasterConfigOpen(true)}
            >
              Configurar prompt da geração
            </Button>
          )}
        </Box>
        {isMasterAdmin &&
          (masterSessionConfig.customPrompt || masterSessionConfig.model) && (
            <Alert severity="success">
              Configuração MASTER de sessão ativa
              {masterSessionConfig.model
                ? ` (modelo: ${masterSessionConfig.model})`
                : ''}
              . Será usada apenas nesta geração.
            </Alert>
          )}
        {errorMessage && (
          <Alert severity="warning">
            <Typography variant="body2">{errorMessage}</Typography>
          </Alert>
        )}
        {successMessage && (
          <Alert severity="success">
            <Typography variant="body2">{successMessage}</Typography>
          </Alert>
        )}
      </Stack>

      {isMasterAdmin && (
        <ExamRiskAiPromptDraftMasterConfigDialog
          open={masterConfigOpen}
          onClose={() => setMasterConfigOpen(false)}
          onApply={(config) => {
            setMasterSessionConfig(config);
            setMasterConfigOpen(false);
          }}
        />
      )}

      <Dialog
        open={mergeDialogOpen}
        onClose={() => setMergeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Aplicar sugestão de prompt</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary">
            Alguns campos já estão preenchidos. Como deseja aplicar a sugestão
            da IA?
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMergeDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={() =>
              pendingDraft && applyDraftWithMode(pendingDraft, 'empty-only')
            }
          >
            Preencher apenas campos vazios
          </Button>
          <Button
            variant="contained"
            onClick={() =>
              pendingDraft && applyDraftWithMode(pendingDraft, 'replace-all')
            }
          >
            Substituir todos
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
