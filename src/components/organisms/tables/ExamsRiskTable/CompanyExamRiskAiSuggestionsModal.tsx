import {
  FC,
  ReactNode,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Alert,
  Box,
  Button,
  Checkbox,
  Chip,
  CircularProgress,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControlLabel,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';

import { ExamRiskAiAssistantConfigForm } from '@v2/components/medicine/exam-risk-ai-assistant/ExamRiskAiAssistantConfigForm';
import { ExamRiskAiAccumulatedSelectionPanel } from '@v2/components/medicine/exam-risk-ai-assistant/ExamRiskAiAccumulatedSelectionPanel';
import { ExamRiskAiAssistantPresetSection } from '@v2/components/medicine/exam-risk-ai-assistant/ExamRiskAiAssistantPresetSection';
import { ExamRiskAiPromptDraftSection } from '@v2/components/medicine/exam-risk-ai-assistant/ExamRiskAiPromptDraftSection';
import { ExamRiskAiRiskContextHeader } from '@v2/components/medicine/exam-risk-ai-assistant/ExamRiskAiRiskContextHeader';
import type { ExamRiskAiRiskContextDisplay } from '@v2/components/medicine/exam-risk-ai-assistant/exam-risk-ai-risk-context-display.util';
import type { ExamRiskAiPromptDraftCurrentState } from '@v2/components/medicine/exam-risk-ai-assistant/exam-risk-ai-prompt-draft-merge.util';
import { buildRiskExamAccumulationKey } from '@v2/components/medicine/exam-risk-ai-assistant/exam-risk-ai-assistant-accumulated.util';
import { useExamRiskAiAccumulatedSuggestions } from '@v2/components/medicine/exam-risk-ai-assistant/useExamRiskAiAccumulatedSuggestions';
import {
  buildRiskToExamAiPresetConfig,
  mapCompanyPresetToState,
} from '@v2/components/medicine/exam-risk-ai-assistant/exam-risk-ai-assistant-preset.util';
import {
  EXAM_RISK_AI_ANALYSIS_STATUS_COLORS,
  EXAM_RISK_AI_CANDIDATE_COMPATIBILITY_COLORS,
  EXAM_RISK_AI_CANDIDATE_COMPATIBILITY_LABELS,
  EXAM_RISK_AI_DECISION_COLORS,
  EXAM_RISK_AI_DECISION_LABELS,
} from '@v2/components/medicine/exam-risk-ai-assistant/exam-risk-ai-assistant.constants';
import {
  buildPhysicianOverrideConfirmationCopy,
  getExamRiskAiAdoptionStatusLabel,
  getExamRiskAiAnalysisStatusLabel,
  getExamRiskAiProtocolRoleLabel,
  getExamRiskAiPurposeLabel,
  getExamRiskAiRecommendedDecisionStatusLabel,
  getExamRiskAiVerdictLabel,
} from '@v2/components/medicine/exam-risk-ai-assistant/exam-risk-ai-verdict-display.util';
import {
  buildExamRiskAiAssistantPayload,
  createDefaultExamRiskAiAssistantFormValues,
  type ExamRiskAiAssistantFormValues,
} from '@v2/components/medicine/exam-risk-ai-assistant/exam-risk-ai-assistant.types';
import {
  formatExamRiskQualitativeDegreeLabel,
  formatExamRiskQuantitativeDegreeLabel,
} from 'core/utils/helpers/exam-risk-degree-display.util';
import { usePermissionsAccess } from '@v2/hooks/usePermissionsAccess';

import { useApplyCompanyExamRiskAiSuggestions } from '@v2/services/medicine/company-exam-risk-ai-suggestions/hooks/useApplyCompanyExamRiskAiSuggestions';
import { useDryRunCompanyExamRiskAiSuggestions } from '@v2/services/medicine/company-exam-risk-ai-suggestions/hooks/useDryRunCompanyExamRiskAiSuggestions';
import {
  CompanyExamRiskAiApplyItemStatusEnum,
  CompanyExamRiskAiApplyMechanismEnum,
  type IApplyCompanyExamRiskAiSuggestionItemResult,
  type IApplyCompanyExamRiskAiSuggestionsResponse,
  type ICompanyExamRiskAiExposureContext,
  type ICompanyExamRiskAiReviewedExam,
  type ICompanyExamRiskAiSuggestionItem,
  type IDryRunCompanyExamRiskAiSuggestionsResponse,
} from '@v2/services/medicine/company-exam-risk-ai-suggestions/company-exam-risk-ai-suggestions.types';
import {
  isCompanyExamRiskAiSuggestionAutoSelected,
  isCompanyExamRiskAiSuggestionSelectable,
  requiresPhysicianOverrideConfirmation,
} from '@v2/services/medicine/company-exam-risk-ai-suggestions/company-exam-risk-ai-suggestion-selectable.util';
import type { IResolvedExamRiskConfig } from '@v2/services/medicine/company-exam-risk-suggestions/company-exam-risk-suggestions.types';
import { PcmsoLinkStatusEnum } from '@v2/services/medicine/company-exam-risk-link-status/company-exam-risk-link-status.types';
import { pcmsoLinkStatusLabels } from '@v2/services/medicine/company-exam-risk-link-status/pcmso-link-status-display.util';

import { getExamAge, getExamPeriodic } from './exam-risk-display.util';

type Step = 'setup' | 'select' | 'preview' | 'result';

type Props = {
  open: boolean;
  onClose: () => void;
  companyId: string;
  workspaceId?: string;
  riskId: string;
  riskName: string;
  riskType?: string;
  riskSubTypes?: { id: number; name: string }[];
  riskCas?: string | null;
  riskEsocialCode?: string | null;
  /** SUGGEST = novos vínculos; REVIEW = auditar ExamToRisk atual × Biblioteca. */
  mode?: 'SUGGEST' | 'REVIEW';
  /** When true, starts dry-run automatically (useful for REVIEW from table row). */
  autoStart?: boolean;
  onApplied: () => void;
};

const getConfigSourceLabel = (source: IResolvedExamRiskConfig['configSource']) => {
  if (source.ruleExamRowId) return 'Regra da biblioteca';
  if (source.usedCompanyDefaults) return 'Padrões PCMSO da empresa';
  if (source.usedCreationDefaults) return 'Padrões de criação';
  return '-';
};

const formatSex = (config: IResolvedExamRiskConfig) => {
  const parts: string[] = [];
  if (config.isMale) parts.push('M');
  if (config.isFemale) parts.push('F');
  return parts.length ? parts.join(' / ') : '-';
};

const formatAgeRange = (config: IResolvedExamRiskConfig) =>
  getExamAge({
    fromAge: config.fromAge ?? undefined,
    toAge: config.toAge ?? undefined,
  });

const formatPeriodicity = (config: IResolvedExamRiskConfig) =>
  getExamPeriodic({
    isAdmission: config.isAdmission,
    isPeriodic: config.isPeriodic,
    isChange: config.isChange,
    isReturn: config.isReturn,
    isDismissal: config.isDismissal,
  }).text || '-';

const formatConfidence = (confidence: number) =>
  `${Math.round(confidence * 100)}%`;

const getApplyItemStatusLabel = (
  status: CompanyExamRiskAiApplyItemStatusEnum,
  dryRun: boolean,
) => {
  switch (status) {
    case CompanyExamRiskAiApplyItemStatusEnum.CREATED:
      return dryRun ? 'Pronto para criar' : 'Criado';
    case CompanyExamRiskAiApplyItemStatusEnum.WOULD_CREATE:
      return 'Pronto para criar';
    case CompanyExamRiskAiApplyItemStatusEnum.SKIPPED_ALREADY_LINKED:
      return 'Já adotado';
    case CompanyExamRiskAiApplyItemStatusEnum.SKIPPED_DUPLICATE_REQUEST:
      return 'Duplicado na solicitação';
    case CompanyExamRiskAiApplyItemStatusEnum.SKIPPED_NOT_CHARACTERIZED:
      return pcmsoLinkStatusLabels[PcmsoLinkStatusEnum.RISK_NOT_CHARACTERIZED];
    case CompanyExamRiskAiApplyItemStatusEnum.SKIPPED_NO_LIBRARY_REFERENCE:
      return 'Sem referência na Biblioteca para este item';
    case CompanyExamRiskAiApplyItemStatusEnum.SKIPPED_NOT_ELIGIBLE:
      return 'Não elegível';
    case CompanyExamRiskAiApplyItemStatusEnum.SKIPPED_LOW_RELEVANCE:
      return 'Baixa relevância';
    case CompanyExamRiskAiApplyItemStatusEnum.ERROR:
      return 'Erro';
    default:
      return status;
  }
};

const getApplyMechanismLabel = (mechanism?: string) => {
  switch (mechanism) {
    case CompanyExamRiskAiApplyMechanismEnum.ADOPT_OFFICIAL_LIBRARY:
      return 'Adotar Biblioteca Oficial';
    case CompanyExamRiskAiApplyMechanismEnum.CREATE_COMPANY_LINK:
      return 'Criar vínculo da empresa';
    case CompanyExamRiskAiApplyMechanismEnum.ALREADY_ADOPTED:
      return 'Já adotado';
    case CompanyExamRiskAiApplyMechanismEnum.BLOCKED_STRUCTURAL:
      return 'Bloqueado';
    default:
      return mechanism || '—';
  }
};

const buildApplyPreviewSummaryMessage = (
  data: IApplyCompanyExamRiskAiSuggestionsResponse,
) => {
  const creatable =
    data.summary.creatable ??
    data.items.filter(
      (item) =>
        item.willCreate === true ||
        item.status === CompanyExamRiskAiApplyItemStatusEnum.WOULD_CREATE,
    ).length;
  const alreadyAdopted = data.items.filter(
    (item) =>
      item.status === CompanyExamRiskAiApplyItemStatusEnum.SKIPPED_ALREADY_LINKED,
  ).length;
  const otherSkipped = Math.max(0, data.summary.skipped - alreadyAdopted);

  if (creatable <= 0) {
    return 'Nenhum vínculo poderá ser criado com a seleção atual. Revise os status dos itens.';
  }

  const parts = [
    `Serão criados ${creatable} vínculo${creatable === 1 ? '' : 's'} novo${
      creatable === 1 ? '' : 's'
    } nesta empresa.`,
  ];
  if (alreadyAdopted > 0) {
    parts.push(
      `${alreadyAdopted} item${alreadyAdopted === 1 ? '' : 's'} já adotado${
        alreadyAdopted === 1 ? '' : 's'
      } e será${alreadyAdopted === 1 ? '' : 'ão'} ignorado${
        alreadyAdopted === 1 ? '' : 's'
      }.`,
    );
  }
  if (otherSkipped > 0) {
    parts.push(
      `${otherSkipped} item${otherSkipped === 1 ? '' : 's'} ignorado${
        otherSkipped === 1 ? '' : 's'
      } por outros motivos.`,
    );
  }
  parts.push('Nenhuma regra global será alterada.');
  return parts.join(' ');
};

const buildApplyResultSeverity = (
  data: IApplyCompanyExamRiskAiSuggestionsResponse,
): 'success' | 'warning' | 'info' | 'error' => {
  if (data.summary.errors > 0) return 'error';
  if (data.summary.created > 0) return 'success';
  if (
    data.summary.skipped > 0 &&
    data.items.every(
      (item) =>
        item.status ===
        CompanyExamRiskAiApplyItemStatusEnum.SKIPPED_ALREADY_LINKED,
    )
  ) {
    return 'info';
  }
  return 'warning';
};

const buildDefaultSelectedKeys = (suggestions: ICompanyExamRiskAiSuggestionItem[]) =>
  suggestions
    .filter(isCompanyExamRiskAiSuggestionAutoSelected)
    .map((item) => item.suggestionKey);

const getAnalysisStatusLabel = (status: string) =>
  getExamRiskAiAnalysisStatusLabel(status);

const getAnalysisStatusColor = (status: string) =>
  EXAM_RISK_AI_ANALYSIS_STATUS_COLORS[
    status as keyof typeof EXAM_RISK_AI_ANALYSIS_STATUS_COLORS
  ] ?? 'default';

const getCandidateCompatibilityLabel = (value: string) =>
  EXAM_RISK_AI_CANDIDATE_COMPATIBILITY_LABELS[
    value as keyof typeof EXAM_RISK_AI_CANDIDATE_COMPATIBILITY_LABELS
  ] ?? value;

const getCandidateCompatibilityColor = (value: string) =>
  EXAM_RISK_AI_CANDIDATE_COMPATIBILITY_COLORS[
    value as keyof typeof EXAM_RISK_AI_CANDIDATE_COMPATIBILITY_COLORS
  ] ?? 'default';

const ApplyPreviewTable: FC<{
  items: IApplyCompanyExamRiskAiSuggestionItemResult[];
  dryRun: boolean;
  riskRef?: { type?: string; esocialCode?: string | null };
}> = ({ items, dryRun, riskRef }) => (
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>Exame</TableCell>
        <TableCell>Mecanismo</TableCell>
        <TableCell>Periodicidade</TableCell>
        <TableCell>Sexo</TableCell>
        <TableCell>Faixa etária</TableCell>
        <TableCell>Validade (meses)</TableCell>
        <TableCell>Considerar (dias)</TableCell>
        <TableCell>Qualitativo</TableCell>
        <TableCell>Quantitativo</TableCell>
        <TableCell>Config. PCMSO</TableCell>
        <TableCell>Status</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {items.map((item) => (
        <TableRow key={item.examId}>
          <TableCell>
            <Typography variant="body2">{item.examName}</Typography>
            {item.message && (
              <Typography variant="caption" color="text.secondary" display="block">
                {item.message}
              </Typography>
            )}
          </TableCell>
          <TableCell>{getApplyMechanismLabel(item.mechanism)}</TableCell>
          <TableCell>{formatPeriodicity(item.proposedConfig)}</TableCell>
          <TableCell>{formatSex(item.proposedConfig)}</TableCell>
          <TableCell>{formatAgeRange(item.proposedConfig)}</TableCell>
          <TableCell>{item.proposedConfig.validityInMonths ?? '-'}</TableCell>
          <TableCell>{item.proposedConfig.considerBetweenDays ?? '-'}</TableCell>
          <TableCell>
            {formatExamRiskQualitativeDegreeLabel(
              item.proposedConfig.minRiskDegree,
            )}
          </TableCell>
          <TableCell>
            {formatExamRiskQuantitativeDegreeLabel(
              item.proposedConfig.minRiskDegreeQuantity,
              riskRef,
            )}
          </TableCell>
          <TableCell>
            {getConfigSourceLabel(item.proposedConfig.configSource)}
          </TableCell>
          <TableCell>{getApplyItemStatusLabel(item.status, dryRun)}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const createDefaultExposureContext = (): ICompanyExamRiskAiExposureContext => ({
  activityDescription: '',
  materialsAgents: '',
  contactForm: '',
  frequencyDuration: '',
  exposureRoutes: '',
  controlMeasures: '',
  establishmentParticularities: '',
  analysisPurpose: '',
  physicianNotes: '',
  externalRequirements: '',
  sessionNotes: '',
});

const trimExposureContext = (
  context: ICompanyExamRiskAiExposureContext,
): ICompanyExamRiskAiExposureContext | undefined => {
  const next: ICompanyExamRiskAiExposureContext = {};
  (Object.keys(context) as (keyof ICompanyExamRiskAiExposureContext)[]).forEach(
    (key) => {
      const value = context[key]?.trim();
      if (value) next[key] = value;
    },
  );
  return Object.keys(next).length ? next : undefined;
};

const ANALYSIS_COLLAPSE_MS = 220;

const AnalysisAccordion: FC<{
  title: string;
  count?: number;
  defaultExpanded?: boolean;
  children: ReactNode;
}> = ({ title, count, defaultExpanded = false, children }) => (
  <Accordion
    defaultExpanded={defaultExpanded}
    disableGutters
    elevation={0}
    sx={{
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1,
      '&:before': { display: 'none' },
      bgcolor: 'background.paper',
    }}
  >
    <AccordionSummary
      expandIcon={<ExpandMoreIcon />}
      sx={{ minHeight: 40, '& .MuiAccordionSummary-content': { my: 0.5 } }}
    >
      <Typography variant="subtitle2">
        {title}
        {typeof count === 'number' ? ` (${count})` : ''}
      </Typography>
    </AccordionSummary>
    <AccordionDetails sx={{ pt: 0, pb: 1.5 }}>{children}</AccordionDetails>
  </Accordion>
);

const ReviewBlockTable: FC<{
  items: ICompanyExamRiskAiReviewedExam[];
}> = ({ items }) =>
  items.length === 0 ? (
    <Typography variant="body2" color="text.secondary">
      Nenhum item neste bloco.
    </Typography>
  ) : (
    <TableContainer sx={{ maxHeight: 240 }}>
      <Table stickyHeader size="small">
        <TableHead>
          <TableRow>
            <TableCell>Exame</TableCell>
            <TableCell>Origem</TableCell>
            <TableCell>Situação</TableCell>
            <TableCell>Parecer IA</TableCell>
            <TableCell>Finalidade</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Confiança</TableCell>
            <TableCell>Justificativa</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {items.map((item) => (
            <TableRow key={`${item.origin}-${item.examId}`}>
              <TableCell>
                <Typography variant="body2">{item.examName}</Typography>
                <Typography variant="caption" color="text.secondary">
                  #{item.examId}
                  {item.examType ? ` · ${item.examType}` : ''}
                </Typography>
              </TableCell>
              <TableCell>{item.originLabel}</TableCell>
              <TableCell>
                {getExamRiskAiAdoptionStatusLabel(item.adoptionStatus)}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={getExamRiskAiVerdictLabel(item.verdict)}
                />
                {item.selectionBlockReason && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    {item.selectionBlockReason}
                  </Typography>
                )}
              </TableCell>
              <TableCell>
                {getExamRiskAiPurposeLabel(item.purpose)}
              </TableCell>
              <TableCell>
                <Chip
                  size="small"
                  label={getExamRiskAiRecommendedDecisionStatusLabel(
                    item.recommendedDecisionStatus,
                  )}
                  variant="outlined"
                />
                <Typography variant="caption" display="block">
                  {getExamRiskAiAnalysisStatusLabel(item.analysisStatus)}
                </Typography>
              </TableCell>
              <TableCell>{formatConfidence(item.confidence)}</TableCell>
              <TableCell>
                <Typography variant="body2">{item.rationale || '—'}</Typography>
                {item.conditions && (
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    display="block"
                  >
                    Condição: {item.conditions}
                  </Typography>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );

const formatAnalysisSummaryCounts = (
  data: IDryRunCompanyExamRiskAiSuggestionsResponse,
) => {
  const blocks = data.reviewBlocks;
  const official =
    data.totals.officialEvaluated ?? blocks?.officialLibrary.length ?? 0;
  const company =
    data.totals.companyEvaluated ?? blocks?.companyAdopted.length ?? 0;
  const clinical = blocks?.clinicalBaseline?.length ?? 0;
  const additional =
    data.totals.additionalSuggested ??
    blocks?.additionalSuggestions.length ??
    0;
  return { official, company, clinical, additional };
};

const SuggestionResultRow: FC<{
  item: ICompanyExamRiskAiSuggestionItem;
  selected: boolean;
  alreadyAccumulated: boolean;
  onToggle: (item: ICompanyExamRiskAiSuggestionItem) => void;
}> = ({ item, selected, alreadyAccumulated, onToggle }) => {
  const canSelect = isCompanyExamRiskAiSuggestionSelectable(item);
  const autoSelected = isCompanyExamRiskAiSuggestionAutoSelected(item);
  const decisionLabel = item.analysisVerdict
    ? getExamRiskAiVerdictLabel(item.analysisVerdict)
    : EXAM_RISK_AI_DECISION_LABELS[
        item.decision as keyof typeof EXAM_RISK_AI_DECISION_LABELS
      ] ?? item.decision;
  const decisionColor =
    item.analysisVerdict === 'ADD'
      ? 'success'
      : item.analysisVerdict === 'ADD_CONDITIONALLY' ||
          item.analysisVerdict === 'KEEP_CONDITIONALLY' ||
          item.analysisVerdict === 'INSUFFICIENT_CONTEXT'
        ? 'warning'
        : EXAM_RISK_AI_DECISION_COLORS[
            item.decision as keyof typeof EXAM_RISK_AI_DECISION_COLORS
          ] ?? 'default';

  return (
    <TableRow>
      <TableCell>
        <Checkbox
          checked={selected}
          disabled={!canSelect || alreadyAccumulated}
          onChange={() => onToggle(item)}
        />
        {alreadyAccumulated && (
          <Typography variant="caption" color="success.main" display="block">
            Já adicionado
          </Typography>
        )}
        {autoSelected && canSelect && !alreadyAccumulated && (
          <Typography variant="caption" color="success.main" display="block">
            Pré-selecionado (recomenda incluir)
          </Typography>
        )}
        {item.selectionBlockReason && canSelect && !autoSelected && !alreadyAccumulated && (
          <Typography variant="caption" color="text.secondary" display="block">
            {item.selectionBlockReason}
          </Typography>
        )}
        {item.selectionBlockReason && !canSelect && !alreadyAccumulated && (
          <Typography variant="caption" color="warning.main" display="block">
            {item.selectionBlockReason}
          </Typography>
        )}
      </TableCell>
      <TableCell>{item.examName}</TableCell>
      <TableCell>
        <Chip
          size="small"
          label={decisionLabel}
          color={decisionColor}
          variant={item.decision === 'exclude' ? 'outlined' : 'filled'}
        />
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          label={getAnalysisStatusLabel(item.analysisStatus)}
          color={getAnalysisStatusColor(item.analysisStatus)}
          variant={
            item.analysisStatus === 'AI_ANALYZED' ? 'outlined' : 'filled'
          }
        />
      </TableCell>
      <TableCell>
        <Chip
          size="small"
          label={getCandidateCompatibilityLabel(item.candidateCompatibility)}
          color={getCandidateCompatibilityColor(item.candidateCompatibility)}
          variant={
            item.candidateCompatibility === 'clinical' ||
            item.candidateCompatibility === 'official'
              ? 'filled'
              : 'outlined'
          }
        />
      </TableCell>
      <TableCell>{formatConfidence(item.confidence)}</TableCell>
      <TableCell>
        <Typography variant="body2">{item.suggestedSource ?? '—'}</Typography>
        {item.sourceRationale && (
          <Typography variant="caption" color="text.secondary">
            {item.sourceRationale}
          </Typography>
        )}
      </TableCell>
      <TableCell>
        {item.existingCompanyLink ? (
          <Typography variant="body2">
            Vínculo #{item.existingCompanyLink.linkId} ·{' '}
            {item.existingCompanyLink.examName}
          </Typography>
        ) : item.existingGlobalRule ? (
          <Typography variant="body2">
            Biblioteca · {item.existingGlobalRule.scope} ·{' '}
            {item.existingGlobalRule.status}
          </Typography>
        ) : (
          '—'
        )}
      </TableCell>
      <TableCell>
        <Typography variant="body2">{item.rationale || '—'}</Typography>
        {item.exclusionReason && (
          <Typography variant="caption" color="text.secondary" display="block">
            {item.exclusionReason}
          </Typography>
        )}
        {item.cautions.map((caution) => (
          <Typography
            key={caution}
            variant="caption"
            color="warning.main"
            display="block"
          >
            {caution}
          </Typography>
        ))}
      </TableCell>
      <TableCell sx={{ maxWidth: 180 }}>
        <Typography variant="caption" display="block">
          {formatPeriodicity(item.proposedConfig)}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {getConfigSourceLabel(item.proposedConfig.configSource)}
        </Typography>
      </TableCell>
    </TableRow>
  );
};

export const CompanyExamRiskAiSuggestionsModal: FC<Props> = ({
  open,
  onClose,
  companyId,
  workspaceId,
  riskId,
  riskName,
  riskType,
  riskSubTypes,
  riskCas,
  riskEsocialCode,
  mode = 'SUGGEST',
  autoStart = false,
  onApplied,
}) => {
  const isReviewMode = mode === 'REVIEW';
  const dryRunMutation = useDryRunCompanyExamRiskAiSuggestions();
  const applyMutation = useApplyCompanyExamRiskAiSuggestions();
  const { isMasterAdmin } = usePermissionsAccess();

  const getAccumulationKey = (item: ICompanyExamRiskAiSuggestionItem) =>
    buildRiskExamAccumulationKey(riskId, item.examId);

  const accumulated = useExamRiskAiAccumulatedSuggestions(
    getAccumulationKey,
  );

  const [step, setStep] = useState<Step>('setup');
  const [formValues, setFormValues] = useState<ExamRiskAiAssistantFormValues>(
    createDefaultExamRiskAiAssistantFormValues(),
  );
  const [exposureContext, setExposureContext] =
    useState<ICompanyExamRiskAiExposureContext>(createDefaultExposureContext());
  const [presetName, setPresetName] = useState('');
  const [presetDescription, setPresetDescription] = useState('');
  const [includeExistingLinks, setIncludeExistingLinks] = useState(false);
  const [onlyWithoutCompanyLink, setOnlyWithoutCompanyLink] = useState(true);
  const [dryRunData, setDryRunData] =
    useState<IDryRunCompanyExamRiskAiSuggestionsResponse | null>(null);
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const [pendingOverrideItem, setPendingOverrideItem] =
    useState<ICompanyExamRiskAiSuggestionItem | null>(null);
  const [aiAnalysisExpanded, setAiAnalysisExpanded] = useState(true);
  const dialogContentRef = useRef<HTMLDivElement | null>(null);
  const decisionSectionRef = useRef<HTMLDivElement | null>(null);
  const userHasScrolledRef = useRef(false);
  const [previewData, setPreviewData] =
    useState<IApplyCompanyExamRiskAiSuggestionsResponse | null>(null);
  const [resultData, setResultData] =
    useState<IApplyCompanyExamRiskAiSuggestionsResponse | null>(null);
  const [resolvedRiskContext, setResolvedRiskContext] =
    useState<ExamRiskAiRiskContextDisplay>({ riskName });

  useEffect(() => {
    if (!open) return;

    setResolvedRiskContext({
      riskName,
      riskType,
      riskSubTypes,
      riskCas,
      riskEsocialCode,
    });
  }, [open, riskCas, riskEsocialCode, riskName, riskSubTypes, riskType]);

  const displayRiskContext = useMemo<ExamRiskAiRiskContextDisplay>(
    () => ({
      riskName: dryRunData?.riskName ?? resolvedRiskContext.riskName ?? riskName,
      riskType: resolvedRiskContext.riskType ?? riskType,
      riskTypeLabel: resolvedRiskContext.riskTypeLabel,
      riskSubTypes: resolvedRiskContext.riskSubTypes ?? riskSubTypes,
      riskCas: resolvedRiskContext.riskCas ?? riskCas,
      riskEsocialCode: resolvedRiskContext.riskEsocialCode ?? riskEsocialCode,
    }),
    [
      dryRunData?.riskName,
      resolvedRiskContext,
      riskCas,
      riskEsocialCode,
      riskName,
      riskSubTypes,
      riskType,
    ],
  );

  const autoSelectedSuggestions = useMemo(
    () =>
      dryRunData?.suggestions.filter(isCompanyExamRiskAiSuggestionAutoSelected) ??
      [],
    [dryRunData],
  );

  const selectableSuggestions = useMemo(
    () =>
      dryRunData?.suggestions.filter(isCompanyExamRiskAiSuggestionSelectable) ??
      [],
    [dryRunData],
  );

  const selectedSuggestions = useMemo(() => {
    if (!dryRunData) return [];
    const keySet = new Set(selectedKeys);
    return dryRunData.suggestions.filter((item) => keySet.has(item.suggestionKey));
  }, [dryRunData, selectedKeys]);

  const accumulatedRows = useMemo(
    () =>
      accumulated.items.map((item) => ({
        key: getAccumulationKey(item),
        examLabel: item.examName,
        decision: item.decision,
        confidence: item.confidence,
      })),
    [accumulated.items, riskId],
  );

  const promptDraftCurrentState = useMemo<ExamRiskAiPromptDraftCurrentState>(
    () => ({
      presetName,
      presetDescription,
      formValues,
    }),
    [presetName, presetDescription, formValues],
  );

  useEffect(() => {
    if (!open) return;
    setStep('setup');
    setFormValues(createDefaultExamRiskAiAssistantFormValues());
    setExposureContext(createDefaultExposureContext());
    setPresetName('');
    setPresetDescription('');
    setIncludeExistingLinks(isReviewMode);
    setOnlyWithoutCompanyLink(!isReviewMode);
    setDryRunData(null);
    setSelectedKeys([]);
    setPendingOverrideItem(null);
    setAiAnalysisExpanded(true);
    userHasScrolledRef.current = false;
    setPreviewData(null);
    setResultData(null);
    accumulated.clear();
    dryRunMutation.reset();
    applyMutation.reset();

    if (!autoStart || !isReviewMode) return;

    let cancelled = false;
    const run = async () => {
      const payload = buildExamRiskAiAssistantPayload(
        createDefaultExamRiskAiAssistantFormValues(),
      );
      try {
        const response = await dryRunMutation.mutateAsync({
          companyId,
          riskId,
          workspaceId,
          examFilters: payload.examFilters,
          options: {
            includeExistingLinks: true,
            onlyWithoutCompanyLink: false,
            mode: 'REVIEW',
          },
          exposureContext: trimExposureContext(createDefaultExposureContext()),
          aiConfig: payload.aiConfig,
        });
        if (cancelled) return;
        setDryRunData(response);
        setSelectedKeys(buildDefaultSelectedKeys(response.suggestions));
        setAiAnalysisExpanded(true);
        userHasScrolledRef.current = false;
        setStep('select');
      } catch {
        // error surface via dryRunMutation.isError
      }
    };
    void run();
    return () => {
      cancelled = true;
    };
    // intentionally omit mutation identity — restart only on open/risk/mode
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, riskId, isReviewMode, autoStart, companyId, workspaceId]);

  const updateFormField = <K extends keyof ExamRiskAiAssistantFormValues>(
    key: K,
    value: ExamRiskAiAssistantFormValues[K],
  ) => {
    setFormValues((current) => ({ ...current, [key]: value }));
  };

  const buildPresetConfig = () =>
    buildRiskToExamAiPresetConfig({
      formValues,
      includeExistingRules: includeExistingLinks,
      includeIndirectCoverage: false,
      onlyWithoutExamCoverage: onlyWithoutCompanyLink,
    });

  const handleApplyPreset = (
    preset: Parameters<typeof mapCompanyPresetToState>[0],
  ) => {
    const mapped = mapCompanyPresetToState(preset);
    setFormValues(mapped.formValues);
    setPresetName(preset.name);
    setPresetDescription(preset.description ?? '');
    setIncludeExistingLinks(mapped.includeExistingLinks);
    setOnlyWithoutCompanyLink(mapped.onlyWithoutCompanyLink);
    setDryRunData(null);
    setSelectedKeys([]);
    setPreviewData(null);
    setResultData(null);
    accumulated.clear();
    setStep('setup');
  };

  const handleApplyPromptDraft = (next: ExamRiskAiPromptDraftCurrentState) => {
    setPresetName(next.presetName);
    setPresetDescription(next.presetDescription);
    setFormValues(next.formValues);
  };

  const onAddSelectedToAccumulated = () => {
    if (!selectedSuggestions.length) return;
    accumulated.addItems(
      selectedSuggestions,
      isCompanyExamRiskAiSuggestionSelectable,
    );
    setSelectedKeys([]);
  };

  const updateExposureField = <K extends keyof ICompanyExamRiskAiExposureContext>(
    key: K,
    value: ICompanyExamRiskAiExposureContext[K],
  ) => {
    setExposureContext((current) => ({ ...current, [key]: value }));
  };

  const onGenerateSuggestions = async () => {
    const payload = buildExamRiskAiAssistantPayload(formValues);
    const response = await dryRunMutation.mutateAsync({
      companyId,
      riskId,
      workspaceId,
      examFilters: payload.examFilters,
      options: {
        includeExistingLinks: isReviewMode ? true : includeExistingLinks,
        onlyWithoutCompanyLink: isReviewMode ? false : onlyWithoutCompanyLink,
        mode: isReviewMode ? 'REVIEW' : 'SUGGEST',
      },
      exposureContext: trimExposureContext(exposureContext),
      aiConfig: payload.aiConfig,
    });
    setDryRunData(response);
    setSelectedKeys(buildDefaultSelectedKeys(response.suggestions));
    setPendingOverrideItem(null);
    setAiAnalysisExpanded(true);
    userHasScrolledRef.current = false;
    setStep('select');
  };

  const collapseAiAnalysis = useCallback(() => {
    setAiAnalysisExpanded(false);
  }, []);

  const toggleAiAnalysisExpanded = useCallback(() => {
    setAiAnalysisExpanded((current) => !current);
  }, []);

  useEffect(() => {
    if (step !== 'select' || !aiAnalysisExpanded) return;
    const root = dialogContentRef.current;
    if (!root) return;

    const onScroll = () => {
      if (root.scrollTop > 24) {
        userHasScrolledRef.current = true;
      }
      if (!userHasScrolledRef.current) return;
      const decisionEl = decisionSectionRef.current;
      if (!decisionEl) return;
      const rootRect = root.getBoundingClientRect();
      const decisionRect = decisionEl.getBoundingClientRect();
      // Decision area starts entering the upper half of the scroll viewport.
      if (decisionRect.top < rootRect.top + rootRect.height * 0.55) {
        collapseAiAnalysis();
      }
    };

    root.addEventListener('scroll', onScroll, { passive: true });
    return () => root.removeEventListener('scroll', onScroll);
  }, [step, aiAnalysisExpanded, collapseAiAnalysis, dryRunData]);

  const onToggleSuggestion = (item: ICompanyExamRiskAiSuggestionItem) => {
    const { suggestionKey } = item;
    if (selectedKeys.includes(suggestionKey)) {
      setSelectedKeys((current) =>
        current.filter((key) => key !== suggestionKey),
      );
      return;
    }
    if (requiresPhysicianOverrideConfirmation(item)) {
      setPendingOverrideItem(item);
      return;
    }
    setSelectedKeys((current) =>
      current.includes(suggestionKey) ? current : [...current, suggestionKey],
    );
  };

  const confirmPhysicianOverride = () => {
    if (!pendingOverrideItem) return;
    const key = pendingOverrideItem.suggestionKey;
    setSelectedKeys((current) =>
      current.includes(key) ? current : [...current, key],
    );
    setPendingOverrideItem(null);
  };

  const onToggleAllSelectable = (checked: boolean) => {
    // "Select all" only covers ADD auto-recommendations — overrides stay manual.
    setSelectedKeys(
      checked
        ? autoSelectedSuggestions
            .filter(
              (item) => !accumulated.isAccumulated(getAccumulationKey(item)),
            )
            .map((item) => item.suggestionKey)
        : [],
    );
  };

  const buildApplyItems = () =>
    accumulated.items.map((item) => ({
      examId: item.examId,
      rationale: item.rationale,
    }));

  const onPreviewApply = async () => {
    if (!accumulated.count) return;
    const response = await applyMutation.mutateAsync({
      companyId,
      riskId,
      workspaceId,
      dryRun: true,
      items: buildApplyItems(),
    });
    setPreviewData(response);
    setStep('preview');
  };

  const onConfirmApply = async () => {
    if (!previewData || !accumulated.count) return;
    const previewCreatable =
      previewData.summary.creatable ??
      previewData.items.filter((item) => item.willCreate === true).length;
    if (previewCreatable <= 0) return;

    const response = await applyMutation.mutateAsync({
      companyId,
      riskId,
      workspaceId,
      dryRun: false,
      items: buildApplyItems(),
    });
    setResultData(response);
    setStep('result');
    const allAlreadyAdopted =
      response.summary.created === 0 &&
      response.summary.errors === 0 &&
      response.summary.skipped > 0 &&
      response.items.every(
        (item) =>
          item.status ===
          CompanyExamRiskAiApplyItemStatusEnum.SKIPPED_ALREADY_LINKED,
      );
    if (response.summary.created > 0 || allAlreadyAdopted) {
      onApplied();
    }
  };

  const previewCreatableCount = previewData
    ? previewData.summary.creatable ??
      previewData.items.filter(
        (item) =>
          item.willCreate === true ||
          item.status === CompanyExamRiskAiApplyItemStatusEnum.WOULD_CREATE,
      ).length
    : 0;

  const isLoading = dryRunMutation.isLoading || applyMutation.isLoading;
  const allSelectableSelected =
    autoSelectedSuggestions.length > 0 &&
    autoSelectedSuggestions.every((item) =>
      selectedKeys.includes(item.suggestionKey),
    );

  const dialogTitle = {
    setup: isReviewMode
      ? 'Revisar exames (Biblioteca × empresa)'
      : 'Assistente IA risco → exames (empresa)',
    select: isReviewMode ? 'Revisão técnica da configuração' : 'Sugestões de exames',
    preview: 'Pré-visualização dos vínculos',
    result: 'Resultado da criação',
  }[step];

  const mutationErrorMessage = (() => {
    const error = dryRunMutation.error || applyMutation.error;
    if (!error || typeof error !== 'object') {
      return 'Não foi possível processar a solicitação. Tente novamente.';
    }
    const response = (error as { response?: { data?: { message?: string | string[] } } })
      .response;
    const message = response?.data?.message;
    if (Array.isArray(message) && message.length) return message.join(' ');
    if (typeof message === 'string' && message.trim()) return message;
    return 'Não foi possível processar a solicitação. Tente novamente.';
  })();

  const accumulatedPanel =
    accumulated.count > 0 ? (
      <ExamRiskAiAccumulatedSelectionPanel
        title="Selecionados para aplicar"
        rows={accumulatedRows}
        onRemove={accumulated.removeItem}
      />
    ) : null;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesomeIcon color="primary" fontSize="small" />
        {dialogTitle}
      </DialogTitle>

      <DialogContent
        dividers
        ref={dialogContentRef}
        sx={{
          maxHeight: 'calc(100vh - 160px)',
        }}
      >
        <Stack spacing={3}>
          <ExamRiskAiRiskContextHeader {...displayRiskContext} />

          {step === 'setup' && (
            <>
              <Alert severity="warning">
                {isReviewMode
                  ? 'Modo revisão: a IA compara o padrão oficial da Biblioteca com os vínculos ExamToRisk atuais. Nada será alterado automaticamente.'
                  : 'A IA apenas sugere exames. Nada será gravado no catálogo da empresa até você revisar tecnicamente, selecionar os itens e confirmar a criação.'}
              </Alert>
              {!isReviewMode && (
                <>
                  <Alert severity="info">
                    O dry-run não cria vínculos. A confirmação gera apenas vínculos
                    ExamToRisk nesta empresa e não altera a Biblioteca global.
                    Revise cada sugestão antes de aplicar.
                  </Alert>
                  <Alert severity="info">
                    Você pode rodar vários dry-runs, adicionar sugestões à lista
                    acumulada e aplicar todos os vínculos de uma vez ao final.
                  </Alert>
                </>
              )}

              {isMasterAdmin && (
                <ExamRiskAiAssistantPresetSection
                  open={open}
                  presetName={presetName}
                  presetDescription={presetDescription}
                  onPresetNameChange={setPresetName}
                  onPresetDescriptionChange={setPresetDescription}
                  buildPresetConfig={buildPresetConfig}
                  onApplyPreset={handleApplyPreset}
                  contextNote="O risco selecionado e o resultado anterior foram mantidos/limpos conforme o fluxo da empresa."
                />
              )}

              <ExamRiskAiPromptDraftSection
                companyId={companyId}
                riskId={riskId}
                workspaceId={workspaceId}
                isMasterAdmin={isMasterAdmin}
                currentState={promptDraftCurrentState}
                onApplyDraft={handleApplyPromptDraft}
                onRiskContextResolved={(draft) =>
                  setResolvedRiskContext({
                    riskName: draft.riskName,
                    riskType: draft.riskType,
                    riskTypeLabel: draft.riskTypeLabel,
                    riskSubTypes: draft.riskSubTypes,
                    riskCas: draft.riskCas,
                    riskEsocialCode: draft.riskEsocialCode,
                  })
                }
              />

              <ExamRiskAiAssistantConfigForm
                values={formValues}
                onFieldChange={updateFormField}
                optionSwitches={[
                  {
                    key: 'includeExistingLinks',
                    label: 'Mostrar vínculos existentes na empresa',
                    checked: includeExistingLinks,
                    onChange: setIncludeExistingLinks,
                  },
                  {
                    key: 'onlyWithoutCompanyLink',
                    label: 'Somente pares sem vínculo na empresa',
                    checked: onlyWithoutCompanyLink,
                    onChange: setOnlyWithoutCompanyLink,
                  },
                ]}
              />

              <Box>
                <Typography variant="subtitle2" sx={{ mb: 1 }}>
                  Contexto técnico da exposição nesta empresa
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                  Informe a atividade real nesta empresa. Esse contexto é enviado à
                  IA nesta sessão e não sobrescreve a caracterização do risco.
                </Typography>
                <Stack spacing={1.5}>
                  <TextField
                    label="Descrição da atividade real"
                    value={exposureContext.activityDescription ?? ''}
                    onChange={(event) =>
                      updateExposureField('activityDescription', event.target.value)
                    }
                    fullWidth
                    multiline
                    minRows={2}
                  />
                  <TextField
                    label="Materiais, agentes, alimentos ou resíduos"
                    value={exposureContext.materialsAgents ?? ''}
                    onChange={(event) =>
                      updateExposureField('materialsAgents', event.target.value)
                    }
                    fullWidth
                    multiline
                    minRows={2}
                  />
                  <TextField
                    label="Forma de contato / frequência"
                    value={exposureContext.contactForm ?? ''}
                    onChange={(event) =>
                      updateExposureField('contactForm', event.target.value)
                    }
                    fullWidth
                  />
                  <TextField
                    label="Particularidades do estabelecimento"
                    value={exposureContext.establishmentParticularities ?? ''}
                    onChange={(event) =>
                      updateExposureField(
                        'establishmentParticularities',
                        event.target.value,
                      )
                    }
                    fullWidth
                    multiline
                    minRows={2}
                  />
                  <TextField
                    label="Exigências externas conhecidas"
                    value={exposureContext.externalRequirements ?? ''}
                    onChange={(event) =>
                      updateExposureField(
                        'externalRequirements',
                        event.target.value,
                      )
                    }
                    fullWidth
                  />
                  <TextField
                    label="Observações do médico / sessão"
                    value={exposureContext.sessionNotes ?? ''}
                    onChange={(event) =>
                      updateExposureField('sessionNotes', event.target.value)
                    }
                    fullWidth
                    multiline
                    minRows={2}
                  />
                </Stack>
              </Box>

              {accumulatedPanel}
            </>
          )}

          {step === 'select' && dryRunData && (
            <Stack spacing={2}>
              {accumulatedPanel}

              {(() => {
                const summary = formatAnalysisSummaryCounts(dryRunData);
                const blocks = dryRunData.reviewBlocks;
                return (
                  <Box
                    sx={{
                      border: '1px solid',
                      borderColor: 'divider',
                      borderRadius: 1,
                      overflow: 'hidden',
                      bgcolor: 'background.paper',
                    }}
                  >
                    <Box
                      role="button"
                      tabIndex={0}
                      onClick={toggleAiAnalysisExpanded}
                      onKeyDown={(event) => {
                        if (event.key === 'Enter' || event.key === ' ') {
                          event.preventDefault();
                          toggleAiAnalysisExpanded();
                        }
                      }}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 1,
                        px: 1.5,
                        py: 1,
                        cursor: 'pointer',
                        userSelect: 'none',
                        bgcolor: 'action.hover',
                        '&:hover': { bgcolor: 'action.selected' },
                      }}
                    >
                      <ExpandMoreIcon
                        fontSize="small"
                        sx={{
                          transform: aiAnalysisExpanded
                            ? 'rotate(0deg)'
                            : 'rotate(-90deg)',
                          transition: `transform ${ANALYSIS_COLLAPSE_MS}ms ease`,
                        }}
                      />
                      <Typography variant="subtitle2" sx={{ flex: 1 }}>
                        {aiAnalysisExpanded
                          ? 'Análise técnica da IA'
                          : 'Mostrar análise técnica da IA'}
                      </Typography>
                    </Box>

                    <Collapse
                      in={!aiAnalysisExpanded}
                      timeout={ANALYSIS_COLLAPSE_MS}
                      unmountOnExit={false}
                    >
                      <Box
                        onClick={toggleAiAnalysisExpanded}
                        sx={{
                          px: 1.5,
                          py: 0.75,
                          cursor: 'pointer',
                          borderTop: '1px solid',
                          borderColor: 'divider',
                        }}
                      >
                        <Typography
                          variant="caption"
                          color="text.secondary"
                          component="div"
                          sx={{
                            display: 'flex',
                            flexWrap: 'wrap',
                            gap: { xs: 1, sm: 2 },
                            alignItems: 'center',
                            lineHeight: 1.4,
                          }}
                        >
                          <span>Dry-run concluído</span>
                          <span>Oficiais........{summary.official}</span>
                          <span>Empresa.........{summary.company}</span>
                          <span>Clínico Base....{summary.clinical}</span>
                          <span>Sugestões IA....{summary.additional}</span>
                          <span>
                            Clique para visualizar toda a análise técnica.
                          </span>
                        </Typography>
                      </Box>
                    </Collapse>

                    <Collapse
                      in={aiAnalysisExpanded}
                      timeout={ANALYSIS_COLLAPSE_MS}
                      unmountOnExit={false}
                    >
                      <Stack spacing={1.5} sx={{ p: 1.5, pt: 1 }}>
                        <Alert severity="info">
                          Dry-run concluído:{' '}
                          {dryRunData.totals.pairsAnalyzed} item(ns)
                          analisado(s). Oficiais:{' '}
                          {dryRunData.totals.officialEvaluated ?? 0}; empresa:{' '}
                          {dryRunData.totals.companyEvaluated ?? 0}; adicionais:{' '}
                          {dryRunData.totals.additionalSuggested ?? 0}; revisão
                          manual:{' '}
                          {dryRunData.totals.manualReviewRequired ??
                            dryRunData.totals.ambiguous}
                          .
                        </Alert>

                        {dryRunData.warnings.length > 0 && (
                          <Alert severity="warning">
                            {dryRunData.warnings.map((warning) => (
                              <Typography key={warning} variant="body2">
                                {warning}
                              </Typography>
                            ))}
                          </Alert>
                        )}

                        {(dryRunData.totals.manualReviewRequired ?? 0) > 0 && (
                          <Alert severity="error">
                            Alguns itens não receberam parecer interpretável da
                            IA (resposta parcial/omitida). Eles não são
                            selecionáveis como recomendação válida — execute a
                            análise novamente ou revise manualmente.
                          </Alert>
                        )}

                        {blocks && (
                          <Stack spacing={1}>
                            <AnalysisAccordion
                              title="Biblioteca Oficial"
                              count={blocks.officialLibrary.length}
                              defaultExpanded={blocks.officialLibrary.length > 0}
                            >
                              <ReviewBlockTable items={blocks.officialLibrary} />
                            </AnalysisAccordion>

                            {(blocks.biologicalIndicators?.length ?? 0) > 0 && (
                              <AnalysisAccordion
                                title="Indicadores biológicos (NR-7 / ACGIH)"
                                count={blocks.biologicalIndicators?.length ?? 0}
                                defaultExpanded
                              >
                                <ReviewBlockTable
                                  items={blocks.biologicalIndicators ?? []}
                                />
                              </AnalysisAccordion>
                            )}

                            <AnalysisAccordion
                              title="Exame Clínico Base"
                              count={blocks.clinicalBaseline?.length ?? 0}
                              defaultExpanded={
                                (blocks.clinicalBaseline?.length ?? 0) > 0
                              }
                            >
                              <ReviewBlockTable
                                items={blocks.clinicalBaseline ?? []}
                              />
                            </AnalysisAccordion>

                            <AnalysisAccordion
                              title="Configuração atual da empresa"
                              count={blocks.companyAdopted.length}
                              defaultExpanded={
                                blocks.companyAdopted.length > 0
                              }
                            >
                              <ReviewBlockTable items={blocks.companyAdopted} />
                            </AnalysisAccordion>

                            <AnalysisAccordion
                              title="Sugestões adicionais da IA"
                              count={blocks.additionalSuggestions.length}
                              defaultExpanded={
                                blocks.additionalSuggestions.length > 0
                              }
                            >
                              <ReviewBlockTable
                                items={blocks.additionalSuggestions}
                              />
                            </AnalysisAccordion>

                            <AnalysisAccordion
                              title="Questões pendentes"
                              count={blocks.pendingQuestions.length}
                              defaultExpanded={
                                blocks.pendingQuestions.length > 0
                              }
                            >
                              {blocks.pendingQuestions.length === 0 ? (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  Nenhuma questão pendente.
                                </Typography>
                              ) : (
                                <Stack spacing={0.5}>
                                  {blocks.pendingQuestions.map((question) => (
                                    <Typography key={question} variant="body2">
                                      • {question}
                                    </Typography>
                                  ))}
                                </Stack>
                              )}
                            </AnalysisAccordion>

                            {blocks.recommendedOccupationalProtocol && (
                              <AnalysisAccordion
                                title="Protocolo ocupacional recomendado"
                                defaultExpanded
                              >
                                <Typography variant="body2" sx={{ mb: 1 }}>
                                  {
                                    blocks.recommendedOccupationalProtocol
                                      .summaryJustification
                                  }
                                </Typography>
                                {blocks.recommendedOccupationalProtocol.items.map(
                                  (item) => (
                                    <Typography
                                      key={`${item.origin}-${item.examId}`}
                                      variant="body2"
                                    >
                                      • [
                                      {getExamRiskAiProtocolRoleLabel(
                                        item.protocolRole,
                                      )}
                                      ] {item.examName} — {item.originLabel}
                                      {item.conditions
                                        ? ` (${item.conditions})`
                                        : ''}
                                    </Typography>
                                  ),
                                )}
                                <Typography
                                  variant="caption"
                                  display="block"
                                  sx={{ mt: 1 }}
                                  color="text.secondary"
                                >
                                  {
                                    blocks.recommendedOccupationalProtocol
                                      .humanValidationNotice
                                  }
                                </Typography>
                              </AnalysisAccordion>
                            )}
                          </Stack>
                        )}
                      </Stack>
                    </Collapse>
                  </Box>
                );
              })()}

              <Box
                ref={decisionSectionRef}
                sx={{
                  position: 'sticky',
                  top: 0,
                  zIndex: 3,
                  bgcolor: 'background.paper',
                  borderBottom: '1px solid',
                  borderColor: 'divider',
                  boxShadow: '0 1px 0 rgba(0,0,0,0.04)',
                  pt: 0.5,
                  pb: 1,
                  mx: -0.5,
                  px: 0.5,
                }}
              >
                {selectableSuggestions.length === 0 ? (
                  <Alert severity="info" sx={{ mb: 1 }}>
                    Nenhum exame com análise interpretável para decisão nesta
                    rodada (falha estrutural / item ausente). Ajuste o contexto e
                    gere novamente se necessário.
                  </Alert>
                ) : (
                  <FormControlLabel
                    sx={{ ml: 0, mb: 0.25 }}
                    control={
                      <Checkbox
                        checked={allSelectableSelected}
                        indeterminate={
                          selectedKeys.length > 0 && !allSelectableSelected
                        }
                        onChange={(event) =>
                          onToggleAllSelectable(event.target.checked)
                        }
                      />
                    }
                    label="Selecionar recomendações de inclusão automática da IA"
                  />
                )}

                <Typography variant="subtitle2">
                  Seleção para criar vínculos (inclusão automática pré-marcada;
                  demais manuais)
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  A IA recomenda; a decisão final é do médico. Pareceres que não
                  sejam de inclusão automática exigem confirmação na inclusão
                  manual.
                </Typography>
              </Box>

              <TableContainer
                sx={{
                  maxHeight: 'min(70vh, 720px)',
                  minHeight: 360,
                }}
              >
                <Table stickyHeader size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Selecionar</TableCell>
                      <TableCell>Exame sugerido</TableCell>
                      <TableCell>Decisão</TableCell>
                      <TableCell>Status IA</TableCell>
                      <TableCell>Triagem pré-IA</TableCell>
                      <TableCell>Confiança</TableCell>
                      <TableCell>Fonte</TableCell>
                      <TableCell>Vínculo / biblioteca</TableCell>
                      <TableCell>Justificativa</TableCell>
                      <TableCell>Config. PCMSO</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {dryRunData.suggestions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={10}>
                          Nenhuma sugestão retornada para os filtros atuais.
                        </TableCell>
                      </TableRow>
                    ) : (
                      dryRunData.suggestions.map((item) => (
                        <SuggestionResultRow
                          key={item.suggestionKey}
                          item={item}
                          selected={selectedKeys.includes(item.suggestionKey)}
                          alreadyAccumulated={accumulated.isAccumulated(
                            getAccumulationKey(item),
                          )}
                          onToggle={onToggleSuggestion}
                        />
                      ))
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            </Stack>
          )}

          {step === 'preview' && previewData && (
            <Box>
              {accumulatedPanel}
              <Alert
                severity={previewCreatableCount > 0 ? 'info' : 'warning'}
                sx={{ mb: 2, mt: accumulated.count ? 2 : 0 }}
              >
                {buildApplyPreviewSummaryMessage(previewData)}
              </Alert>
              {previewData.warnings.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {previewData.warnings.join(' ')}
                </Alert>
              )}
              <ApplyPreviewTable
                items={previewData.items}
                dryRun
                riskRef={{
                  type: displayRiskContext.riskType,
                  esocialCode: displayRiskContext.riskEsocialCode,
                }}
              />
            </Box>
          )}

          {step === 'result' && resultData && (
            <Box>
              <Alert
                severity={buildApplyResultSeverity(resultData)}
                sx={{ mb: 2 }}
              >
                {resultData.summary.created > 0
                  ? `${resultData.summary.created} vínculo(s) criado(s), ${resultData.summary.skipped} ignorado(s), ${resultData.summary.errors} erro(s).`
                  : resultData.summary.errors > 0
                    ? `Nenhum vínculo criado. ${resultData.summary.errors} erro(s), ${resultData.summary.skipped} ignorado(s).`
                    : resultData.items.every(
                          (item) =>
                            item.status ===
                            CompanyExamRiskAiApplyItemStatusEnum.SKIPPED_ALREADY_LINKED,
                        )
                      ? `Nenhum vínculo novo: todos os ${resultData.summary.skipped} item(ns) já estavam adotados.`
                      : `Nenhum vínculo criado. ${resultData.summary.skipped} item(ns) ignorado(s).`}
              </Alert>
              {resultData.warnings.length > 0 && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                  {resultData.warnings.join(' ')}
                </Alert>
              )}
              <ApplyPreviewTable
                items={resultData.items}
                dryRun={false}
                riskRef={{
                  type: displayRiskContext.riskType,
                  esocialCode: displayRiskContext.riskEsocialCode,
                }}
              />
            </Box>
          )}

          {(dryRunMutation.isError || applyMutation.isError) && (
            <Alert severity="error">{mutationErrorMessage}</Alert>
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        {step === 'setup' && (
          <>
            <Button onClick={onClose}>Cancelar</Button>
            {!isReviewMode && accumulated.count > 0 && (
              <Button
                variant="outlined"
                disabled={isLoading}
                onClick={onPreviewApply}
              >
                Pré-visualizar vínculos ({accumulated.count})
              </Button>
            )}
            <Button
              variant="contained"
              disabled={isLoading}
              startIcon={
                isLoading ? (
                  <CircularProgress size={16} color="inherit" />
                ) : (
                  <AutoAwesomeIcon />
                )
              }
              onClick={onGenerateSuggestions}
            >
              {isLoading
                ? isReviewMode
                  ? 'Revisando...'
                  : 'Rodando dry-run...'
                : isReviewMode
                  ? 'Revisar configuração'
                  : 'Rodar dry-run'}
            </Button>
          </>
        )}

        {step === 'select' && (
          <>
            <Button onClick={() => setStep('setup')} disabled={isLoading}>
              Voltar
            </Button>
            <Button
              variant="outlined"
              disabled={isLoading}
              onClick={onGenerateSuggestions}
            >
              {isLoading ? 'Gerando...' : 'Gerar novamente'}
            </Button>
            <Button onClick={onClose} disabled={isLoading}>
              {isReviewMode ? 'Fechar' : 'Cancelar'}
            </Button>
            {!isReviewMode && (
              <>
                <Button
                  variant="outlined"
                  disabled={!selectedKeys.length || isLoading}
                  onClick={onAddSelectedToAccumulated}
                >
                  Adicionar selecionados à lista
                </Button>
                <Button
                  variant="contained"
                  disabled={!accumulated.count || isLoading}
                  onClick={onPreviewApply}
                >
                  Pré-visualizar vínculos ({accumulated.count})
                </Button>
              </>
            )}
          </>
        )}

        {step === 'preview' && !isReviewMode && (
          <>
            <Button onClick={() => setStep('select')} disabled={isLoading}>
              Voltar
            </Button>
            <Button onClick={onClose} disabled={isLoading}>
              Cancelar
            </Button>
            <Button
              variant="contained"
              disabled={
                isLoading || !previewData || previewCreatableCount <= 0
              }
              onClick={onConfirmApply}
            >
              Confirmar
            </Button>
          </>
        )}

        {step === 'result' && (
          <Button variant="contained" onClick={onClose}>
            Fechar
          </Button>
        )}
      </DialogActions>

      <Dialog
        open={Boolean(pendingOverrideItem)}
        onClose={() => setPendingOverrideItem(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Confirmar inclusão manual</DialogTitle>
        <DialogContent>
          {pendingOverrideItem &&
            (() => {
              const copy = buildPhysicianOverrideConfirmationCopy({
                examName: pendingOverrideItem.examName,
                analysisVerdict: pendingOverrideItem.analysisVerdict,
              });
              return (
                <>
                  <Typography variant="body2" sx={{ mb: 1 }}>
                    {copy.lead}
                  </Typography>
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{ mb: 1 }}
                  >
                    {copy.headline}
                  </Typography>
                  <Typography variant="body2">{copy.body}</Typography>
                </>
              );
            })()}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setPendingOverrideItem(null)}>Cancelar</Button>
          <Button variant="contained" onClick={confirmPhysicianOverride}>
            Incluir exame
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};
