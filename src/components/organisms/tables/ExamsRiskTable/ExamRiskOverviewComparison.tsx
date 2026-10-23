import { ExamRiskBulkCheckbox } from './ExamRiskBulkSelection';
import { recommendationInformationTooltip } from './exam-risk-overview.util';
import { ExamRiskDeleteLibrary } from './ExamRiskDeleteLibrary';
import { ExamRiskDeleteLink } from './ExamRiskDeleteLink';
import { ExamRiskPublishLibrary } from './ExamRiskPublishLibrary';
import { canAdoptCoverageExam } from './exam-risk-adoption.util';
import { useState } from 'react';
import { ExamRiskNonAdoption } from './ExamRiskNonAdoption';
import { isNotAdoptedByDecision } from '@v2/services/medicine/company-exam-risk-recommendation-decision/company-exam-risk-recommendation-decision.util';
import { ExamRiskAdoptExam, type AdoptCoverageExam } from './ExamRiskAdoptExam';
import { ExamRiskSynchronizeAll } from './ExamRiskSynchronizeAll';
import { ExamRiskDivergenceAction } from './ExamRiskDivergenceAction';
import { useExamRiskParameterReviews } from './useExamRiskParameterReviews';
import { findDisplayedParameterReview } from '@v2/services/medicine/company-exam-risk-parameter-review/company-exam-risk-parameter-review.util';
import type { ExamRiskReviewIdentity } from '@v2/services/medicine/company-exam-risk-parameter-review/company-exam-risk-parameter-review.types';
import { ExamRiskLibraryInlineParameter } from './ExamRiskLibraryInlineParameter';
import { useQuery } from 'react-query';
import { useQueryClient as useTanstackQueryClient } from '@tanstack/react-query';
import { useAuthShow } from 'components/molecules/SAuthShow';
import { PermissionEnum } from 'project/enum/permission.enum';
import { QueryEnum } from 'core/enums/query.enums';
import { queryClient } from 'core/services/queryClient';
import { refetchExamRiskLinkStatusQueries } from '@v2/services/medicine/company-exam-risk-link-status/hooks/refetch-exam-risk-link-status';
import { companyExamRiskCoverageQueryKeys } from '@v2/services/medicine/company-exam-risk-coverage/hooks/company-exam-risk-coverage.query-keys';
import { ExamRiskInlineParameter } from './ExamRiskInlineParameter';
import {
  loadInlineRiskLinks,
  hasComparableParameterInformation,
  type InlineParameterGroup,
} from './exam-risk-inline-parameter.util';
import type { IExamToRisk } from 'core/interfaces/api/IExam';
import { ExamRiskOverviewEditLink } from './ExamRiskOverviewEditLink';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {
  Box,
  ButtonBase,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Tooltip,
} from '@mui/material';
import type {
  ICompanyExamRiskCoverageItem,
  IPcmsoComparableConfig as Config,
} from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage.types';
import {
  formatExamAge,
  formatExamEvents,
  formatExamPeriodicity,
  formatExamSex,
} from '@v2/services/medicine/company-exam-risk-coverage/company-exam-risk-coverage-display.util';
import { matrixRiskMap } from 'core/constants/maps/matriz-risk.constant';
import { buildExamComparisons } from './exam-risk-overview.util';

const degree = (value: number | null | undefined) =>
  value == null
    ? 'Não informado'
    : `${matrixRiskMap[value as keyof typeof matrixRiskMap]?.label ?? 'Valor sem descrição cadastrada'} (${value})`;

const attributes: {
  label: string;
  keys: (keyof Config)[];
  format: (c: Config) => string;
}[] = [
  {
    label: 'Eventos',
    keys: ['isAdmission', 'isPeriodic', 'isChange', 'isReturn', 'isDismissal'],
    format: formatExamEvents,
  },
  {
    label: 'Periodicidade',
    keys: ['validityInMonths'],
    format: formatExamPeriodicity,
  },
  { label: 'Sexo', keys: ['isMale', 'isFemale'], format: formatExamSex },
  { label: 'Faixa etária', keys: ['fromAge', 'toAge'], format: formatExamAge },
  {
    label: 'Intervalo em dias',
    keys: ['considerBetweenDays'],
    format: (c) =>
      c.considerBetweenDays == null
        ? 'Não informado'
        : String(c.considerBetweenDays),
  },
  {
    label: 'Critério qualitativo',
    keys: ['minRiskDegree'],
    format: (c) => degree(c.minRiskDegree),
  },
  {
    label: 'Critério quantitativo',
    keys: ['minRiskDegreeQuantity'],
    format: (c) => degree(c.minRiskDegreeQuantity),
  },
];

const headerHints = {
  company:
    'Configurações efetivamente adotadas pela empresa para este exame. Podem diferir das recomendações da biblioteca, conforme a avaliação técnica responsável.',
};

function HeaderInfo({ text }: { text: string }) {
  return (
    <Tooltip title={text}>
      <Box
        component="span"
        tabIndex={0}
        role="img"
        aria-label={text}
        sx={{
          display: 'inline-flex',
          verticalAlign: 'middle',
          ml: 0.75,
          color: 'text.secondary',
        }}
      >
        <InfoOutlinedIcon fontSize="small" />
      </Box>
    </Tooltip>
  );
}

function ComparisonIndicator({
  available,
  different,
  label,
  onCopy,
  pending,
  actionText,
  accepted = false,
}: {
  accepted?: boolean;
  onCopy?: () => void;
  pending?: boolean;
  actionText?: string;
  available: boolean;
  different: boolean;
  label: string;
}) {
  const text = !available
    ? 'Comparação indisponível por ausência de informação.'
    : different
      ? accepted
        ? 'Divergência conhecida e aceita pela empresa. Não significa conformidade com a Biblioteca.'
        : 'Valores diferentes entre a Biblioteca e a empresa.'
      : 'Valores correspondentes entre a Biblioteca e a empresa.';
  const Icon = !available
    ? RemoveCircleOutlineIcon
    : different
      ? SwapHorizIcon
      : CheckCircleOutlineIcon;
  if (available && different && onCopy)
    return (
      <>
        {accepted && (
          <ComparisonIndicator available different label={label} accepted />
        )}
        <Tooltip title={actionText}>
          <span>
            <ButtonBase
              aria-label={`${actionText} — ${label}`}
              disabled={pending}
              onClick={(event) => {
                event.stopPropagation();
                onCopy();
              }}
              sx={{
                verticalAlign: 'middle',
                mr: 0.75,
                color: 'warning.main',
                borderRadius: 0.5,
                '&:hover': { bgcolor: 'action.hover' },
                '&.Mui-focusVisible': {
                  outline: '2px solid',
                  outlineColor: 'primary.main',
                },
              }}
            >
              <SwapHorizIcon sx={{ fontSize: 16 }} />
            </ButtonBase>
          </span>
        </Tooltip>
      </>
    );
  return (
    <Tooltip title={`${text} Comparação informativa, sem validação clínica.`}>
      <Box
        component="span"
        tabIndex={0}
        role="img"
        aria-label={`${label}: ${text}`}
        sx={{
          display: 'inline-flex',
          verticalAlign: 'middle',
          mr: 0.75,
          color: !available
            ? 'text.disabled'
            : different
              ? accepted
                ? 'info.main'
                : 'warning.main'
              : 'success.main',
        }}
      >
        {accepted && available && different ? (
          <CheckCircleOutlineIcon sx={{ fontSize: 16 }} />
        ) : (
          <Icon sx={{ fontSize: 16 }} />
        )}
      </Box>
    </Tooltip>
  );
}

export function ExamRiskOverviewComparison({
  data,
  companyId,
  workspaceId,
  onEditLink,
  onAdoptExam,
}: {
  data: ICompanyExamRiskCoverageItem;
  companyId: string;
  workspaceId?: string;
  onEditLink: (link: IExamToRisk) => void;
  onAdoptExam?: AdoptCoverageExam;
}) {
  const [decisionMessage, setDecisionMessage] = useState('');
  const { isAuthSuccess } = useAuthShow();
  const canUpdate = isAuthSuccess({
    permissions: [PermissionEnum.EXAM_RISK],
    cruds: 'u',
  });
  const canDelete = isAuthSuccess({ permissions: [PermissionEnum.EXAM_RISK], cruds: 'd' });
  const scope = {
    companyId,
    workspaceId,
    riskId: data.riskId,
    riskName: data.riskName,
  };
  const reviews = useExamRiskParameterReviews(scope, data);
  const tanstackQueryClient = useTanstackQueryClient();
  const { data: editableLinks, refetch: refetchEditableLinks } = useQuery(
    ['exam-risk-inline-links', scope],
    () => loadInlineRiskLinks(scope),
    {
      enabled:
        (canUpdate || canDelete) &&
        Boolean(companyId) &&
        data.adoptedExams.some((exam) => exam.linkId != null),
      staleTime: 0,
    },
  );
  const refreshAfterSave = async () => {
    await Promise.all([
      queryClient.invalidateQueries([QueryEnum.EXAMS_RISK]),
      queryClient.invalidateQueries([QueryEnum.EXAMS_RISK_DATA]),
      refetchExamRiskLinkStatusQueries(),
      reviews.refreshReviews(),
      tanstackQueryClient.invalidateQueries(
        { queryKey: companyExamRiskCoverageQueryKeys.all() },
        { throwOnError: true },
      ),
    ]);
    const refreshed = await refetchEditableLinks();
    if (refreshed.isError) throw refreshed.error;
  };
  const rows = buildExamComparisons(data.recommendedExams, data.adoptedExams);
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" mb={1}>
        {data.adoptedCount} adotados · {data.notAdoptedCount ?? 0} {(data.notAdoptedCount ?? 0) === 1 ? 'não adotado' : 'não adotados'} por decisão da empresa · {data.missingCount} pendentes
      </Typography>
      {decisionMessage && <Typography variant="caption" display="block" role="status">{decisionMessage}</Typography>}
      {(reviews.message || reviews.loadError) && (
        <Typography
          variant="caption"
          color="text.secondary"
          display="block"
          role="status"
          mb={1}
        >
          {reviews.message ||
            'Não foi possível consultar as aceitações. A edição e a equiparação continuam disponíveis.'}
        </Typography>
      )}
      {!rows.length && (
        <Typography variant="body2">
          Nenhum exame adotado ou recomendado.
        </Typography>
      )}
      {rows.map((row) => (
        <Box
          key={row.key}
          mb={2}
          sx={{
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            overflow: 'hidden',
          }}
        >
          <Typography
            variant="subtitle2"
            fontWeight={700}
            sx={{
              px: 2,
              py: 1,
              bgcolor: (theme) =>
                theme.palette.mode === 'dark' ? 'grey.700' : 'grey.300',
            }}
          >
            {row.adopted.length === 1 && row.adopted[0].linkId != null ? (
              <ExamRiskOverviewEditLink
                companyId={companyId}
                workspaceId={workspaceId}
                riskId={data.riskId}
                riskName={data.riskName}
                exam={row.adopted[0]}
                label={row.name}
                onEdit={onEditLink}
              />
            ) : (
              row.name
            )}
          </Typography>
          {(row.adopted.length ? row.adopted : [undefined]).map(
            (adopted, index) => {
              const recommended = row.recommended;
              const left = recommended?.config;
              const right = adopted?.config;
              const ownedLink =
                canUpdate && adopted?.linkId != null
                  ? editableLinks?.find(
                      (link) =>
                        link.id === adopted.linkId &&
                        link.examId === adopted.examId &&
                        link.riskId === data.riskId &&
                        link.companyId === companyId,
                    )
                  : undefined;
              // Displayed values can be compared without a writable library source.
              const comparablePair = Boolean(
                recommended &&
                  adopted?.linkId != null &&
                  adopted.isRecommendedByLibrary &&
                  !adopted.isLocalOnly &&
                  recommended.matchedAdoptedLinks?.some(
                    (match) =>
                      match.linkId === adopted.linkId &&
                      match.examId === adopted.examId,
                  ) &&
                  data.recommendedExams.filter(
                    (exam) => exam.examId === recommended.examId,
                  ).length === 1 &&
                  data.recommendedExams.filter((exam) =>
                    exam.matchedAdoptedLinks?.some((match) =>
                      match.linkId === adopted.linkId && match.examId === adopted.examId,
                    ),
                  ).length === 1 &&
                  data.adoptedExams.filter(
                    (exam) =>
                      exam.linkId === adopted.linkId &&
                      exam.examId === adopted.examId,
                  ).length === 1,
              );
              const divergentGroups = attributes
                .filter(
                  (attribute) =>
                    comparablePair &&
                    Boolean(recommended?.recommendationSource) &&
                    (attribute.keys[0] !== 'minRiskDegreeQuantity' ||
                      data.quantitativeLimitApplicable === true) &&
                    hasComparableParameterInformation(left, attribute.keys) &&
                    hasComparableParameterInformation(right, attribute.keys) &&
                    attribute.keys.some((key) => left![key] !== right![key]),
                )
                .map(
                  (attribute) =>
                    (attribute.keys[0] === 'isAdmission'
                      ? 'events'
                      : attribute.keys[0] === 'isMale'
                        ? 'sex'
                        : attribute.keys[0] === 'fromAge'
                          ? 'age'
                          : attribute.keys[0]) as InlineParameterGroup,
                );
              const syncProps = {
                recommended,
                adopted,
                link: ownedLink,
                groups: divergentGroups,
                quantitativeLimitApplicable: data.quantitativeLimitApplicable,
                scope,
                onSaved: refreshAfterSave,
              };
              return (
                <Table
                  key={adopted?.linkId ?? index}
                  size="small"
                  sx={{ tableLayout: 'fixed', width: '100%' }}
                  aria-label={`Comparação de ${row.name}`}
                >
                  <TableHead>
                    <TableRow
                      sx={{
                        '& th': {
                          bgcolor: (theme) =>
                            theme.palette.mode === 'dark'
                              ? 'grey.800'
                              : 'grey.100',
                          fontWeight: 700,
                        },
                      }}
                    >
                      <TableCell width="50%">
                        Recomendado pela Biblioteca
                        <HeaderInfo
                          text={recommendationInformationTooltip(recommended?.notes)}
                        />
                        {recommended?.recommendationSource && (
                          <ExamRiskDeleteLibrary scope={scope} exam={recommended} onSaved={refreshAfterSave} />
                        )}
                        {!recommended && adopted?.isLocalOnly && adopted.linkId != null && (
                          <ExamRiskPublishLibrary
                            key={`${companyId}:${workspaceId}:${adopted.linkId}`}
                            companyId={companyId}
                            workspaceId={workspaceId}
                            linkId={adopted.linkId}
                            onSaved={refreshAfterSave}
                          />
                        )}
                        <ExamRiskSynchronizeAll
                          destination="library"
                          {...syncProps}
                        />
                        {(!recommended || recommended.isMissing) && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            {recommended
                              ? 'Pendente de adoção'
                              : 'Sem recomendação correspondente neste detalhe.'}
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell width="50%">
                        {adopted?.linkId != null && <ExamRiskBulkCheckbox linkId={adopted.linkId} examName={adopted.examName} />}
                        Adotado pela empresa
                        {adopted?.linkId != null && (
                          <>
                            {' '}
                            ·{' '}
                            {row.adopted.length > 1 ? (
                              <ExamRiskOverviewEditLink
                                companyId={companyId}
                                workspaceId={workspaceId}
                                riskId={data.riskId}
                                riskName={data.riskName}
                                exam={adopted}
                                label={`Vínculo ${adopted.linkId}`}
                                onEdit={onEditLink}
                              />
                            ) : (
                              `Vínculo ${adopted.linkId}`
                            )}
                          </>
                        )}
                        <HeaderInfo text={headerHints.company} />
                        {adopted?.linkId != null && canUpdate && (
                          <ExamRiskOverviewEditLink
                            companyId={companyId}
                            workspaceId={workspaceId}
                            riskId={data.riskId}
                            riskName={data.riskName}
                            exam={adopted}
                            iconOnly
                            onEdit={onEditLink}
                          />
                        )}
                        {adopted?.linkId != null && canDelete && (
                          <ExamRiskDeleteLink
                            scope={scope}
                            examId={adopted.examId}
                            examName={adopted.examName}
                            link={editableLinks?.find(link => link.id === adopted.linkId && link.examId === adopted.examId && link.riskId === data.riskId && link.companyId === companyId)}
                          />
                        )}
                        {!adopted && (
                          <ExamRiskAdoptExam
                            companyId={companyId}
                            workspaceId={workspaceId}
                            riskId={data.riskId}
                            exam={recommended}
                            onAdopt={onAdoptExam}
                          />
                        )}
                        {!adopted && (
                          <ExamRiskNonAdoption
                            companyId={companyId} workspaceId={workspaceId} riskId={data.riskId}
                            exam={recommended} canUpdate={canUpdate}
                            showAdoptSeparator={Boolean(onAdoptExam) && canAdoptCoverageExam(recommended) && isAuthSuccess({ permissions: [PermissionEnum.EXAM_RISK], cruds: 'c' })}
                            onSaved={refreshAfterSave} onMessage={setDecisionMessage}
                          />
                        )}
                        <ExamRiskSynchronizeAll
                          destination="company"
                          {...syncProps}
                        />
                        {((!adopted && !isNotAdoptedByDecision(recommended)) || adopted?.isLocalOnly) && (
                          <Typography
                            variant="caption"
                            color="text.secondary"
                            display="block"
                          >
                            {adopted
                              ? 'Exame exclusivamente local'
                              : 'Sem exame adotado correspondente neste detalhe.'}
                          </Typography>
                        )}
                      </TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {attributes.map((attribute) => {
                      if (
                        attribute.keys[0] === 'minRiskDegreeQuantity' &&
                        data.quantitativeLimitApplicable !== true
                      ) {
                        const text =
                          data.quantitativeLimitApplicable === false
                            ? 'Não aplicável'
                            : 'Comparação indisponível — aplicabilidade não resolvida';
                        return (
                          <TableRow
                            key={attribute.label}
                            sx={{ bgcolor: 'background.paper' }}
                          >
                            {[0, 1].map((side) => (
                              <TableCell key={side}>
                                <strong>{attribute.label}:</strong> {text}
                              </TableCell>
                            ))}
                          </TableRow>
                        );
                      }
                      const available =
                        comparablePair &&
                        hasComparableParameterInformation(
                          left,
                          attribute.keys,
                        ) &&
                        hasComparableParameterInformation(
                          right,
                          attribute.keys,
                        );
                      const different =
                        !!left &&
                        !!right &&
                        attribute.keys.some((key) => left[key] !== right[key]);
                      const group = (
                        attribute.keys[0] === 'isAdmission'
                          ? 'events'
                          : attribute.keys[0] === 'isMale'
                            ? 'sex'
                            : attribute.keys[0] === 'fromAge'
                              ? 'age'
                              : attribute.keys[0]
                      ) as InlineParameterGroup;
                      const source = recommended?.recommendationSource;
                      const identity: ExamRiskReviewIdentity | undefined =
                        source && adopted?.linkId != null && recommended
                          ? {
                              companyId,
                              riskId: data.riskId,
                              linkId: adopted.linkId,
                              adoptedExamId: adopted.examId,
                              recommendedExamId: recommended.examId,
                              ruleId: source.ruleId,
                              ruleExamId: source.ruleExamId,
                            }
                          : undefined;
                      const review =
                        available && different && identity && left && right
                          ? findDisplayedParameterReview(
                              reviews.data,
                              identity,
                              group,
                              attribute.keys,
                              left,
                              right,
                            )
                          : undefined;
                      const prefix =
                        (actionText: string, accepted = false) =>
                        (copy?: () => void, pending?: boolean) => (
                          <>
                            <ComparisonIndicator
                              available={available}
                              different={different}
                              label={attribute.label}
                              onCopy={copy}
                              pending={pending}
                              actionText={actionText}
                              accepted={accepted}
                            />
                            <strong>{attribute.label}:</strong>{' '}
                          </>
                        );
                      const libraryPrefix = prefix(
                        'Atualizar Biblioteca com valor da empresa',
                      );
                      const companyPrefix = prefix(
                        'Adotar valor da Biblioteca',
                        review?.state === 'ACCEPTED',
                      );
                      const canCopy =
                        available &&
                        different &&
                        Boolean(recommended?.recommendationSource);
                      return (
                        <TableRow
                          key={attribute.label}
                          sx={{ bgcolor: 'background.paper' }}
                        >
                          <TableCell>
                            {recommended?.recommendationSource && left ? (
                              <ExamRiskLibraryInlineParameter
                                key={`${recommended.recommendationSource.ruleExamId}:${recommended.recommendationSource.ruleUpdatedAt}:${recommended.recommendationSource.itemUpdatedAt}`}
                                exam={recommended}
                                prefix={libraryPrefix}
                                copyFrom={canCopy ? right : undefined}
                                group={
                                  (attribute.keys[0] === 'isAdmission'
                                    ? 'events'
                                    : attribute.keys[0] === 'isMale'
                                      ? 'sex'
                                      : attribute.keys[0] === 'fromAge'
                                        ? 'age'
                                        : attribute
                                            .keys[0]) as InlineParameterGroup
                                }
                                confirmedText={attribute.format(left)}
                                onSaved={refreshAfterSave}
                              />
                            ) : (
                              <>
                                {libraryPrefix()}
                                {left ? attribute.format(left) : '—'}
                              </>
                            )}
                          </TableCell>
                          <TableCell>
                            {(() => {
                              const ownedLink =
                                canUpdate && adopted?.linkId != null
                                  ? editableLinks?.find(
                                      (link) =>
                                        link.id === adopted.linkId &&
                                        link.examId === adopted.examId &&
                                        link.riskId === data.riskId &&
                                        link.companyId === companyId,
                                    )
                                  : undefined;
                              return ownedLink ? (
                                <ExamRiskInlineParameter
                                  key={`${companyId}:${workspaceId}:${ownedLink.id}`}
                                  scope={scope}
                                  group={
                                    (attribute.keys[0] === 'isAdmission'
                                      ? 'events'
                                      : attribute.keys[0] === 'isMale'
                                        ? 'sex'
                                        : attribute.keys[0] === 'fromAge'
                                          ? 'age'
                                          : attribute
                                              .keys[0]) as InlineParameterGroup
                                  }
                                  link={ownedLink}
                                  prefix={companyPrefix}
                                  copyFrom={canCopy ? left : undefined}
                                  confirmedText={
                                    right ? attribute.format(right) : '—'
                                  }
                                  onSaved={refreshAfterSave}
                                />
                              ) : (
                                <>
                                  {companyPrefix()}
                                  {right ? attribute.format(right) : '—'}
                                </>
                              );
                            })()}
                            <ExamRiskDivergenceAction
                              review={review}
                              canUpdate={canUpdate}
                              pending={reviews.pending}
                              label={`${attribute.label}, vínculo ${adopted?.linkId}`}
                              onAction={(action) => {
                                if (identity && review)
                                  void reviews.save(identity, review, action);
                              }}
                            />
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              );
            },
          )}
        </Box>
      ))}
    </Box>
  );
}
