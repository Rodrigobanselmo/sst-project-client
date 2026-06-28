import { FC, useEffect, useMemo, useState } from 'react';

import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CloseIcon from '@mui/icons-material/Close';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import NextLink from 'next/link';
import { SInput } from '@v2/components/forms/fields/SInput/SInput';
import { useFetchBiologicalIndicatorById } from '@v2/services/medicine/biological-indicator/hooks/useFetchBiologicalIndicatorById';
import { useFetchBiologicalIndicatorExamCandidates } from '@v2/services/medicine/biological-indicator/hooks/useFetchBiologicalIndicatorExamCandidates';
import {
  useMutateConfirmBiologicalIndicatorExamLink,
  useMutateConfirmBiologicalIndicatorRiskLink,
  useMutateCreateBiologicalIndicatorExamLink,
  useMutateRejectBiologicalIndicatorExamLink,
  useMutateRejectBiologicalIndicatorRiskLink,
  useMutateSetDefaultBiologicalIndicatorExamLink,
  useMutateSetPrimaryBiologicalIndicatorRiskLink,
  useMutateUpdateBiologicalIndicatorStatus,
} from '@v2/services/medicine/biological-indicator/hooks/useMutateBiologicalIndicatorCuration';
import type {
  BiologicalIndicatorDetail,
  BiologicalIndicatorExamLink,
  BiologicalIndicatorRiskLink,
  ExamCandidate,
} from '@v2/services/medicine/biological-indicator/service/biological-indicator.types';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoutesEnum } from 'core/enums/routes.enums';
import { RoleEnum } from 'project/enum/roles.enums';

import {
  BIOLOGICAL_INDICATOR_STATUS_LABELS,
  BIOLOGICAL_INDICATOR_TABLE_LABELS,
  BIOLOGICAL_INDICATOR_TYPE_LABELS,
  NORMATIVE_REVIEW_HELPER_TEXT,
  NORMATIVE_REVIEW_SUGGESTION_HELPER_TEXT,
  PRIMARY_RISK_HELPER_TEXT,
  buildNormativeReviewSuggestion,
  formatNormativeSource,
  formatTechnicalObservations,
  getPendencyMessage,
  getStatusChipColor,
  requiresNormativeReview,
} from './biological-indicator-labels.util';

type ActivationChecklistItem = {
  label: string;
  done: boolean;
  /** Orientação exibida quando o passo está pendente. */
  guidance?: string;
};

/**
 * Deriva o checklist de ativação a partir do estado real do indicador.
 * Reaproveita as pendências calculadas no backend (indicator.pendencies) — não
 * altera a validação de ativação, apenas visualiza o que falta.
 */
const buildActivationChecklist = (
  indicator: BiologicalIndicatorDetail,
  reviewRequired: boolean,
): ActivationChecklistItem[] => {
  const codes = new Set(indicator.pendencies.map((item) => item.code));
  const items: ActivationChecklistItem[] = [
    {
      label: 'Risco confirmado',
      done: !codes.has('RISK_NOT_CONFIRMED'),
      guidance: 'Confirme um fator de risco para permitir a ativação do indicador.',
    },
    {
      label: 'Risco principal definido',
      done: !codes.has('RISK_PRIMARY_REQUIRED'),
      guidance:
        'Marque um risco como principal quando houver mais de um risco confirmado.',
    },
    {
      label: 'Exame confirmado',
      done: !codes.has('EXAM_NOT_CONFIRMED'),
      guidance: 'Vincule e confirme um exame do catálogo do sistema.',
    },
    {
      label: 'Exame padrão definido',
      done: !codes.has('EXAM_DEFAULT_REQUIRED'),
      guidance:
        'Marque um exame como padrão quando houver mais de um exame confirmado.',
    },
  ];

  if (reviewRequired) {
    items.push({
      label: 'Revisão normativa/médica',
      done: !codes.has('NORMATIVE_REVIEW_REQUIRED'),
      guidance: 'Registre a revisão normativa/médica antes de ativar este indicador.',
    });
  }

  items.push({
    label: 'Indicador ativo',
    done: indicator.status === 'ACTIVE',
    guidance: 'Conclua os passos acima e clique em "Ativar indicador".',
  });

  return items;
};

const ActivationChecklist: FC<{
  indicator: BiologicalIndicatorDetail;
  reviewRequired: boolean;
}> = ({ indicator, reviewRequired }) => {
  const items = buildActivationChecklist(indicator, reviewRequired);

  return (
    <Stack component="ol" spacing={1} sx={{ listStyle: 'none', m: 0, mb: 1.5, p: 0 }}>
      {items.map((item) => (
        <Stack
          key={item.label}
          component="li"
          direction="row"
          spacing={1.5}
          alignItems="flex-start"
        >
          {item.done ? (
            <CheckCircleIcon
              sx={{ fontSize: 20, color: 'success.main', flexShrink: 0, mt: '2px' }}
            />
          ) : (
            <RadioButtonUncheckedIcon
              sx={{ fontSize: 20, color: 'warning.main', flexShrink: 0, mt: '2px' }}
            />
          )}
          <Box>
            <Typography
              variant="body2"
              color={item.done ? 'text.primary' : 'text.secondary'}
              sx={{
                fontWeight: item.done ? 500 : 400,
                textDecoration: item.done ? 'none' : 'none',
              }}
            >
              {item.label}
              {item.done ? ' — concluído' : ' — pendente'}
            </Typography>
            {!item.done && item.guidance && (
              <Typography variant="caption" color="text.secondary">
                {item.guidance}
              </Typography>
            )}
          </Box>
        </Stack>
      ))}
    </Stack>
  );
};

type Props = {
  indicatorId: string;
};

const InfoRow: FC<{ label: string; value?: string | null }> = ({ label, value }) => (
  <Box mb={1}>
    <Typography variant="caption" color="text.secondary">
      {label}
    </Typography>
    <Typography variant="body2">{value || '—'}</Typography>
  </Box>
);

const LinkStateChips: FC<{
  isConfirmed: boolean;
  primaryLabel?: string;
  isPrimaryOrDefault?: boolean;
  requiresReview?: boolean;
}> = ({ isConfirmed, primaryLabel, isPrimaryOrDefault, requiresReview }) => (
  <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
    {isConfirmed ? (
      <Chip size="small" color="success" label="Confirmado" />
    ) : (
      <Chip size="small" variant="outlined" label="Pendente" />
    )}
    {isPrimaryOrDefault && primaryLabel && (
      <Chip size="small" color="primary" label={primaryLabel} />
    )}
    {requiresReview && <Chip size="small" color="warning" label="Revisão" />}
  </Stack>
);

export const BiologicalIndicatorDetailPage: FC<Props> = ({ indicatorId }) => {
  const { data: indicator, isLoading } = useFetchBiologicalIndicatorById(indicatorId);
  const confirmRisk = useMutateConfirmBiologicalIndicatorRiskLink(indicatorId);
  const rejectRisk = useMutateRejectBiologicalIndicatorRiskLink(indicatorId);
  const setPrimaryRisk = useMutateSetPrimaryBiologicalIndicatorRiskLink(indicatorId);
  const createExamLink = useMutateCreateBiologicalIndicatorExamLink(indicatorId);
  const confirmExam = useMutateConfirmBiologicalIndicatorExamLink(indicatorId);
  const rejectExam = useMutateRejectBiologicalIndicatorExamLink(indicatorId);
  const setDefaultExam = useMutateSetDefaultBiologicalIndicatorExamLink(indicatorId);
  const updateStatus = useMutateUpdateBiologicalIndicatorStatus(indicatorId);

  const [examSearch, setExamSearch] = useState('');
  const [examMaterial, setExamMaterial] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [reviewNotesInitialized, setReviewNotesInitialized] = useState(false);
  const [reviewNotesSuggested, setReviewNotesSuggested] = useState(false);
  const [linkNotes, setLinkNotes] = useState('');
  const [rejectRiskTarget, setRejectRiskTarget] = useState<BiologicalIndicatorRiskLink | null>(
    null,
  );
  const [rejectExamTarget, setRejectExamTarget] = useState<BiologicalIndicatorExamLink | null>(
    null,
  );

  const { data: examCandidates = [] } = useFetchBiologicalIndicatorExamCandidates(
    { search: examSearch, material: examMaterial, limit: 20 },
    Boolean(examSearch.trim() || examMaterial.trim()),
  );

  const reviewRequired = useMemo(
    () => (indicator ? requiresNormativeReview(indicator) : false),
    [indicator],
  );

  const canActivate = useMemo(() => {
    if (!indicator || indicator.status !== 'DRAFT') return false;

    const blockingPendencies = indicator.pendencies.filter(
      (p) => p.code !== 'NORMATIVE_REVIEW_REQUIRED',
    );
    if (blockingPendencies.length > 0) return false;

    if (reviewRequired && !reviewNotes.trim()) return false;

    return true;
  }, [indicator, reviewRequired, reviewNotes]);

  const confirmedRiskLinks = useMemo(
    () => indicator?.riskLinks.filter((link) => link.isConfirmed) ?? [],
    [indicator],
  );

  const setPrimaryPending = setPrimaryRisk.isPending;

  useEffect(() => {
    if (confirmedRiskLinks.length !== 1) return;
    const onlyConfirmed = confirmedRiskLinks[0];
    if (onlyConfirmed.isPrimary || setPrimaryPending) return;
    setPrimaryRisk.mutate({ linkId: onlyConfirmed.id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [confirmedRiskLinks, setPrimaryPending]);

  useEffect(() => {
    if (!indicator || reviewNotesInitialized) return;

    const existingNotes = indicator.reviewNotes?.trim();
    if (existingNotes) {
      setReviewNotes(existingNotes);
    } else if (reviewRequired) {
      setReviewNotes(buildNormativeReviewSuggestion(indicator));
      setReviewNotesSuggested(true);
    }
    setReviewNotesInitialized(true);
  }, [indicator, reviewRequired, reviewNotesInitialized]);

  const handleGenerateReviewSuggestion = () => {
    if (!indicator) return;
    setReviewNotes(buildNormativeReviewSuggestion(indicator));
    setReviewNotesSuggested(true);
  };

  if (isLoading) {
    return <Typography>Carregando indicador...</Typography>;
  }

  if (!indicator) {
    return <Alert severity="error">Indicador não encontrado.</Alert>;
  }

  const statusLabel = BIOLOGICAL_INDICATOR_STATUS_LABELS[indicator.status];
  const technicalObservations = formatTechnicalObservations(
    indicator.technicalObservations,
    indicator.technicalObservationsRaw,
  );

  const handleActivate = () => {
    updateStatus.mutate({
      indicatorId,
      status: 'ACTIVE',
      reviewNotes: reviewNotes || undefined,
    });
  };

  const handleLinkExam = (exam: ExamCandidate) => {
    createExamLink.mutate({
      indicatorId,
      examId: exam.id,
      notes: linkNotes || undefined,
    });
  };

  const handleRejectRisk = () => {
    if (!rejectRiskTarget) return;
    rejectRisk.mutate(
      { linkId: rejectRiskTarget.id, notes: linkNotes || undefined },
      { onSuccess: () => setRejectRiskTarget(null) },
    );
  };

  const handleRejectExam = () => {
    if (!rejectExamTarget) return;
    rejectExam.mutate(
      { linkId: rejectExamTarget.id, notes: linkNotes || undefined },
      { onSuccess: () => setRejectExamTarget(null) },
    );
  };

  return (
    <SAuthShow roles={[RoleEnum.MASTER]}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="flex-start" gap={2}>
          <Box>
            <Stack direction="row" spacing={1} alignItems="center" mb={0.5}>
              <Typography variant="h5">{indicator.substanceName}</Typography>
              <Chip
                size="small"
                label={statusLabel}
                color={getStatusChipColor(indicator.status)}
              />
            </Stack>
            <Typography variant="body2" color="text.secondary">
              {indicator.biologicalIndicatorOriginal}
            </Typography>
          </Box>
          <Button component={NextLink} href={RoutesEnum.DATABASE_BIOLOGICAL_INDICATORS}>
            Voltar à lista
          </Button>
        </Box>

        {indicator.pendencies.length > 0 && (
          <Alert severity="warning">
            <Typography variant="subtitle2" gutterBottom>
              Pendências para ativação
            </Typography>
            <Box component="ul" sx={{ m: 0, pl: 2.5 }}>
              {indicator.pendencies.map((item) => (
                <li key={item.code}>{getPendencyMessage(item.code, item.message)}</li>
              ))}
            </Box>
          </Alert>
        )}

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Dados normativos
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <InfoRow label="Fonte normativa" value={formatNormativeSource(indicator.normativeSource)} />
              <InfoRow label="Anexo" value={indicator.annex?.replace('ANNEX_', 'Anexo ') ?? 'Anexo I'} />
              <InfoRow label="Quadro" value={BIOLOGICAL_INDICATOR_TABLE_LABELS[indicator.tableNumber]} />
              <InfoRow label="Tipo" value={BIOLOGICAL_INDICATOR_TYPE_LABELS[indicator.indicatorType]} />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoRow label="Substância" value={indicator.substanceName} />
              <InfoRow label="CAS" value={indicator.casPrimary ?? indicator.casNumbers.join(', ')} />
              <InfoRow label="Matriz/material" value={indicator.biologicalMatrix} />
              <InfoRow label="Momento da coleta" value={indicator.collectionMoment} />
            </Grid>
            <Grid item xs={12} md={4}>
              <InfoRow
                label="Valor de referência"
                value={`${indicator.referenceValue} ${indicator.unit}`}
              />
              <InfoRow label="Observações técnicas" value={technicalObservations} />
              <InfoRow
                label="Revisão normativa obrigatória"
                value={indicator.requiresNormativeReview ? 'Sim' : 'Não'}
              />
              {indicator.substanceGroup && (
                <InfoRow label="Grupo normativo" value={indicator.substanceGroup.name} />
              )}
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Vínculos indicador → risco
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Confirmar registra o vínculo na curadoria. Rejeitar remove apenas o vínculo
            indicador → risco, sem apagar o indicador normativo nem o fator de risco do catálogo.
          </Typography>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Risco</TableCell>
                <TableCell>CAS</TableCell>
                <TableCell>Método</TableCell>
                <TableCell>Confiança</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {indicator.riskLinks.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>{link.riskFactor?.name ?? link.riskNameSnapshot}</TableCell>
                  <TableCell>{link.riskFactor?.cas ?? link.riskCasSnapshot}</TableCell>
                  <TableCell>{link.matchMethod}</TableCell>
                  <TableCell>{link.matchConfidence}</TableCell>
                  <TableCell>
                    <LinkStateChips
                      isConfirmed={link.isConfirmed}
                      primaryLabel="Principal"
                      isPrimaryOrDefault={link.isPrimary}
                      requiresReview={link.requiresReview}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                      {!link.isConfirmed && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckIcon />}
                          disabled={confirmRisk.isPending}
                          onClick={() =>
                            confirmRisk.mutate({ linkId: link.id, notes: linkNotes || undefined })
                          }
                        >
                          Confirmar
                        </Button>
                      )}
                      {link.isConfirmed && !link.isPrimary && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          disabled={setPrimaryRisk.isPending}
                          onClick={() => setPrimaryRisk.mutate({ linkId: link.id })}
                        >
                          Marcar principal
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<CloseIcon />}
                        onClick={() => setRejectRiskTarget(link)}
                      >
                        Rejeitar
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Alert severity="info" icon={false} sx={{ mt: 2 }}>
            <Typography variant="caption" component="div">
              <strong>Confirmado:</strong> o vínculo indicador → risco foi aceito na curadoria.
            </Typography>
            <Typography variant="caption" component="div">
              <strong>Principal:</strong> {PRIMARY_RISK_HELPER_TEXT}
            </Typography>
          </Alert>
          <TextField
            fullWidth
            size="small"
            label="Observações de curadoria (risco)"
            value={linkNotes}
            onChange={(e) => setLinkNotes(e.target.value)}
            sx={{ mt: 2 }}
          />
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Vínculos indicador → exame
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            Busque manualmente no catálogo de exames do sistema. O match automático ainda não
            encontrou candidatos para a maioria dos indicadores.
          </Typography>

          <Box display="flex" gap={2} mb={2} mt={2}>
            <SInput
              label="Buscar exame por nome/análises"
              value={examSearch}
              onChange={(e) => setExamSearch(e.target.value)}
            />
            <SInput
              label="Material"
              value={examMaterial}
              onChange={(e) => setExamMaterial(e.target.value)}
            />
          </Box>

          {examCandidates.length > 0 && (
            <Table size="small" sx={{ mb: 2 }}>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Material</TableCell>
                  <TableCell>Análises</TableCell>
                  <TableCell>eSocial</TableCell>
                  <TableCell align="right">Ação</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {examCandidates.map((exam) => (
                  <TableRow key={exam.id}>
                    <TableCell>{exam.name}</TableCell>
                    <TableCell>{exam.material}</TableCell>
                    <TableCell>{exam.analyses}</TableCell>
                    <TableCell>{exam.esocial27Code ?? '—'}</TableCell>
                    <TableCell align="right">
                      <Button
                        size="small"
                        variant="outlined"
                        color="primary"
                        onClick={() => handleLinkExam(exam)}
                      >
                        Vincular
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          <Divider sx={{ my: 2 }} />

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Exame</TableCell>
                <TableCell>Material</TableCell>
                <TableCell>Método</TableCell>
                <TableCell>Estado</TableCell>
                <TableCell align="right">Ações</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {indicator.examLinks.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5}>
                    <Typography variant="body2" color="text.secondary">
                      Nenhum exame vinculado. Use a busca acima para criar o vínculo manual.
                    </Typography>
                  </TableCell>
                </TableRow>
              )}
              {indicator.examLinks.map((link) => (
                <TableRow key={link.id}>
                  <TableCell>{link.exam?.name ?? link.examNameSnapshot}</TableCell>
                  <TableCell>{link.exam?.material ?? link.examMaterialSnapshot}</TableCell>
                  <TableCell>{link.matchMethod}</TableCell>
                  <TableCell>
                    <LinkStateChips
                      isConfirmed={link.isConfirmed}
                      primaryLabel="Padrão"
                      isPrimaryOrDefault={link.isDefault}
                      requiresReview={link.requiresReview}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end" flexWrap="wrap">
                      {!link.isConfirmed && (
                        <Button
                          size="small"
                          variant="contained"
                          color="success"
                          startIcon={<CheckIcon />}
                          disabled={confirmExam.isPending}
                          onClick={() =>
                            confirmExam.mutate({ linkId: link.id, notes: linkNotes || undefined })
                          }
                        >
                          Confirmar
                        </Button>
                      )}
                      {link.isConfirmed && !link.isDefault && (
                        <Button
                          size="small"
                          variant="outlined"
                          color="primary"
                          disabled={setDefaultExam.isPending}
                          onClick={() => setDefaultExam.mutate({ linkId: link.id })}
                        >
                          Marcar padrão
                        </Button>
                      )}
                      <Button
                        size="small"
                        variant="outlined"
                        color="error"
                        startIcon={<CloseIcon />}
                        onClick={() => setRejectExamTarget(link)}
                      >
                        Rejeitar
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Paper>

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Ativação do indicador
          </Typography>
          <Typography variant="body2" color="text.secondary" gutterBottom>
            O indicador permanece em <strong>Rascunho</strong> até concluir todos os passos e
            clicar em &quot;Ativar indicador&quot;. Somente então passa para <strong>Ativo</strong>.
          </Typography>
          <ActivationChecklist
            indicator={indicator}
            reviewRequired={reviewRequired}
          />
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            spacing={1}
            mb={1}
          >
            <Typography variant="subtitle2">
              Notas de revisão normativa/médica
              {reviewRequired && (
                <Chip
                  size="small"
                  color="warning"
                  label="Revisão exigida"
                  sx={{ ml: 1 }}
                />
              )}
            </Typography>
            <Button
              size="small"
              variant="outlined"
              disabled={!indicator}
              onClick={handleGenerateReviewSuggestion}
            >
              Gerar texto sugerido
            </Button>
          </Stack>
          <TextField
            fullWidth
            multiline
            minRows={4}
            placeholder={NORMATIVE_REVIEW_HELPER_TEXT}
            helperText={
              reviewNotesSuggested
                ? NORMATIVE_REVIEW_SUGGESTION_HELPER_TEXT
                : NORMATIVE_REVIEW_HELPER_TEXT
            }
            value={reviewNotes}
            onChange={(e) => {
              setReviewNotes(e.target.value);
              setReviewNotesSuggested(false);
            }}
            sx={{ mb: 2, mt: 1 }}
          />
          <Button
            variant="contained"
            color="primary"
            disabled={!canActivate || updateStatus.isPending}
            onClick={handleActivate}
          >
            Ativar indicador (Rascunho → Ativo)
          </Button>
        </Paper>

        <Dialog open={Boolean(rejectRiskTarget)} onClose={() => setRejectRiskTarget(null)}>
          <DialogTitle>Rejeitar vínculo com risco</DialogTitle>
          <DialogContent>
            <Typography>
              Tem certeza que deseja rejeitar este vínculo? O indicador e o risco não serão
              apagados, mas este vínculo deixará de ser considerado na curadoria.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectRiskTarget(null)}>Cancelar</Button>
            <Button
              color="error"
              variant="contained"
              startIcon={<CloseIcon />}
              disabled={rejectRisk.isPending}
              onClick={handleRejectRisk}
            >
              Rejeitar vínculo
            </Button>
          </DialogActions>
        </Dialog>

        <Dialog open={Boolean(rejectExamTarget)} onClose={() => setRejectExamTarget(null)}>
          <DialogTitle>Rejeitar vínculo com exame</DialogTitle>
          <DialogContent>
            <Typography>
              Tem certeza que deseja rejeitar este vínculo? O indicador e o exame não serão
              apagados, mas este vínculo deixará de ser considerado na curadoria.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setRejectExamTarget(null)}>Cancelar</Button>
            <Button
              color="error"
              variant="contained"
              startIcon={<CloseIcon />}
              disabled={rejectExam.isPending}
              onClick={handleRejectExam}
            >
              Rejeitar vínculo
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </SAuthShow>
  );
};
