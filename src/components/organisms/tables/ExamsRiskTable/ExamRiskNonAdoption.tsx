import { useEffect, useRef, useState } from 'react';
import {
  Autocomplete,
  Box,
  Button,
  TextField,
  Typography,
} from '@mui/material';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import type { ICompanyExamRiskCoverageExamSummary as Exam } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';
import {
  fetchExamRiskRecommendationDecisions,
  updateExamRiskRecommendationDecision,
} from '@v2/services/medicine/company-exam-risk-recommendation-decision/company-exam-risk-recommendation-decision.service';
import {
  canDecideRecommendation,
  isNotAdoptedByDecision,
  recommendationDecisionPatch,
  resolveCurrentDecisionExam,
} from '@v2/services/medicine/company-exam-risk-recommendation-decision/company-exam-risk-recommendation-decision.util';

export const nonAdoptionReasonSuggestions = [
  'Exame redundante — finalidade já contemplada por outro exame.',
  'Não aplicável às condições específicas da empresa.',
  'Não previsto na relação de exames definida pelo médico responsável.',
  'Substituído por outro método de avaliação.',
  'Outro motivo:',
  'Não informado',
];
export function ExamRiskNonAdoption({
  companyId,
  workspaceId,
  riskId,
  exam,
  canUpdate,
  showAdoptSeparator = false,
  onSaved,
  onMessage,
}: {
  companyId: string;
  workspaceId?: string;
  riskId: string;
  exam?: Exam;
  canUpdate: boolean;
  showAdoptSeparator?: boolean;
  onSaved: () => Promise<unknown>;
  onMessage: (message: string) => void;
}) {
  const [editing, setEditing] = useState<Exam | null>(null);
  const [reason, setReason] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const reasonInput = useRef<HTMLInputElement | null>(null);
  const busy = useRef(false);
  const generation = useRef(0);
  useEffect(() => {
    setEditing(null);
    setReason('');
    setError('');
    setPending(false);
    busy.current = false;
    return () => {
      generation.current++;
    };
  }, [
    companyId,
    workspaceId,
    riskId,
    exam?.examId,
    exam?.nonAdoptionDecision?.fingerprint,
    exam?.nonAdoptionDecision?.version,
  ]);
  const scope = { companyId, workspaceId: workspaceId ?? '', riskId };
  const declined = isNotAdoptedByDecision(exam);
  const allowed =
    canUpdate && !!companyId && !!workspaceId && canDecideRecommendation(exam);
  const act = async (operation: 'OPEN' | 'DECLINE' | 'RECONSIDER') => {
    if (!allowed || busy.current) return;
    busy.current = true;
    const request = generation.current;
    setPending(true);
    setError('');
    onMessage('');
    let saved = false;
    try {
      let current = editing;
      if (operation !== 'DECLINE') {
        const detail = await fetchExamRiskRecommendationDecisions(scope);
        if (request !== generation.current) return;
        current = resolveCurrentDecisionExam(detail, riskId, exam!);
      }
      if (operation === 'OPEN') {
        setEditing(current);
        setReason('');
        return;
      }
      if (!current) return;
      const patch = recommendationDecisionPatch(
        scope,
        current,
        operation,
        reason,
      );
      await updateExamRiskRecommendationDecision(scope, patch);
      saved = true;
      if (request === generation.current) setEditing(null);
      await onSaved();
    } catch (cause: any) {
      if (saved) {
        if (request === generation.current)
          onMessage(
            'Decisão registrada, mas não foi possível atualizar todos os dados. Atualize a comparação.',
          );
      } else if (cause?.response?.status === 409) {
        const message =
          'A recomendação ou decisão foi alterada. Atualize os dados e tente novamente.';
        if (request === generation.current) {
          onMessage(message);
          setEditing(null);
        }
        try {
          await onSaved();
        } catch {
          if (request === generation.current)
            onMessage(`${message} Não foi possível atualizar a comparação.`);
        }
      } else if (request === generation.current) {
        setError(
          cause instanceof Error
            ? cause.message
            : 'Não foi possível registrar a decisão. Tente novamente.',
        );
      }
    } finally {
      if (request === generation.current) {
        busy.current = false;
        setPending(false);
      }
    }
  };
  if (!exam || exam.isAdopted) return null;
  return (
    <Box
      sx={{ display: 'inline' }}
      onClick={(event) => event.stopPropagation()}
    >
      {declined && (
        <Box mt={0.5}>
          <Typography
            variant="caption"
            color="info.main"
            display="flex"
            alignItems="center"
            gap={0.5}
          >
            <InfoOutlinedIcon sx={{ fontSize: 16 }} aria-hidden="true" /> Não
            adotado por decisão da empresa
          </Typography>
          <Typography variant="caption" color="text.secondary" display="block">
            Motivo: {exam.nonAdoptionDecision?.reason || 'não informado'}
          </Typography>
        </Box>
      )}
      {allowed && !editing && (
        <>
          {showAdoptSeparator && !declined && (
            <Typography
              component="span"
              color="text.disabled"
              aria-hidden="true"
              sx={{ mx: 0.5 }}
            >
              |
            </Typography>
          )}
          <Button
            size="small"
            color={declined ? 'warning' : 'error'}
            startIcon={
              <span
                aria-hidden="true"
                style={{
                  display: 'inline-block',
                  width: 6,
                  height: 6,
                  borderRadius: '50%',
                  backgroundColor: 'currentColor',
                }}
              />
            }
            disabled={pending}
            sx={{ ml: 1, py: 0, textTransform: 'uppercase' }}
            onClick={() => void act(declined ? 'RECONSIDER' : 'OPEN')}
            aria-label={`${declined ? 'Reconsiderar decisão' : 'Não adotar'} — ${exam.examName}`}
          >
            {pending
              ? 'Aguarde…'
              : declined
                ? 'Reconsiderar decisão'
                : 'Não adotar'}
          </Button>
        </>
      )}
      {allowed && editing && (
        <Box mt={1} sx={{ maxWidth: 550 }}>
          <Autocomplete
            freeSolo
            size="small"
            options={nonAdoptionReasonSuggestions}
            inputValue={reason}
            disabled={pending}
            onInputChange={(_event, value, action) => {
              // Selection is handled below; ignore MUI resets so freely edited
              // text and the trailing space in "Outro motivo: " are preserved.
              if (action === 'input' || action === 'clear') setReason(value);
            }}
            onChange={(_event, value, action) => {
              if (action === 'clear') {
                setReason('');
                return;
              }
              if (action !== 'selectOption') return;
              const text =
                value === 'Outro motivo:' ? 'Outro motivo: ' : (value ?? '');
              setReason(text);
              if (value === 'Outro motivo:') {
                requestAnimationFrame(() => {
                  reasonInput.current?.focus();
                  reasonInput.current?.setSelectionRange(
                    text.length,
                    text.length,
                  );
                });
              }
            }}
            renderInput={(params) => (
              <TextField
                {...params}
                autoFocus
                inputRef={reasonInput}
                label="Motivo da não adoção (opcional)"
                inputProps={{ ...params.inputProps, maxLength: 2000 }}
              />
            )}
          />
          <Button
            size="small"
            disabled={pending}
            onClick={() => void act('DECLINE')}
          >
            Registrar
          </Button>
          <Button
            size="small"
            disabled={pending}
            onClick={() => {
              setEditing(null);
              setReason('');
              setError('');
            }}
          >
            Cancelar
          </Button>
        </Box>
      )}
      {error && (
        <Typography
          variant="caption"
          color="error"
          display="block"
          role="alert"
        >
          {error}
        </Typography>
      )}
    </Box>
  );
}
