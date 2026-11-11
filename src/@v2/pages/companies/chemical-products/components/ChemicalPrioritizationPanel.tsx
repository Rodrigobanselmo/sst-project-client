import { useSystemRiskMatrixPresentation } from '@v2/services/security/risk-matrix/hooks/useSystemRiskMatrixPresentation';
import { formatAxisLevelTooltip } from '@v2/services/security/risk-matrix/presentation/axis-level-tooltip.util';
import { useMemo, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import ChatBubbleOutline from '@mui/icons-material/ChatBubbleOutline';
import CheckCircleOutline from '@mui/icons-material/CheckCircleOutline';
import ChevronRight from '@mui/icons-material/ChevronRight';
import ErrorOutline from '@mui/icons-material/ErrorOutline';
import InfoOutlined from '@mui/icons-material/InfoOutlined';
import { FaSkullCrossbones } from 'react-icons/fa';
import EditIcon from 'assets/icons/SEditIcon';
import {
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  IconButton,
  Link,
  MenuItem,
  Popover,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { browseChemicalUseScenarioBoard } from '@v2/services/security/characterization/chemical-product/service/chemical-product.service';
import type {
  ChemicalUseScenarioBoardRow,
  UpdateChemicalUseScenarioPayload,
} from '@v2/services/security/characterization/chemical-product/service/chemical-product.types';
import { useAuth } from 'core/contexts/AuthContext';
import { RoutesEnum } from 'core/enums/routes.enums';
import { useAccess } from 'core/hooks/useAccess';

import {
  analyzeChemicalScenario,
  areChemicalAssessmentsComplete,
  buildChemicalExclusionReport,
  CHEMICAL_SCENARIO_SCORES,
  chemicalContactDescriptions,
  confirmedChemicalScenarioRatings,
  describeChemicalScenario,
  formatChemicalCatalogLimit,
  groupChemicalScenarios,
  suggestChemicalScenarioContact,
  stelReviewFields,
  summarizeChemicalAssessments,
  type ChemicalScenarioAssessment,
  type ChemicalScenarioRatingReview,
  type ChemicalStelReview,
} from './chemical-prioritization';
import { formatChemicalScenarioQuantity } from './chemical-use-scenario-quantity.util';
import {
  ChemicalPrioritizationDraftBackup,
  type ChemicalPrioritizationAnalysis,
} from './ChemicalPrioritizationDraftBackup';
import { ChemicalScenarioMissingInput } from './ChemicalScenarioMissingInput';
import { exportChemicalExclusionPdf } from './exportChemicalExclusionPdf';

type Props = {
  companyId: string;
  workspaceId: string;
  companyName: string;
  workspaceName: string;
};

type Analysis = ChemicalPrioritizationAnalysis;

const emptyAnalysis = {
  rows: undefined,
  ratingReviews: {},
  contactComments: {},
  stelReviews: {},
  reviewed: false,
};
const scores = CHEMICAL_SCENARIO_SCORES;
const outcomes = {
  include: { label: 'Priorizar', color: 'error' },
  exclude: { label: 'Não priorizar', color: 'default' },
  pending: { label: 'Dados pendentes', color: 'warning' },
} as const;

function requiresContact(assessment: ChemicalScenarioAssessment) {
  return (
    (assessment.criterion.startsWith('Probabilidade') ||
      assessment.criterion === 'STEL em revisão') &&
    typeof assessment.severity === 'number' &&
    Number.isInteger(assessment.severity) &&
    assessment.severity >= 3 &&
    assessment.severity <= 4
  );
}

function ChemicalTriageIndicator({ complete }: { complete: boolean }) {
  return (
    <Box
      component="span"
      role="img"
      aria-label={complete ? 'Triagem concluída' : 'Triagem pendente'}
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: 16,
        height: 16,
        flexShrink: 0,
      }}
    >
      {complete ? (
        <CheckCircleOutline
          aria-hidden
          sx={{ fontSize: 16, color: 'success.main' }}
        />
      ) : (
        <Box
          component="span"
          aria-hidden
          sx={{
            width: 8,
            height: 8,
            borderRadius: '50%',
            bgcolor: 'warning.main',
          }}
        />
      )}
    </Box>
  );
}

export function ChemicalPrioritizationPanel({
  companyId,
  workspaceId,
  companyName,
  workspaceName,
}: Props) {
  const { user } = useAuth();
  const { isMaster } = useAccess();
  const systemMatrix = useSystemRiskMatrixPresentation();
  const queryClient = useQueryClient();
  const queryKey = [
    'chemical-prioritization-draft-fixed-quantity',
    user?.id,
    companyId,
    workspaceId,
  ] as const;
  const {
    data,
    isFetching: loading,
    isError: loadError,
    refetch,
  } = useQuery<Analysis>({
    queryKey,
    enabled: false,
    gcTime: Infinity,
    retry: false,
    queryFn: async () => {
      const rows = await browseChemicalUseScenarioBoard({
        companyId,
        workspaceId,
        includePrioritization: true,
      });
      return {
        ...emptyAnalysis,
        ...queryClient.getQueryData<Analysis>(queryKey),
        rows,
      };
    },
  });
  const {
    rows,
    ratingReviews,
    contactComments = emptyAnalysis.contactComments,
    stelReviews = emptyAnalysis.stelReviews,
    reviewed,
  } = data ?? emptyAnalysis;

  function updateAnalysis(update: (current: Analysis) => Analysis) {
    queryClient.setQueryData<Analysis>(queryKey, (current) =>
      current ? update(current) : current,
    );
  }

  const [exportError, setExportError] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [stelEditor, setStelEditor] = useState<{
    key: string;
    anchor: HTMLElement;
    values: Record<(typeof stelReviewFields)[number][0], string>;
  } | null>(null);
  const [commentEditor, setCommentEditor] = useState<{
    key: string;
    context: string;
    text: string;
  } | null>(null);

  function saveContactComment() {
    if (!commentEditor) return;
    updateAnalysis((current) => ({
      ...current,
      contactComments: {
        ...current.contactComments,
        [commentEditor.key]: commentEditor.text.trim(),
      },
    }));
    setCommentEditor(null);
  }

  const { groups, pending } = useMemo(
    () => groupChemicalScenarios(rows ?? []),
    [rows],
  );
  const results = groups.map((group) => {
    const assessments = group.scenarios.map((scenario) =>
      analyzeChemicalScenario(
        group.factor,
        scenario,
        confirmedChemicalScenarioRatings(ratingReviews[scenario.id]),
        stelReviews[JSON.stringify([scenario.id, group.factor.id])],
      ),
    );
    const outcome = summarizeChemicalAssessments(assessments);
    return {
      group,
      assessments,
      complete: areChemicalAssessmentsComplete(assessments),
      outcome:
        group.hasPendingEvidence && outcome === 'exclude'
          ? ('pending' as const)
          : outcome,
    };
  });
  type FactorResult = (typeof results)[number];
  type ProductActivity = {
    scenario: ChemicalUseScenarioBoardRow;
    assessment: ChemicalScenarioAssessment;
    complete: boolean;
    needsScores: boolean;
    optionalContact: boolean;
  };

  type ProductFactor = {
    result: FactorResult;
    rows: {
      scenario: ChemicalUseScenarioBoardRow;
      assessment: ChemicalScenarioAssessment;
    }[];
  };
  const resultsByGse = new Map<
    string,
    {
      name: string;
      products: Map<
        string,
        {
          name: string;
          complete: boolean;
          activities: Map<string, ProductActivity>;
          factors: Map<string, ProductFactor>;
        }
      >;
    }
  >();
  for (const result of results) {
    const { gse, scenarios, key } = result.group;
    const gseBlock = resultsByGse.get(gse.id) ?? {
      name: gse.name,
      products: new Map(),
    };
    resultsByGse.set(gse.id, gseBlock);
    scenarios.forEach((scenario, index) => {
      const product = gseBlock.products.get(scenario.chemicalProductId) ?? {
        name: scenario.product.tradeName,
        complete: true,
        activities: new Map<string, ProductActivity>(),
        factors: new Map<string, ProductFactor>(),
      };
      const assessment = result.assessments[index];
      const activity = product.activities.get(scenario.id);
      const needsScores = requiresContact(assessment);
      product.activities.set(scenario.id, {
        scenario,
        assessment: activity?.assessment.probability
          ? activity.assessment
          : assessment,
        complete:
          (activity?.complete ?? true) && assessment.outcome !== 'pending',
        needsScores: Boolean(activity?.needsScores || needsScores),
        optionalContact: Boolean(
          activity?.optionalContact ||
            (assessment.outcome === 'include' && !needsScores),
        ),
      });
      product.complete &&= assessment.outcome !== 'pending';
      gseBlock.products.set(scenario.chemicalProductId, product);
      const factor = product.factors.get(key) ?? { result, rows: [] };
      product.factors.set(key, factor);
      factor.rows.push({ scenario, assessment });
    });
  }
  const requiredContactIds = new Set(
    results.flatMap(({ group, assessments }) =>
      group.scenarios
        .filter((_, index) => requiresContact(assessments[index]))
        .map(({ id }) => id),
    ),
  );

  function updateContact(id: string, review: ChemicalScenarioRatingReview) {
    updateAnalysis((current) => ({
      ...current,
      reviewed: requiredContactIds.has(id) ? false : current.reviewed,
      ratingReviews: { ...current.ratingReviews, [id]: review },
    }));
  }

  const exclusions = results.filter(({ outcome }) => outcome === 'exclude');
  const report = reviewed
    ? buildChemicalExclusionReport(
        exclusions.map(({ group }) => group),
        Object.fromEntries(
          exclusions.map(({ group, assessments }) => {
            return [
              group.key,
              {
                inventory: 'exclude',
                reference: [
                  ...(assessments[0]?.references?.limits ?? []).map(
                    ({ source, value }) =>
                      `${source}: ${formatChemicalCatalogLimit(value ?? '', group.factor.prioritization?.unit)}`,
                  ),
                  group.factor.prioritization?.method
                    ? `Método cadastrado: ${group.factor.prioritization.method}`
                    : '',
                ]
                  .filter(Boolean)
                  .join(' · '),
                justification: [
                  ...new Set(assessments.map(({ reason }) => reason)),
                ].join(' '),
              },
            ];
          }),
        ),
      )
    : [];

  async function download() {
    setExportError(false);
    setExporting(true);
    try {
      await exportChemicalExclusionPdf({
        companyName,
        workspaceName,
        entries: report,
      });
    } catch {
      setExportError(true);
    } finally {
      setExporting(false);
    }
  }

  return (
    <Stack spacing={4} mt={4}>
      {user?.id && workspaceId && (
        <ChemicalPrioritizationDraftBackup
          key={JSON.stringify(queryKey)}
          scope={JSON.stringify(queryKey)}
          companyId={companyId}
          workspaceId={workspaceId}
          draft={data}
          onRestore={(analysis) =>
            queryClient.setQueryData<Analysis>(
              queryKey,
              (current) => current ?? analysis,
            )
          }
        />
      )}
      <Alert severity="info">
        Analise os cenários por fator de risco e GSE. A pontuação é uma triagem
        qualitativa. A avaliação quantitativa é uma decisão separada.
      </Alert>
      <Box>
        <Button
          variant="contained"
          disabled={!workspaceId || !user?.id || loading}
          onClick={() => void refetch()}
        >
          {loading
            ? 'Analisando…'
            : rows
              ? 'Reanalisar cenários'
              : 'Analisar cenários'}
        </Button>
      </Box>
      {!workspaceId && (
        <Alert severity="info">
          Selecione um estabelecimento para analisar os cenários de uso.
        </Alert>
      )}
      {loadError && (
        <Alert severity="error">
          Não foi possível carregar os cenários de uso.
          {rows && ' A análise anterior continua disponível.'}
        </Alert>
      )}
      {rows && (
        <>
          <Typography role="status">
            {results.filter(({ outcome }) => outcome === 'include').length} a
            priorizar · {exclusions.length} a não priorizar ·{' '}
            {results.filter(({ outcome }) => outcome === 'pending').length} com
            decisão pendente
          </Typography>
          <Box component="details">
            <summary>Como as notas são calculadas</summary>
            <Typography variant="body2">
              Frequência por semana (5 dias para frequência diária): até 0,25,
              1, 5 e 15 ocorrências, ou acima de 15. Duração por atividade: até
              5, 15, 60 e 240 minutos, ou acima de 240. A nota da quantidade é
              automática: 1 até 1, 2 acima de 1 até 10, 3 acima de 10 até 100, 4
              acima de 100 até 500 e 5 acima de 500. As faixas usam o mesmo
              número para litros e quilos, cada um na sua unidade. São faixas de
              triagem qualitativa por ordem de grandeza. Para contato, a
              sugestão usa descrições explícitas de manuseio. Revise ou preencha
              a nota de 1 (muito baixo) a 5 (muito alto) e confirme por cenário.
              A nota e a confirmação são compartilhadas pelos fatores do mesmo
              cenário. A probabilidade é a maior entre a nota da quantidade, a
              nota confirmada de contato e a média arredondada para cima das
              notas de frequência e duração.
            </Typography>
          </Box>
          {pending.length > 0 && (
            <Box component="details">
              <summary>
                Cenários com dados a completar ({pending.length})
              </summary>
              <ul>
                {pending.map(({ scenario, reasons }) => (
                  <li key={scenario.id}>
                    {describeChemicalScenario(scenario)}. {reasons.join('. ')}.
                  </li>
                ))}
              </ul>
            </Box>
          )}
          {!groups.length && (
            <Typography>
              Nenhum fator associado a um GSE ativo neste estabelecimento.
            </Typography>
          )}
          {[...resultsByGse].map(([gseId, gse]) => (
            <Box
              key={gseId}
              component="details"
              open
              sx={{
                minWidth: 0,
                border: 1,
                borderColor: 'divider',
                borderRadius: 2,
                bgcolor: 'background.paper',
                '&[open] .gse-expand-icon': { transform: 'rotate(90deg)' },
              }}
            >
              <Box
                component="summary"
                sx={{
                  cursor: 'pointer',
                  listStyle: 'none',
                  px: 4,
                  py: 3,
                  bgcolor: 'action.hover',
                  borderRadius: 'inherit',
                  '&::-webkit-details-marker': { display: 'none' },
                  '&:focus-visible': {
                    outline: '2px solid',
                    outlineColor: 'primary.main',
                    outlineOffset: -2,
                  },
                }}
              >
                <Typography
                  component="h3"
                  variant="h2"
                  fontWeight={700}
                  sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
                >
                  <ChevronRight
                    className="gse-expand-icon"
                    aria-hidden
                    sx={{ flexShrink: 0 }}
                  />
                  <ChemicalTriageIndicator
                    complete={[...gse.products.values()].every(
                      (product) => product.complete,
                    )}
                  />
                  <span>{gse.name}</span>
                </Typography>
              </Box>
              <Stack
                spacing={15}
                sx={{
                  pl: { xs: 4, sm: 10 },
                  pr: { xs: 2, sm: 4 },
                  pt: 15,
                  pb: 4,
                }}
              >
                {[...gse.products]
                  .sort(([, a], [, b]) => a.name.localeCompare(b.name, 'pt-BR'))
                  .map(([productId, product]) => (
                    <Box
                      key={productId}
                      component="details"
                      open
                      sx={{
                        minWidth: 0,
                        pl: { xs: 3, sm: 6 },
                        '&[open] > summary .product-expand-icon': {
                          transform: 'rotate(90deg)',
                        },
                      }}
                    >
                      <Box
                        component="summary"
                        sx={{
                          cursor: 'pointer',
                          listStyle: 'none',
                          '&::-webkit-details-marker': { display: 'none' },
                          '&:focus-visible': {
                            outline: '2px solid',
                            outlineColor: 'primary.main',
                          },
                        }}
                      >
                        <Typography
                          component="h4"
                          variant="h3"
                          fontWeight={700}
                          sx={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 2,
                            overflowWrap: 'anywhere',
                          }}
                        >
                          <ChevronRight
                            className="product-expand-icon"
                            fontSize="small"
                            aria-hidden
                            sx={{ flexShrink: 0 }}
                          />
                          <ChemicalTriageIndicator
                            complete={product.complete}
                          />
                          <span>Produto químico — {product.name}</span>
                        </Typography>
                      </Box>
                      {[...product.activities.values()].map(
                        ({
                          scenario,
                          assessment,
                          complete,
                          needsScores,
                          optionalContact,
                        }) => {
                          const suggestion =
                            needsScores || optionalContact
                              ? suggestChemicalScenarioContact(scenario)
                              : null;
                          const review = ratingReviews[scenario.id];
                          const draft = review?.ratings ?? {
                            contact: suggestion?.score,
                          };
                          const commentKey = JSON.stringify([
                            scenario.id,
                            draft.contact,
                          ]);
                          const comment = contactComments[commentKey];
                          const contactConfirmationPending =
                            !review?.confirmed &&
                            (needsScores ||
                              (optionalContact &&
                                !needsScores &&
                                !!draft.contact));
                          const canConfirmContact = !!draft.contact && !loading;
                          const applyScenarioPatch = (
                            patch: UpdateChemicalUseScenarioPayload,
                          ) => {
                            updateAnalysis((current) => ({
                              ...current,
                              rows: current.rows.map((row) =>
                                row.id === scenario.id
                                  ? { ...row, ...patch }
                                  : row,
                              ),
                              reviewed: false,
                            }));
                          };
                          const contactConfirmationStatus = review?.confirmed
                            ? 'Contato confirmado'
                            : 'Confirmação de contato dispensada para este resultado';
                          return (
                            <Box
                              key={scenario.id}
                              component="details"
                              open
                              sx={{
                                minWidth: 0,
                                ml: { xs: 2, sm: 4 },
                                mt: 10,
                                '&[open] > summary .activity-expand-icon': {
                                  transform: 'rotate(90deg)',
                                },
                              }}
                            >
                              <Box
                                component="summary"
                                sx={{
                                  cursor: 'pointer',
                                  listStyle: 'none',
                                  '&::-webkit-details-marker': {
                                    display: 'none',
                                  },
                                  '&:focus-visible': {
                                    outline: '2px solid',
                                    outlineColor: 'primary.main',
                                  },
                                }}
                              >
                                <Typography
                                  component="h5"
                                  variant="h4"
                                  fontWeight={600}
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 2,
                                  }}
                                >
                                  <ChevronRight
                                    className="activity-expand-icon"
                                    fontSize="small"
                                    aria-hidden
                                    sx={{ flexShrink: 0 }}
                                  />
                                  <ChemicalTriageIndicator
                                    complete={complete}
                                  />
                                  <span>
                                    Atividade —{' '}
                                    {scenario.activityName ||
                                      'Atividade não informada'}
                                  </span>
                                </Typography>
                              </Box>
                              <TableContainer sx={{ mt: 2 }}>
                                <Table
                                  size="small"
                                  aria-label={`Atividades de ${product.name} em ${gse.name}`}
                                >
                                  <TableHead>
                                    <TableRow>
                                      {[
                                        'Registro da atividade',
                                        'Frequência',
                                        'Duração',
                                        'Quantidade',
                                        'Contato',
                                        'Probabilidade qualitativa',
                                      ].map((label) => (
                                        <TableCell key={label}>
                                          {label}
                                        </TableCell>
                                      ))}
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    <TableRow>
                                      <TableCell>
                                        <Box component="details">
                                          <summary>Controles e origem</summary>
                                          <Typography variant="caption">
                                            {describeChemicalScenario(scenario)}
                                          </Typography>
                                        </Box>
                                      </TableCell>
                                      <TableCell>
                                        {scenario.frequencyCount ?? '—'}{' '}
                                        {scenario.frequencyPeriod}
                                        <Typography
                                          variant="body2"
                                          fontWeight={
                                            assessment.frequencyScore
                                              ? 700
                                              : undefined
                                          }
                                        >
                                          Nota{' '}
                                          {assessment.frequencyScore ?? '—'}
                                        </Typography>
                                        {assessment.frequencyScore === null && (
                                          <ChemicalScenarioMissingInput
                                            field="frequency"
                                            scenario={scenario}
                                            companyId={companyId}
                                            workspaceId={workspaceId}
                                            onSaved={applyScenarioPatch}
                                          />
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {scenario.durationMinutes == null
                                          ? '—'
                                          : `${scenario.durationMinutes} min`}
                                        <Typography
                                          variant="body2"
                                          fontWeight={
                                            assessment.durationScore
                                              ? 700
                                              : undefined
                                          }
                                        >
                                          Nota {assessment.durationScore ?? '—'}
                                        </Typography>
                                        {assessment.durationScore === null && (
                                          <ChemicalScenarioMissingInput
                                            field="duration"
                                            scenario={scenario}
                                            companyId={companyId}
                                            workspaceId={workspaceId}
                                            onSaved={applyScenarioPatch}
                                          />
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {formatChemicalScenarioQuantity(
                                          scenario.quantity,
                                        ) || '—'}{' '}
                                        {scenario.quantityUnit}
                                        <Typography
                                          variant="body2"
                                          fontWeight={700}
                                        >
                                          {assessment.quantityScore
                                            ? `Nota automática ${assessment.quantityScore}/5`
                                            : 'Sem nota automática'}
                                        </Typography>
                                        {assessment.quantityScore === null && (
                                          <ChemicalScenarioMissingInput
                                            field="quantity"
                                            scenario={scenario}
                                            companyId={companyId}
                                            workspaceId={workspaceId}
                                            onSaved={applyScenarioPatch}
                                          />
                                        )}
                                      </TableCell>
                                      <TableCell>
                                        {scenario.peakContactMoment ||
                                          'Não informado'}
                                        <Stack
                                          direction="row"
                                          alignItems="center"
                                          spacing={2}
                                          sx={{ maxWidth: 240, mt: 2 }}
                                        >
                                          {(needsScores || optionalContact) && (
                                            <>
                                              <TextField
                                                select
                                                size="small"
                                                label="Nota de contato"
                                                inputProps={{
                                                  'aria-label': `Nota de contato · ${scenario.activityName} · ${scenario.product.tradeName}`,
                                                }}
                                                value={String(
                                                  draft.contact ?? '',
                                                )}
                                                fullWidth
                                                sx={{ minWidth: 104 }}
                                                onChange={(event) => {
                                                  const contact = scores.find(
                                                    (score) =>
                                                      String(score) ===
                                                      event.target.value,
                                                  );
                                                  updateContact(scenario.id, {
                                                    ratings: { contact },
                                                    confirmed: false,
                                                  });
                                                }}
                                              >
                                                <MenuItem value="">
                                                  Sem nota
                                                </MenuItem>
                                                {scores.map((score) => (
                                                  <MenuItem
                                                    key={score}
                                                    value={String(score)}
                                                  >
                                                    {score} ·{' '}
                                                    {
                                                      chemicalContactDescriptions[
                                                        score - 1
                                                      ]
                                                    }
                                                  </MenuItem>
                                                ))}
                                              </TextField>
                                              <Tooltip
                                                describeChild
                                                title={
                                                  suggestion
                                                    ? `Sugestão ${suggestion.score}/5. ${suggestion.reason}`
                                                    : 'Sem sugestão para a descrição registrada.'
                                                }
                                              >
                                                <IconButton
                                                  size="small"
                                                  aria-label="Informações sobre a sugestão de contato"
                                                  sx={{
                                                    flexShrink: 0,
                                                    color: 'text.secondary',
                                                  }}
                                                >
                                                  <InfoOutlined fontSize="small" />
                                                </IconButton>
                                              </Tooltip>
                                              {draft.contact && (
                                                <Tooltip
                                                  title={
                                                    comment
                                                      ? 'Editar comentário da nota de contato'
                                                      : 'Comentar nota de contato'
                                                  }
                                                >
                                                  <IconButton
                                                    size="small"
                                                    aria-label={
                                                      comment
                                                        ? 'Editar comentário da nota de contato'
                                                        : 'Comentar nota de contato'
                                                    }
                                                    sx={{
                                                      flexShrink: 0,
                                                      color: comment
                                                        ? 'primary.main'
                                                        : 'text.secondary',
                                                    }}
                                                    onClick={() =>
                                                      setCommentEditor({
                                                        key: commentKey,
                                                        context: `${scenario.activityName || 'Atividade não informada'} · ${scenario.product.tradeName} · Nota ${draft.contact}/5`,
                                                        text: comment ?? '',
                                                      })
                                                    }
                                                  >
                                                    <ChatBubbleOutline fontSize="small" />
                                                  </IconButton>
                                                </Tooltip>
                                              )}
                                            </>
                                          )}
                                          {contactConfirmationPending ? (
                                            <Tooltip
                                              title={
                                                canConfirmContact
                                                  ? 'Clique aqui para confirmar o contato'
                                                  : 'Selecione uma nota de contato para confirmar'
                                              }
                                              describeChild
                                            >
                                              <Box
                                                component="span"
                                                tabIndex={
                                                  canConfirmContact
                                                    ? undefined
                                                    : 0
                                                }
                                                sx={{
                                                  display: 'inline-flex',
                                                  flexShrink: 0,
                                                }}
                                              >
                                                <IconButton
                                                  size="small"
                                                  aria-label="Confirmar contato"
                                                  disabled={!canConfirmContact}
                                                  color="error"
                                                  onClick={() => {
                                                    updateContact(scenario.id, {
                                                      ratings: draft,
                                                      confirmed: true,
                                                    });
                                                  }}
                                                >
                                                  <ErrorOutline fontSize="small" />
                                                </IconButton>
                                              </Box>
                                            </Tooltip>
                                          ) : (
                                            <Tooltip
                                              title={contactConfirmationStatus}
                                            >
                                              <Box
                                                component="span"
                                                role="img"
                                                aria-label={
                                                  contactConfirmationStatus
                                                }
                                                tabIndex={0}
                                                sx={{
                                                  display: 'inline-flex',
                                                  flexShrink: 0,
                                                  p: '5px',
                                                  color: 'text.secondary',
                                                }}
                                              >
                                                <CheckCircleOutline fontSize="small" />
                                              </Box>
                                            </Tooltip>
                                          )}
                                        </Stack>
                                        {optionalContact &&
                                          !needsScores &&
                                          !review?.confirmed && (
                                            <Typography
                                              variant="caption"
                                              display="block"
                                            >
                                              {draft.contact
                                                ? 'Confirmação opcional'
                                                : 'Contato não avaliado · opcional'}
                                            </Typography>
                                          )}
                                      </TableCell>
                                      <TableCell>
                                        <Stack
                                          direction="row"
                                          alignItems="center"
                                          spacing={1}
                                        >
                                          <Typography
                                            variant="body2"
                                            fontWeight={600}
                                          >
                                            {assessment.probability
                                              ? `Probabilidade da atividade ${assessment.probability} de 5 Níveis.`
                                              : 'Nota pendente'}
                                          </Typography>
                                          <Tooltip
                                            describeChild
                                            title={
                                              <>
                                                {' '}
                                                <Typography
                                                  variant="caption"
                                                  display="block"
                                                >
                                                  Mesma nota para todos os
                                                  agentes desta atividade.
                                                </Typography>
                                                <Typography
                                                  variant="caption"
                                                  display="block"
                                                >
                                                  P = arredondar((F + D + Q + C)
                                                  / 4)
                                                  <br />
                                                  Inteiro mais próximo, com 0,50
                                                  subindo.
                                                </Typography>
                                                <Typography
                                                  variant="caption"
                                                  display="block"
                                                >
                                                  F{' '}
                                                  {assessment.frequencyScore ??
                                                    '—'}{' '}
                                                  · D{' '}
                                                  {assessment.durationScore ??
                                                    '—'}{' '}
                                                  · Q{' '}
                                                  {assessment.quantityScore ??
                                                    '—'}{' '}
                                                  · C{' '}
                                                  {assessment.contactScore ??
                                                    '—'}
                                                  {!assessment.contactScore &&
                                                    draft.contact &&
                                                    ` (contato ${draft.contact}/5 a confirmar)`}
                                                </Typography>
                                                {assessment.activityAverage !==
                                                  null && (
                                                  <Typography
                                                    variant="caption"
                                                    display="block"
                                                  >
                                                    ({assessment.frequencyScore}{' '}
                                                    + {assessment.durationScore}{' '}
                                                    + {assessment.quantityScore}{' '}
                                                    + {assessment.contactScore})
                                                    / 4 ={' '}
                                                    {assessment.activityAverage.toLocaleString(
                                                      'pt-BR',
                                                      {
                                                        minimumFractionDigits: 2,
                                                      },
                                                    )}{' '}
                                                    → {assessment.probability}
                                                    {assessment.probability && (
                                                      <>
                                                        <br />
                                                        {assessment.probability ===
                                                        5
                                                          ? 'Nível 5 para médias de 4,50 a 5,00.'
                                                          : `Nível ${assessment.probability} para médias de ${Math.max(1, assessment.probability - 0.5).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} até abaixo de ${(assessment.probability + 0.5).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}.`}
                                                      </>
                                                    )}
                                                  </Typography>
                                                )}
                                              </>
                                            }
                                            slotProps={{
                                              tooltip: {
                                                sx: {
                                                  bgcolor: 'background.paper',
                                                  color: 'text.primary',
                                                  border: 1,
                                                  borderColor: 'divider',
                                                  boxShadow: 3,
                                                  fontSize: '0.875rem',
                                                },
                                              },
                                            }}
                                          >
                                            <IconButton
                                              size="small"
                                              aria-label="Memória de cálculo da probabilidade"
                                            >
                                              <InfoOutlined fontSize="small" />
                                            </IconButton>
                                          </Tooltip>
                                        </Stack>
                                      </TableCell>
                                    </TableRow>
                                  </TableBody>
                                </Table>
                              </TableContainer>
                              {[...product.factors.values()].map(
                                ({ result, rows: factorRows }) => {
                                  const rows = factorRows.filter(
                                    (row) => row.scenario.id === scenario.id,
                                  );
                                  if (!rows.length) return null;
                                  const { key, factor } = result.group;
                                  const assessments = rows.map(
                                    ({ assessment }) => assessment,
                                  );
                                  const outcome =
                                    summarizeChemicalAssessments(assessments);
                                  const agentAssessment = assessments[0];
                                  const references = agentAssessment.references;
                                  const severityCriterion =
                                    formatAxisLevelTooltip({
                                      kind: 'S',
                                      value: agentAssessment.severity,
                                      coverageKey: 'QUI',
                                      levels: systemMatrix?.axisLevels,
                                    });
                                  const canOpenAgent =
                                    isMaster ||
                                    (factor.companyId === companyId &&
                                      !factor.system &&
                                      !factor.prioritization?.representAll);
                                  const hazards = [
                                    factor.prioritization?.risk &&
                                      `Risco: ${factor.prioritization.risk}`,
                                    factor.prioritization?.symptoms &&
                                      `Sintomas e efeitos: ${factor.prioritization.symptoms}`,
                                    factor.prioritization?.affectedRegion &&
                                      `Regiões atingidas: ${factor.prioritization.affectedRegion}`,
                                  ]
                                    .filter(Boolean)
                                    .join(' · ');

                                  const stelReviewKey = JSON.stringify([
                                    scenario.id,
                                    factor.id,
                                  ]);
                                  const reviewValues = {
                                    frequency:
                                      scenario.frequencyCount == null
                                        ? 'Não informada'
                                        : [
                                            scenario.frequencyCount,
                                            scenario.frequencyPeriod,
                                          ]
                                            .filter(Boolean)
                                            .join(' '),
                                    duration:
                                      scenario.durationMinutes == null
                                        ? 'Não informada'
                                        : `${scenario.durationMinutes} min`,
                                    quantity: scenario.quantity
                                      ? [
                                          formatChemicalScenarioQuantity(
                                            scenario.quantity,
                                          ),
                                          scenario.quantityUnit,
                                        ]
                                          .filter(Boolean)
                                          .join(' ')
                                      : 'Não informada',
                                  };
                                  const completeInActivity =
                                    areChemicalAssessmentsComplete(assessments);
                                  return (
                                    <Box
                                      key={key}
                                      component="details"
                                      open
                                      sx={{
                                        minWidth: 0,
                                        mt: 10,
                                        ml: { xs: 2, sm: 6 },
                                        pl: { xs: 2, sm: 4 },
                                        borderLeft: 2,
                                        borderColor: 'divider',
                                        '&[open] > summary .factor-expand-icon':
                                          {
                                            transform: 'rotate(90deg)',
                                          },
                                        '& > :not(summary)': { mt: 2 },
                                      }}
                                    >
                                      <Box
                                        component="summary"
                                        sx={{
                                          cursor: 'pointer',
                                          listStyle: 'none',
                                          '&::-webkit-details-marker': {
                                            display: 'none',
                                          },
                                          '&:focus-visible': {
                                            outline: '2px solid',
                                            outlineColor: 'primary.main',
                                          },
                                        }}
                                      >
                                        <Typography
                                          component="h6"
                                          variant="body2"
                                          sx={{
                                            display: 'flex',
                                            alignItems: 'flex-start',
                                            gap: 2,
                                          }}
                                        >
                                          <ChevronRight
                                            className="factor-expand-icon"
                                            fontSize="small"
                                            aria-hidden
                                            sx={{ flexShrink: 0 }}
                                          />
                                          <ChemicalTriageIndicator
                                            complete={completeInActivity}
                                          />
                                          {canOpenAgent && (
                                            <Tooltip title="Abrir cadastro do agente">
                                              <IconButton
                                                component="a"
                                                size="small"
                                                aria-label={`Abrir cadastro de ${factor.name}`}
                                                href={RoutesEnum.RISK_EDIT.replace(
                                                  ':companyId',
                                                  companyId,
                                                ).replace(':riskId', factor.id)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                sx={{ p: 0, flexShrink: 0 }}
                                                onClick={(event) =>
                                                  event.stopPropagation()
                                                }
                                              >
                                                <EditIcon fontSize="small" />
                                              </IconButton>
                                            </Tooltip>
                                          )}
                                          <Box
                                            component="span"
                                            sx={{
                                              minWidth: 0,
                                              overflowWrap: 'anywhere',
                                            }}
                                          >
                                            <Typography
                                              component="span"
                                              variant="h4"
                                              fontWeight={600}
                                              sx={{ display: 'inline' }}
                                            >
                                              Agente de risco químico —{' '}
                                              {factor.name}
                                            </Typography>
                                          </Box>
                                        </Typography>
                                      </Box>
                                      <TableContainer
                                        sx={{
                                          border: 1,
                                          borderColor: 'divider',
                                          borderRadius: 1,
                                        }}
                                      >
                                        <Table
                                          size="small"
                                          aria-label={`Dados técnicos de ${factor.name}`}
                                          sx={{
                                            tableLayout: 'fixed',
                                            minWidth: 1080,
                                            '& th, & td': {
                                              verticalAlign: 'top',
                                              overflowWrap: 'anywhere',
                                            },
                                          }}
                                        >
                                          <colgroup>
                                            <col style={{ width: '10%' }} />
                                            <col style={{ width: '8%' }} />
                                            <col style={{ width: '14%' }} />
                                            <col style={{ width: '24%' }} />
                                            <col style={{ width: '13%' }} />
                                            <col style={{ width: '9%' }} />
                                            <col style={{ width: '11%' }} />
                                            <col style={{ width: '11%' }} />
                                          </colgroup>
                                          <TableHead>
                                            <TableRow>
                                              <TableCell scope="col">
                                                CAS
                                              </TableCell>
                                              <TableCell
                                                scope="col"
                                                align="center"
                                              >
                                                <Box
                                                  component="span"
                                                  sx={{
                                                    display: 'inline-flex',
                                                    alignItems: 'center',
                                                    gap: 1,
                                                  }}
                                                >
                                                  Severidade
                                                  {hazards && (
                                                    <Tooltip
                                                      describeChild
                                                      title={hazards}
                                                    >
                                                      <IconButton
                                                        size="small"
                                                        aria-label={`Perigos de ${factor.name}`}
                                                        sx={{
                                                          p: 0,
                                                          color: 'text.primary',
                                                        }}
                                                      >
                                                        <FaSkullCrossbones
                                                          size={13}
                                                          aria-hidden
                                                        />
                                                      </IconButton>
                                                    </Tooltip>
                                                  )}
                                                </Box>
                                              </TableCell>
                                              <TableCell scope="col">
                                                Método
                                              </TableCell>
                                              <TableCell scope="col">
                                                Limites cadastrados
                                              </TableCell>
                                              <TableCell scope="col">
                                                Vias de absorção
                                              </TableCell>
                                              <TableCell
                                                scope="col"
                                                align="center"
                                              >
                                                Probabilidade
                                              </TableCell>
                                              <TableCell scope="col">
                                                Critério utilizado
                                              </TableCell>
                                              <TableCell scope="col">
                                                Priorização
                                              </TableCell>
                                            </TableRow>
                                          </TableHead>
                                          <TableBody>
                                            <TableRow>
                                              <TableCell>
                                                {factor.cas || 'Não informado'}
                                              </TableCell>
                                              <TableCell
                                                align="center"
                                                sx={{ fontWeight: 700 }}
                                              >
                                                {severityCriterion?.criterion ? (
                                                  <Tooltip
                                                    describeChild
                                                    title={`${severityCriterion.heading} · Critério químico da matriz padrão\n${severityCriterion.criterion}`}
                                                    slotProps={{
                                                      tooltip: {
                                                        sx: {
                                                          whiteSpace:
                                                            'pre-line',
                                                          maxWidth: 420,
                                                        },
                                                      },
                                                    }}
                                                  >
                                                    <Box
                                                      component="span"
                                                      tabIndex={0}
                                                      sx={{
                                                        cursor: 'help',
                                                        textDecoration:
                                                          'underline dotted',
                                                        textUnderlineOffset: 3,
                                                      }}
                                                    >
                                                      {agentAssessment.severity}
                                                    </Box>
                                                  </Tooltip>
                                                ) : (
                                                  agentAssessment.severity ||
                                                  'Não informada'
                                                )}
                                              </TableCell>
                                              <TableCell>
                                                {factor.prioritization
                                                  ?.method || 'Não informado'}
                                              </TableCell>
                                              <TableCell>
                                                {references?.limits
                                                  .map(
                                                    ({ source, value }) =>
                                                      `${source} ${formatChemicalCatalogLimit(value ?? '', factor.prioritization?.unit)}`,
                                                  )
                                                  .join(' · ') ||
                                                  'Sem limites cadastrados'}
                                              </TableCell>
                                              <TableCell>
                                                {factor.prioritization
                                                  ?.absorptionRoutes ||
                                                  'Não informadas'}
                                              </TableCell>
                                              <TableCell align="center">
                                                {agentAssessment.probability ??
                                                  'Pendente'}
                                              </TableCell>
                                              <TableCell>
                                                {[
                                                  'STEL em revisão',
                                                  'STEL confirmado',
                                                  'STEL rejeitado',
                                                ].includes(
                                                  agentAssessment.criterion,
                                                ) ? (
                                                  <Link
                                                    component="button"
                                                    type="button"
                                                    variant="inherit"
                                                    aria-haspopup="dialog"
                                                    aria-expanded={
                                                      stelEditor?.key ===
                                                      stelReviewKey
                                                    }
                                                    sx={{
                                                      textAlign: 'left',
                                                      color: (theme) =>
                                                        agentAssessment.criterion ===
                                                        'STEL em revisão'
                                                          ? theme.palette
                                                              .mode === 'dark'
                                                            ? '#fdba74'
                                                            : '#9a3412'
                                                          : theme.palette.text
                                                              .primary,
                                                    }}
                                                    onClick={(event) =>
                                                      setStelEditor({
                                                        key: stelReviewKey,
                                                        anchor:
                                                          event.currentTarget,
                                                        values: reviewValues,
                                                      })
                                                    }
                                                  >
                                                    {agentAssessment.criterion ===
                                                    'STEL em revisão'
                                                      ? 'STEL necessita de revisão'
                                                      : agentAssessment.criterion ===
                                                          'STEL confirmado'
                                                        ? 'Priorizar para avaliação pelo STEL'
                                                        : agentAssessment.criterion}
                                                  </Link>
                                                ) : (
                                                  agentAssessment.criterion
                                                )}
                                              </TableCell>
                                              <TableCell>
                                                <Tooltip
                                                  describeChild
                                                  title={agentAssessment.reason}
                                                  slotProps={{
                                                    tooltip: {
                                                      sx: {
                                                        bgcolor:
                                                          'background.paper',
                                                        color: 'text.primary',
                                                        border: 1,
                                                        borderColor: 'divider',
                                                        boxShadow: 3,
                                                        fontSize: '0.875rem',
                                                      },
                                                    },
                                                  }}
                                                >
                                                  <Chip
                                                    component="span"
                                                    tabIndex={0}
                                                    size="small"
                                                    {...outcomes[outcome]}
                                                  />
                                                </Tooltip>
                                              </TableCell>
                                            </TableRow>
                                          </TableBody>
                                        </Table>
                                      </TableContainer>
                                      {references?.lowLimit && (
                                        <Alert severity="warning">
                                          Atenção ao limite abaixo de 1 ppm:{' '}
                                          {references.lowLimit.source} ·{' '}
                                          {references.lowLimit.value}.
                                        </Alert>
                                      )}
                                      {!completeInActivity && (
                                        <Alert severity="warning">
                                          Há dados a completar ou confirmar para
                                          este fator nesta atividade.
                                        </Alert>
                                      )}
                                    </Box>
                                  );
                                },
                              )}
                            </Box>
                          );
                        },
                      )}
                    </Box>
                  ))}
              </Stack>
            </Box>
          ))}
          {exclusions.length > 0 && (
            <FormControlLabel
              control={
                <Checkbox
                  checked={reviewed}
                  onChange={({ target: { checked } }) =>
                    updateAnalysis((current) => ({
                      ...current,
                      reviewed: checked,
                    }))
                  }
                />
              }
              label="Confirmo o uso das justificativas de não priorização neste relatório"
            />
          )}
          {exportError && (
            <Alert severity="error">Não foi possível gerar o PDF.</Alert>
          )}
          <Box>
            <Button
              variant="outlined"
              disabled={!report.length || exporting || loading}
              onClick={() => void download()}
            >
              {exporting
                ? 'Gerando PDF…'
                : `Baixar justificativas em PDF (${report.length})`}
            </Button>
          </Box>
          {report.length > 0 && (
            <Box component="details">
              <summary>Texto para o PGR</summary>
              <Stack
                component="section"
                aria-label="Texto para copiar para o PGR"
                spacing={6}
                sx={{
                  mt: 4,
                  p: { xs: 4, sm: 6 },
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  userSelect: 'text',
                }}
              >
                <Typography component="p" variant="subtitle1" fontWeight={700}>
                  Justificativas de fatores químicos não priorizados
                </Typography>
                {report.map((entry) => (
                  <Stack
                    component="article"
                    key={entry.key}
                    spacing={3}
                    sx={{ borderTop: 1, borderColor: 'divider', pt: 4 }}
                  >
                    <Typography
                      component="h1"
                      sx={{
                        fontFamily: 'Georgia, serif',
                        fontSize: '1.5rem',
                        fontWeight: 700,
                        lineHeight: 1.3,
                        overflowWrap: 'anywhere',
                      }}
                    >
                      {entry.agent}
                    </Typography>
                    <Typography variant="body2">
                      {entry.cas && (
                        <>
                          <strong>CAS</strong> {entry.cas} ·{' '}
                        </>
                      )}
                      <strong>GSE</strong> {entry.gse}
                    </Typography>
                    {entry.scenarioDetails.map(
                      ({ product, activity, fields }, index) => (
                        <Box key={index}>
                          <Typography
                            component="h2"
                            variant="subtitle2"
                            fontWeight={700}
                          >
                            {activity}
                          </Typography>
                          <Typography variant="body2">
                            <strong>Produto químico</strong> · {product}
                          </Typography>
                          {fields.map(([label, value]) => (
                            <Typography key={label} variant="body2">
                              <strong>{label}</strong> · {value}
                            </Typography>
                          ))}
                        </Box>
                      ),
                    )}
                    <Box
                      sx={{
                        borderLeft: 3,
                        borderColor: 'text.secondary',
                        pl: 3,
                        py: 2,
                      }}
                    >
                      <Typography
                        component="h2"
                        variant="subtitle1"
                        fontWeight={700}
                      >
                        Justificativa
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ whiteSpace: 'pre-wrap' }}
                      >
                        {entry.justification}
                      </Typography>
                    </Box>
                    {entry.reference && (
                      <Typography variant="body2">
                        <strong>Limite, método ou referência</strong> ·{' '}
                        {entry.reference}
                      </Typography>
                    )}
                  </Stack>
                ))}
              </Stack>
            </Box>
          )}
        </>
      )}
      {stelEditor && (
        <Popover
          open
          anchorEl={stelEditor.anchor}
          onClose={() => setStelEditor(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
          slotProps={{
            paper: {
              role: 'dialog',
              'aria-labelledby': 'chemical-stel-review-title',
              sx: { width: 280, maxWidth: 'calc(100vw - 32px)', p: 4 },
            },
          }}
        >
          <Stack spacing={3}>
            <Typography
              id="chemical-stel-review-title"
              variant="body2"
              fontWeight={600}
            >
              Os dados da atividade justificam priorizar pelo STEL?
            </Typography>
            {stelReviewFields.map(([field, label]) => (
              <TextField
                key={field}
                id={`chemical-stel-review-${field}`}
                select
                size="small"
                label={label}
                helperText={stelEditor.values[field]}
                value={stelReviews[stelEditor.key]?.[field] ?? ''}
                onChange={(event) => {
                  const answer = event.target.value;
                  updateAnalysis((current) => ({
                    ...current,
                    reviewed: false,
                    stelReviews: {
                      ...current.stelReviews,
                      [stelEditor.key]: {
                        ...current.stelReviews?.[stelEditor.key],
                        [field]:
                          answer === 'yes' || answer === 'no'
                            ? answer
                            : undefined,
                      },
                    },
                  }));
                }}
              >
                <MenuItem value="">A confirmar</MenuItem>
                <MenuItem value="yes">Sim</MenuItem>
                <MenuItem value="no">Não</MenuItem>
              </TextField>
            ))}
            <Button
              size="small"
              sx={{ alignSelf: 'flex-end' }}
              onClick={() => setStelEditor(null)}
            >
              Fechar
            </Button>
          </Stack>
        </Popover>
      )}

      {commentEditor && (
        <Dialog
          open
          fullWidth
          maxWidth="sm"
          aria-labelledby="chemical-contact-comment-title"
          onClose={() => setCommentEditor(null)}
        >
          <DialogTitle id="chemical-contact-comment-title">
            Comentário da nota de contato
          </DialogTitle>
          <DialogContent>
            <Typography variant="body2" mb={4}>
              {commentEditor.context}
            </Typography>
            <TextField
              autoFocus
              fullWidth
              multiline
              minRows={3}
              maxRows={8}
              label="Justificativa da nota"
              helperText="Este comentário fica na análise atual."
              value={commentEditor.text}
              onChange={(event) =>
                setCommentEditor({ ...commentEditor, text: event.target.value })
              }
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setCommentEditor(null)}>Cancelar</Button>
            <Button variant="contained" onClick={saveContactComment}>
              Salvar comentário
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </Stack>
  );
}
