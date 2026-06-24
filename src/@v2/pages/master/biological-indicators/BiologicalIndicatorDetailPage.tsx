import { FC, useMemo, useState } from 'react';

import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
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
import type { ExamCandidate } from '@v2/services/medicine/biological-indicator/service/biological-indicator.types';
import { SAuthShow } from 'components/molecules/SAuthShow';
import { RoutesEnum } from 'core/enums/routes.enums';
import { RoleEnum } from 'project/enum/roles.enums';

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
  const [linkNotes, setLinkNotes] = useState('');

  const { data: examCandidates = [] } = useFetchBiologicalIndicatorExamCandidates(
    { search: examSearch, material: examMaterial, limit: 20 },
    Boolean(examSearch.trim() || examMaterial.trim()),
  );

  const canActivate = useMemo(
    () => indicator?.pendencies.length === 0 && indicator?.status === 'DRAFT',
    [indicator],
  );

  if (isLoading) {
    return <Typography>Carregando indicador...</Typography>;
  }

  if (!indicator) {
    return <Alert severity="error">Indicador não encontrado.</Alert>;
  }

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

  return (
    <SAuthShow roles={[RoleEnum.MASTER]}>
      <Box display="flex" flexDirection="column" gap={2}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5">{indicator.substanceName}</Typography>
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
            <ul style={{ margin: 0, paddingLeft: 20 }}>
              {indicator.pendencies.map((item) => (
                <li key={item.code}>{item.message}</li>
              ))}
            </ul>
          </Alert>
        )}

        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            Dados normativos
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} md={4}>
              <InfoRow label="Fonte" value="NR-07" />
              <InfoRow label="Anexo" value="I" />
              <InfoRow label="Quadro" value={indicator.tableNumber} />
              <InfoRow label="Tipo" value={indicator.indicatorType} />
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
              <InfoRow label="Status" value={indicator.status} />
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
                    {link.isConfirmed && (
                      <Chip size="small" color="success" label="Confirmado" sx={{ mr: 0.5 }} />
                    )}
                    {link.isPrimary && <Chip size="small" color="primary" label="Principal" />}
                    {link.requiresReview && (
                      <Chip size="small" color="warning" label="Revisão" sx={{ ml: 0.5 }} />
                    )}
                  </TableCell>
                  <TableCell align="right">
                    {!link.isConfirmed && (
                      <Button
                        size="small"
                        onClick={() =>
                          confirmRisk.mutate({ linkId: link.id, notes: linkNotes || undefined })
                        }
                      >
                        Confirmar
                      </Button>
                    )}
                    <Button
                      size="small"
                      color="error"
                      onClick={() =>
                        rejectRisk.mutate({ linkId: link.id, notes: linkNotes || undefined })
                      }
                    >
                      Rejeitar
                    </Button>
                    {link.isConfirmed && !link.isPrimary && (
                      <Button
                        size="small"
                        onClick={() => setPrimaryRisk.mutate({ linkId: link.id })}
                      >
                        Principal
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
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
                      <Button size="small" onClick={() => handleLinkExam(exam)}>
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
                    {link.isConfirmed && (
                      <Chip size="small" color="success" label="Confirmado" sx={{ mr: 0.5 }} />
                    )}
                    {link.isDefault && <Chip size="small" color="primary" label="Padrão" />}
                  </TableCell>
                  <TableCell align="right">
                    {!link.isConfirmed && (
                      <Button
                        size="small"
                        onClick={() =>
                          confirmExam.mutate({ linkId: link.id, notes: linkNotes || undefined })
                        }
                      >
                        Confirmar
                      </Button>
                    )}
                    <Button
                      size="small"
                      color="error"
                      onClick={() =>
                        rejectExam.mutate({ linkId: link.id, notes: linkNotes || undefined })
                      }
                    >
                      Rejeitar
                    </Button>
                    {link.isConfirmed && !link.isDefault && (
                      <Button
                        size="small"
                        onClick={() => setDefaultExam.mutate({ linkId: link.id })}
                      >
                        Padrão
                      </Button>
                    )}
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
            O indicador só pode ser ativado após confirmar risco, vincular e confirmar exame
            padrão, e resolver revisão normativa quando exigida.
          </Typography>
          <TextField
            fullWidth
            multiline
            minRows={2}
            label="Notas de revisão normativa"
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            sx={{ mb: 2, mt: 1 }}
          />
          <Button
            variant="contained"
            disabled={!canActivate || updateStatus.isPending}
            onClick={handleActivate}
          >
            Ativar indicador (DRAFT → ACTIVE)
          </Button>
        </Paper>
      </Box>
    </SAuthShow>
  );
};
