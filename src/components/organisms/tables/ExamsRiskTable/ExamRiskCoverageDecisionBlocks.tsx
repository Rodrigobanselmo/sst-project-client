import { bulkEditErrorMessage } from './exam-risk-bulk-error.util';
import { ergonomicFilterOptions, matchesPfro, pfroLabel } from './exam-risk-pfro.util';
import {
  ExamRiskBulkContext,
  ExamRiskBulkCheckbox,
  useBulkLoadedLinks,
  visibleBulkLinks,
} from './ExamRiskBulkSelection';
import { BulkEditExamRiskModal } from './BulkEditExamRiskModal';
import { useMutBulkUpdateExamRisk } from 'core/services/hooks/mutations/checklist/exams/useMutBulkUpdateExamRisk/useMutBulkUpdateExamRisk';
import { isExamRiskQuantityApplicable } from 'core/utils/helpers/isExamRiskQuantityApplicable';
import { examRiskAiModeCopy } from './ExamRiskAiModePresentation';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { PermissionEnum } from 'project/enum/permission.enum';
import type { AdoptCoverageExam } from './ExamRiskAdoptExam';
import {
  FC,
  Fragment,
  useMemo,
  useState,
  useCallback,
  useEffect,
  useRef,
} from 'react';
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Alert,
  Checkbox,
  TextField,
  MenuItem,
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Typography,
  Tooltip,
} from '@mui/material';
import { type ExamRiskCoverageFilter } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage-decision.util';
import type { ICompanyExamRiskCoverageItem } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';
import { resolveCoverageStatusLabel } from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage-display.util';
import { useFetchCompanyExamRiskCoverageDetail } from '@v2/services/medicine/company-exam-risk-coverage/hooks/useFetchCompanyExamRiskCoverageDetail';
import { ExamRiskOverviewComparison } from './ExamRiskOverviewComparison';
import {
  sortOverviewRisks,
  type OverviewSort,
  type OverviewSortField,
} from './exam-risk-overview.util';
import AddIcon from '@mui/icons-material/Add';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import type { IExamToRisk } from 'core/interfaces/api/IExam';
import { ExamBlock } from './ExamRiskCoverageDetailDrawer';

type Props = {
  items: ICompanyExamRiskCoverageItem[];
  companyId: string;
  workspaceId?: string;
  activeFilter: ExamRiskCoverageFilter;
  isLoading?: boolean;
  isError?: boolean;
  onAddLink: (item: ICompanyExamRiskCoverageItem) => void;
  onEditLink: (link: IExamToRisk) => void;
  onAdoptExam?: AdoptCoverageExam;
  onViewCoverage: (riskId: string) => void;
  onCompleteCoverage: (item: ICompanyExamRiskCoverageItem) => void;
  onReviewWithAi: (item: ICompanyExamRiskCoverageItem) => void;
};

const viewCopy: Record<
  ExamRiskCoverageFilter,
  { title: string; description: string; guidance: string }
> = {
  analyzed: {
    title: 'Riscos analisados — visão geral',
    description:
      'Fatores de risco considerados na análise de exames do estabelecimento, incluindo os que ainda não possuem exames vinculados.',
    guidance:
      'Expanda um risco para consultar seus exames. As ações de adoção, revisão e configuração dependem da situação de cada risco.',
  },
  complete: {
    title: 'Cobertura completa',
    description:
      'Riscos sem recomendações pendentes: exames adotados ou decisões válidas de não adoção, sem exames exclusivamente locais.',
    guidance:
      'Consulte os exames e os detalhes da cobertura. Para editar um vínculo, abra o detalhamento dos vínculos de exames.',
  },
  recommendationAvailable: {
    title: 'Recomendações disponíveis',
    description:
      'Riscos com exames recomendados pela Biblioteca SimpleSST e nenhum exame adotado pela empresa.',
    guidance:
      'Expanda o risco para consultar as recomendações e completar a cobertura. Revise com IA ou adicione exames pelo (+).',
  },
  partiallyAdopted: {
    title: 'Cobertura incompleta',
    description:
      'Riscos com exames adotados e recomendações ainda pendentes. Também podem existir exames locais.',
    guidance:
      'Consulte as pendências, complete a cobertura, revise com IA ou configure os exames manualmente.',
  },
  noLibraryRecommendation: {
    title: 'Sem recomendação',
    description:
      'Riscos sem recomendação aplicável da Biblioteca SimpleSST e sem exames adotados.',
    guidance: 'Solicite uma análise com IA ou cadastre os exames manualmente.',
  },
  localOnly: {
    title: 'Exclusivamente locais',
    description:
      'Riscos com exames adotados pela empresa e sem recomendação aplicável da Biblioteca SimpleSST. Essa situação não indica, por si só, um erro.',
    guidance:
      'Consulte os vínculos, revise a compatibilidade ou solicite uma revisão com IA.',
  },
  recommendedWithoutAdoptedExam: {
    title: 'Sem nenhum exame adotado',
    description:
      'Riscos com recomendação aplicável da Biblioteca SimpleSST, mas nenhum exame adotado pela empresa. Podem coincidir com a visão de recomendações disponíveis.',
    guidance:
      'Expanda o risco para consultar as recomendações e completar a cobertura. Revise com IA ou adicione exames pelo (+).',
  },
};

const ExpandedRisk: FC<{
  companyId: string;
  workspaceId?: string;
  riskId: string;
  comparative: boolean;
  onEditLink: (link: IExamToRisk) => void;
  onAdoptExam?: AdoptCoverageExam;
  onCompleteCoverage: (item: ICompanyExamRiskCoverageItem) => void;
}> = ({
  comparative,
  onEditLink,
  onAdoptExam,
  onCompleteCoverage,
  ...params
}) => {
  const { isAuthSuccess } = useAuthShow();
  const canCreate = isAuthSuccess({
    permissions: [PermissionEnum.EXAM_RISK],
    cruds: 'c',
  });
  const { data, isLoading, isError, refetch } =
    useFetchCompanyExamRiskCoverageDetail({ ...params, onlyPcmso: true });
  useBulkLoadedLinks(
    { ...params, riskName: data?.riskName ?? '' },
    !isLoading && !isError && data?.riskId === params.riskId
      ? data.adoptedExams.flatMap((exam) =>
          exam.linkId == null ? [] : [exam.linkId],
        )
      : [],
  );
  if (isLoading)
    return (
      <CircularProgress size={24} aria-label="Carregando exames do risco" />
    );
  if (isError)
    return (
      <Alert
        severity="error"
        action={
          <Button onClick={() => void refetch()}>Tentar novamente</Button>
        }
      >
        Não foi possível carregar os exames deste risco.
      </Alert>
    );
  if (!data || data.riskId !== params.riskId) return null;
  const completeAction =
    canCreate && data.missingRecommendedExams.length > 0 ? (
      <Box display="flex" justifyContent="flex-end" mb={1}>
        <Tooltip
          describeChild
          disableInteractive={false}
          componentsProps={{
            tooltip: {
              sx: {
                bgcolor: '#30343B',
                color: '#F5F5F5',
                maxWidth: 420,
                p: 2,
                lineHeight: 1.55,
              },
            },
          }}
          title={
            <Box>
              <Typography
                variant="body2"
                mb={1}
                sx={{ color: '#FFFFFF', fontWeight: 700, lineHeight: 1.5 }}
              >
                Selecione vários exames recomendados pela Biblioteca para este
                fator de risco e adote-os em uma única operação.
              </Typography>
              <Typography
                variant="body2"
                mb={1.5}
                sx={{ color: 'inherit', lineHeight: 1.55 }}
              >
                Os vínculos serão criados no estabelecimento selecionado, com os
                parâmetros das respectivas recomendações.
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: '#FFFFFF', fontWeight: 700 }}
              >
                Exames disponíveis para adoção:
              </Typography>
              <Box
                role="region"
                aria-label="Exames disponíveis para adoção"
                tabIndex={0}
                sx={{
                  maxHeight: 200,
                  overflowY: 'auto',
                  my: 1,
                  '&:focus-visible': { outline: '2px solid currentColor' },
                }}
              >
                <Box
                  component="ul"
                  sx={{
                    m: 0,
                    pl: 2,
                    '& li': { py: 0.375, lineHeight: 1.5, color: 'inherit' },
                  }}
                >
                  {data.missingRecommendedExams.map((exam) => (
                    <li key={exam.examId}>{exam.examName}</li>
                  ))}
                </Box>
              </Box>
              <Typography
                variant="body2"
                sx={{
                  color: 'inherit',
                  lineHeight: 1.55,
                  borderTop: '1px solid rgba(255, 255, 255, 0.22)',
                  pt: 1.25,
                }}
              >
                Você poderá selecionar ou desmarcar exames e conferir a prévia
                dos parâmetros antes de confirmar. A prévia poderá identificar
                recomendações inelegíveis.
              </Typography>
            </Box>
          }
        >
          <Button
            size="small"
            variant="contained"
            onClick={() => onCompleteCoverage(data)}
          >
            Adotar exames recomendados
          </Button>
        </Tooltip>
      </Box>
    ) : null;
  if (comparative)
    return (
      <>
        {completeAction}
        <ExamRiskOverviewComparison
          data={data}
          companyId={params.companyId}
          workspaceId={params.workspaceId}
          onEditLink={onEditLink}
          onAdoptExam={onAdoptExam}
        />
      </>
    );
  return (
    <Box>
      {completeAction}
      <Typography variant="subtitle2" mb={1}>
        Exames adotados pela empresa
      </Typography>
      {!data.adoptedExams.length && (
        <Typography variant="body2" mb={2}>
          Nenhum exame adotado.
        </Typography>
      )}
      {data.adoptedExams.map((exam) => (
        <ExamBlock
          key={`adopted-${exam.linkId}-${exam.examId}`}
          selection={
            exam.linkId != null ? (
              <ExamRiskBulkCheckbox
                linkId={exam.linkId}
                examName={exam.examName}
              />
            ) : undefined
          }
          exam={exam}
          badge={
            exam.isLocalOnly
              ? 'Exclusivamente local'
              : 'Recomendado pela Biblioteca'
          }
        />
      ))}
      <Typography variant="subtitle2" mb={1}>
        Recomendações da Biblioteca SimpleSST
      </Typography>
      {!data.recommendedExams.length && (
        <Typography variant="body2">
          Nenhuma recomendação disponível.
        </Typography>
      )}
      {data.recommendedExams.map((exam, index) => (
        <ExamBlock
          key={`recommended-${exam.examId}-${index}`}
          notesInTooltip
          exam={exam}
          badge={exam.isMissing ? 'Pendente de adoção' : 'Contemplado'}
        />
      ))}
    </Box>
  );
};

export const ExamRiskCoverageDecisionBlocks: FC<Props> = ({
  items,
  companyId,
  workspaceId,
  activeFilter,
  isLoading,
  isError,
  onViewCoverage,
  onEditLink,
  onAdoptExam,
  onAddLink,
  onCompleteCoverage,
  onReviewWithAi,
}) => {
  const [expandedRiskIds, setExpandedRiskIds] = useState<string[]>([]);
  const [sort, setSort] = useState<OverviewSort>({
    field: 'coverage',
    direction: 'asc',
  });
  const { isAuthSuccess } = useAuthShow();
  const canAddLink = isAuthSuccess({
    permissions: [PermissionEnum.EXAM_RISK],
    cruds: 'c',
  });
  const [pfro, setPfro] = useState('');
  const [selected, setSelected] = useState<number[]>([]);
  const [loaded, setLoaded] = useState<Record<string, IExamToRisk[]>>({});
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkError, setBulkError] = useState('');
  const saving = useRef(false);
  const { isAuthSuccess: bulkAuth } = useAuthShow();
  const canBulk = bulkAuth({
    permissions: [PermissionEnum.EXAM_RISK],
    cruds: 'u',
  });
  const mutation = useMutBulkUpdateExamRisk();
  const register = useCallback((riskId: string, links: IExamToRisk[]) => {
    setLoaded((current) => ({ ...current, [riskId]: links }));
  }, []);
  useEffect(() => {
    setSelected([]);
    setBulkOpen(false);
  }, [companyId, workspaceId, activeFilter, pfro]);
  const eligible = visibleBulkLinks(loaded, items, pfro);
  const ids = [...new Set(eligible.map((link) => link.id))];
  const effectiveSelected = selected.filter((id) => ids.includes(id));
  const eligibleKey = ids.join(',');
  useEffect(() => {
    setSelected((current) => current.filter((id) => ids.includes(id)));
  }, [eligibleKey]);
  const toggle = (id: number) => {
    if (ids.includes(id))
      setSelected((current) =>
        current.includes(id)
          ? current.filter((value) => value !== id)
          : [...current, id],
      );
  };
  const isOverview = activeFilter === 'analyzed';
  const visibleItems = useMemo(
    () => (isOverview ? sortOverviewRisks(items, sort) : items),
    [items, sort, isOverview],
  );
  const header = (field: OverviewSortField, label: string) =>
    isOverview ? (
      <TableSortLabel
        active={sort.field === field}
        direction={sort.field === field ? sort.direction : 'asc'}
        onClick={() =>
          setSort((current) => ({
            field,
            direction:
              current.field === field && current.direction === 'asc'
                ? 'desc'
                : 'asc',
          }))
        }
      >
        {label}
      </TableSortLabel>
    ) : (
      label
    );
  const copy = viewCopy[activeFilter];
  return (
    <ExamRiskBulkContext.Provider
      value={
        canBulk
          ? { selected: effectiveSelected, eligibleIds: ids, toggle, register }
          : null
      }
    >
      <Box mt={2} mb={2}>
        <TextField
          select
          size="small"
          label="Tipo de P/FRO"
          value={pfro}
          onChange={(event) => setPfro(event.target.value)}
          sx={{ minWidth: 180, mb: 1 }}
        >
          <MenuItem value="">Todos</MenuItem>
          {['QUI', 'FIS', 'BIO', 'ACI', 'ERG', 'OUTROS'].map((type) => (
            <MenuItem key={type} value={type}>
              {type === 'ERG' ? 'ERG — Todos' : type}
            </MenuItem>
          ))}
          {ergonomicFilterOptions(items).map(subgroup => (
            <MenuItem key={`ERG:${subgroup.id}`} value={`ERG:${subgroup.id}`}>
              ERG – {subgroup.name}
            </MenuItem>
          ))}
        </TextField>
        {canBulk && (
          <Box mb={1}>
            <Checkbox
              checked={
                ids.length > 0 && effectiveSelected.length === ids.length
              }
              indeterminate={
                effectiveSelected.length > 0 &&
                effectiveSelected.length < ids.length
              }
              disabled={!ids.length || mutation.isLoading}
              onChange={(_, checked) => setSelected(checked ? ids : [])}
              inputProps={{
                'aria-label':
                  'Selecionar vínculos próprios visíveis e carregados',
              }}
            />
            {effectiveSelected.length} vínculo(s) selecionado(s) · {ids.length}{' '}
            elegível(is) carregado(s)
            <Button
              disabled={!effectiveSelected.length || mutation.isLoading}
              onClick={() => setBulkOpen(true)}
            >
              Editar em lote
            </Button>
            <Button
              disabled={mutation.isLoading}
              onClick={() => setSelected([])}
            >
              Limpar seleção
            </Button>
            <Typography variant="caption" display="block">
              Os parâmetros do vínculo são empresariais e podem repercutir em
              outros estabelecimentos. A seleção abrange somente vínculos
              próprios nas expansões carregadas.
            </Typography>
          </Box>
        )}
        {bulkError && <Alert severity="error">{bulkError}</Alert>}
        <BulkEditExamRiskModal
          open={bulkOpen && canBulk}
          count={effectiveSelected.length}
          canEditQuantitative={
            effectiveSelected.length > 0 &&
            eligible
              .filter((link) => effectiveSelected.includes(link.id))
              .every((link) => isExamRiskQuantityApplicable(link.risk))
          }
          isSaving={mutation.isLoading}
          onClose={() => {
            if (!mutation.isLoading) setBulkOpen(false);
          }}
          onConfirm={async (patch) => {
            if (
              !effectiveSelected.length ||
              mutation.isLoading ||
              saving.current
            )
              return;
            saving.current = true;
            setBulkError('');
            try {
              const result = await mutation.mutateAsync({
                ids: effectiveSelected,
                companyId,
                patch,
              });
              if (!result)
                throw new Error('Não foi possível confirmar a atualização.');
              setSelected([]);
              setBulkOpen(false);
            } catch (error) {
              setBulkError(
                bulkEditErrorMessage(error),
              );
            } finally {
              saving.current = false;
            }
          }}
        />

        <Typography variant="h6">{copy.title}</Typography>
        <Typography variant="body2" color="text.secondary" mt={0.5}>
          {copy.description}
        </Typography>
        <Typography variant="body2" mt={0.5} mb={2}>
          {copy.guidance}
        </Typography>
        {isLoading ? (
          <Typography role="status">Carregando riscos…</Typography>
        ) : isError ? (
          <Alert severity="warning">
            Não foi possível carregar os riscos. Use a ação de recarregar no
            detalhamento dos vínculos para tentar novamente.
          </Alert>
        ) : (
          <TableContainer
            sx={{
              border: '1px solid',
              borderColor: 'divider',
              borderRadius: 1,
            }}
          >
            <Table size="small" aria-label={copy.title}>
              <TableHead>
                <TableRow>
                  <TableCell
                    sortDirection={
                      isOverview && sort.field === 'riskName'
                        ? sort.direction
                        : false
                    }
                  >
                    {header('riskName', 'Fator de risco')}
                  </TableCell>
                  <TableCell
                    sortDirection={
                      isOverview && sort.field === 'coverage'
                        ? sort.direction
                        : false
                    }
                  >
                    {header('coverage', 'Situação de cobertura')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sortDirection={
                      isOverview && sort.field === 'adoptedCount'
                        ? sort.direction
                        : false
                    }
                  >
                    {header('adoptedCount', 'Exames adotados (quantidade)')}
                  </TableCell>
                  <TableCell
                    align="center"
                    sortDirection={
                      isOverview && sort.field === 'missingCount'
                        ? sort.direction
                        : false
                    }
                  >
                    {header(
                      'missingCount',
                      'Recomendações pendentes (quantidade)',
                    )}
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {!visibleItems.filter(
                  (item) => matchesPfro(item, pfro),
                ).length && (
                  <TableRow>
                    <TableCell colSpan={4}>
                      Nenhum risco nesta situação.
                    </TableCell>
                  </TableRow>
                )}
                {visibleItems
                  .filter((item) => matchesPfro(item, pfro))
                  .map((item) => {
                    const expanded = expandedRiskIds.includes(item.riskId);
                    const aiCopy = examRiskAiModeCopy(item.hasAnyAdoptedExam);
                    return (
                      <Fragment key={item.riskId}>
                        <TableRow hover>
                          <TableCell>
                            <Box display="flex" alignItems="center" gap={1}>
                              <Box
                                sx={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: 1,
                                  flexShrink: 0,
                                  flexWrap: 'nowrap',
                                }}
                              >
                                <IconButton
                                  size="small"
                                  aria-label={`${expanded ? 'Recolher' : 'Expandir'} exames de ${item.riskName}`}
                                  aria-expanded={expanded}
                                  aria-controls={
                                    expanded
                                      ? `risk-detail-${item.riskId}`
                                      : undefined
                                  }
                                  onClick={() =>
                                    setExpandedRiskIds((current) =>
                                      expanded
                                        ? current.filter(
                                            (id) => id !== item.riskId,
                                          )
                                        : [...current, item.riskId],
                                    )
                                  }
                                >
                                  <ExpandMoreIcon
                                    sx={{
                                      transform: expanded
                                        ? 'rotate(180deg)'
                                        : undefined,
                                    }}
                                  />
                                </IconButton>
                                {canAddLink && (
                                  <IconButtonRow
                                    icon={<AddIcon sx={{ fontSize: 16 }} />}
                                    tooltipTitle="Adicionar exame"
                                    aria-label={`Adicionar exame a ${item.riskName}`}
                                    sx={{
                                      mx: 0,
                                      width: 22,
                                      height: 22,
                                      p: 0,
                                      flexShrink: 0,
                                      border: '1px solid',
                                      borderColor: 'divider',
                                      borderRadius: '50%',
                                    }}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      onAddLink(item);
                                    }}
                                  />
                                )}
                                <Box
                                  sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    flexShrink: 0,
                                  }}
                                >
                                  <IconButtonRow
                                    icon={
                                      <AutoAwesomeIcon sx={{ fontSize: 16 }} />
                                    }
                                    tooltipTitle={
                                      <Box sx={{ '& *': { color: 'inherit' } }}>
                                        <Typography
                                          component="div"
                                          fontWeight={700}
                                          color="inherit"
                                        >
                                          {aiCopy.title}
                                        </Typography>
                                        <Typography
                                          component="div"
                                          variant="body2"
                                          color="inherit"
                                        >
                                          {aiCopy.description}
                                        </Typography>
                                      </Box>
                                    }
                                    aria-label={`${aiCopy.title} — ${item.riskName}`}
                                    sx={{
                                      mx: 0,
                                      width: 24,
                                      height: 24,
                                      p: 0,
                                      flexShrink: 0,
                                    }}
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      onReviewWithAi(item);
                                    }}
                                  />
                                </Box>
                              </Box>
                              <Box sx={{ minWidth: 0 }}>
                                <Typography variant="body2" fontWeight={600}>
                                  <Chip
                                    size="small"
                                    variant="outlined"
                                    label={pfroLabel(item)}
                                    sx={{ mr: 1 }}
                                  />
                                  {item.riskName}
                                </Typography>
                                {!isOverview && (
                                  <Typography
                                    variant="caption"
                                    color="text.secondary"
                                  >
                                    {item.riskGroup.name}
                                    {item.riskSubgroup
                                      ? ` / ${item.riskSubgroup.name}`
                                      : ''}
                                  </Typography>
                                )}
                              </Box>
                            </Box>
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={resolveCoverageStatusLabel(item)}
                              onClick={() => onViewCoverage(item.riskId)}
                            />
                          </TableCell>
                          <TableCell align="center">
                            {item.adoptedCount}
                          </TableCell>
                          <TableCell align="center">
                            {item.missingCount}
                          </TableCell>
                        </TableRow>
                        {expanded && (
                          <TableRow>
                            <TableCell colSpan={4}>
                              <Box id={`risk-detail-${item.riskId}`} p={2}>
                                <ExpandedRisk
                                  comparative={isOverview}
                                  onCompleteCoverage={onCompleteCoverage}
                                  onEditLink={onEditLink}
                                  onAdoptExam={onAdoptExam}
                                  companyId={companyId}
                                  workspaceId={workspaceId}
                                  riskId={item.riskId}
                                />
                              </Box>
                            </TableCell>
                          </TableRow>
                        )}
                      </Fragment>
                    );
                  })}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Box>
    </ExamRiskBulkContext.Provider>
  );
};
