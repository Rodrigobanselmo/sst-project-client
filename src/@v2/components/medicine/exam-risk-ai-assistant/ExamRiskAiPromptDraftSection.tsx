import { FC, useEffect, useRef, useState } from 'react';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import RestoreIcon from '@mui/icons-material/Restore';
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
  Tooltip,
  Typography,
} from '@mui/material';

import type { SystemAiMasterConfig } from '@v2/components/molecules/AiActionButtonGroup/system-ai-master-config.types';
import { useGenerateCompanyExamRiskAiPromptDraft } from '@v2/services/medicine/company-exam-risk-ai-suggestions/hooks/useGenerateCompanyExamRiskAiPromptDraft';
import { fetchCompanyExamRiskAiPromptGuidanceDefault } from '@v2/services/medicine/company-exam-risk-ai-suggestions/company-exam-risk-ai-suggestions.service';
import type { IGenerateCompanyExamRiskAiPromptDraftResponse } from '@v2/services/medicine/company-exam-risk-ai-suggestions/company-exam-risk-ai-suggestions.types';

import { ExamRiskAiPromptDraftMasterConfigDialog } from './ExamRiskAiPromptDraftMasterConfigDialog';
import { ExamRiskAiPromptGuidanceMasterConfigDialog } from './ExamRiskAiPromptGuidanceMasterConfigDialog';
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

/**
 * Precedence for "Orientação para gerar o prompt":
 * 1) texto editado na sessão (nunca sobrescrito silenciosamente);
 * 2) orientação do modelo de pesquisa salvo, se o formulário a aplicar explicitamente;
 * 3) SystemAiPrompt EXAM_RISK_AI_PROMPT_GUIDANCE_DEFAULT;
 * 4) fallback embarcado.
 */
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
  const [guidanceSourceLabel, setGuidanceSourceLabel] = useState('');
  const [guidanceLoading, setGuidanceLoading] = useState(true);
  const [usedEmbeddedFallback, setUsedEmbeddedFallback] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [pendingDraft, setPendingDraft] =
    useState<IGenerateCompanyExamRiskAiPromptDraftResponse | null>(null);
  const [mergeDialogOpen, setMergeDialogOpen] = useState(false);
  const [masterGenerationConfigOpen, setMasterGenerationConfigOpen] =
    useState(false);
  const [masterGuidanceConfigOpen, setMasterGuidanceConfigOpen] =
    useState(false);
  const [masterSessionConfig, setMasterSessionConfig] =
    useState<SystemAiMasterConfig>({});
  const userEditedGuidanceRef = useRef(false);

  const applyOfficialContent = (content: string, sourceLabel: string) => {
    setGuidanceSourceLabel(sourceLabel);
    if (!userEditedGuidanceRef.current) {
      setUserGuidance(content);
    }
  };

  const loadGuidance = async (opts?: { forceRestore?: boolean }) => {
    setGuidanceLoading(true);
    try {
      const response =
        await fetchCompanyExamRiskAiPromptGuidanceDefault(companyId);
      const label =
        response.source === 'database'
          ? 'SystemAiPrompt (padrão oficial)'
          : 'padrão embarcado (fallback)';
      setUsedEmbeddedFallback(Boolean(response.usedEmbeddedFallback));
      setGuidanceSourceLabel(label);
      if (opts?.forceRestore || !userEditedGuidanceRef.current) {
        userEditedGuidanceRef.current = false;
        setUserGuidance(response.content);
      }
    } catch {
      setUsedEmbeddedFallback(true);
      setGuidanceSourceLabel('padrão indisponível — edite manualmente');
    } finally {
      setGuidanceLoading(false);
    }
  };

  useEffect(() => {
    void loadGuidance();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- load once per company open
  }, [companyId]);

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

  const onRestoreGuidanceDefault = async () => {
    setErrorMessage('');
    setSuccessMessage('');
    await loadGuidance({ forceRestore: true });
    setSuccessMessage(
      'Orientação restaurada a partir do SystemAiPrompt (ou fallback embarcado).',
    );
  };

  return (
    <>
      <Stack spacing={2}>
        <Typography variant="subtitle1">Sugestão de prompt com IA</Typography>
        <Alert severity="info">
          1) Orientação padrão → orienta a geração · 2) Prompt gerado → controla
          a análise · 3) Contexto técnico → descreve a exposição · 4) Dry-run →
          executa a revisão. Nada é vinculado automaticamente aqui.
        </Alert>
        <Alert severity="info">
          Precedência da orientação: sessão editada → modelo de pesquisa (se
          aplicar explicitamente) → SystemAiPrompt → fallback embarcado. O modelo
          de pesquisa substitui apenas os campos do formulário que ele preenche;
          a orientação de sessão permanece independente até você restaurar o
          padrão.
        </Alert>
        <Tooltip title="A edição vale apenas para esta sessão e não altera o padrão global (SystemAiPrompt).">
          <TextField
            label="Orientação para gerar o prompt"
            value={userGuidance}
            onChange={(event) => {
              userEditedGuidanceRef.current = true;
              setUserGuidance(event.target.value);
            }}
            multiline
            minRows={4}
            fullWidth
            disabled={guidanceLoading && !userGuidance}
            helperText={
              guidanceLoading
                ? 'Carregando padrão do sistema…'
                : guidanceSourceLabel
                  ? `Origem: ${guidanceSourceLabel}. Edição de sessão não altera o padrão global.`
                  : 'Edição de sessão.'
            }
          />
        </Tooltip>
        {usedEmbeddedFallback && (
          <Alert severity="warning">
            Usando padrão embarcado (fallback). O SystemAiPrompt pode estar
            indisponível ou sem conteúdo persistido.
          </Alert>
        )}
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
          <Button
            variant="text"
            disabled={guidanceLoading}
            startIcon={<RestoreIcon />}
            onClick={() => void onRestoreGuidanceDefault()}
          >
            Restaurar padrão
          </Button>
          {isMasterAdmin && (
            <>
              <Button
                variant="text"
                startIcon={<SettingsIcon />}
                onClick={() => setMasterGuidanceConfigOpen(true)}
              >
                Configurar orientação padrão
              </Button>
              <Button
                variant="text"
                startIcon={<SettingsIcon />}
                onClick={() => setMasterGenerationConfigOpen(true)}
              >
                Configurar prompt da geração
              </Button>
            </>
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
        <>
          <ExamRiskAiPromptGuidanceMasterConfigDialog
            open={masterGuidanceConfigOpen}
            onClose={() => setMasterGuidanceConfigOpen(false)}
            onApply={(config) => {
              // Session apply of MASTER override for guidance is not used for dry-run;
              // saving default happens inside the dialog. Refresh official copy for Restaurar.
              if (config.customPrompt?.trim()) {
                applyOfficialContent(
                  config.customPrompt.trim(),
                  'SystemAiPrompt (aplicado na sessão MASTER)',
                );
              }
              void loadGuidance();
              setMasterGuidanceConfigOpen(false);
            }}
          />
          <ExamRiskAiPromptDraftMasterConfigDialog
            open={masterGenerationConfigOpen}
            onClose={() => setMasterGenerationConfigOpen(false)}
            onApply={(config) => {
              setMasterSessionConfig(config);
              setMasterGenerationConfigOpen(false);
            }}
          />
        </>
      )}

      <Dialog
        open={mergeDialogOpen}
        onClose={() => setMergeDialogOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Como aplicar a sugestão?</DialogTitle>
        <DialogContent>
          <Typography variant="body2">
            Já existem campos preenchidos. Escolha se a sugestão deve preencher
            apenas os vazios ou substituir todos os campos editáveis. A orientação
            de sessão acima não é alterada por este merge.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setMergeDialogOpen(false)}>Cancelar</Button>
          <Button
            onClick={() =>
              pendingDraft && applyDraftWithMode(pendingDraft, 'empty-only')
            }
          >
            Preencher só vazios
          </Button>
          <Button
            variant="contained"
            onClick={() =>
              pendingDraft && applyDraftWithMode(pendingDraft, 'replace-all')
            }
          >
            Substituir tudo
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};
