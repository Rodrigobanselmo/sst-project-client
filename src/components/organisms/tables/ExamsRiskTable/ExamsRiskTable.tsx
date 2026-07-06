import { cloneElement, FC, ReactElement, useMemo, useState } from 'react';

import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import PlaylistAddIcon from '@mui/icons-material/PlaylistAdd';
import UnfoldMoreIcon from '@mui/icons-material/UnfoldMore';
import { Alert, Box, BoxProps, FormControlLabel, Switch } from '@mui/material';
import SCheckBox from 'components/atoms/SCheckBox';
import STooltip from 'components/atoms/STooltip';
import {
  STable,
  STableBody,
  STableHeader,
  STableHRow,
  STableRow,
} from 'components/atoms/STable';
import IconButtonRow from 'components/atoms/STable/components/Rows/IconButtonRow';
import TextIconRow from 'components/atoms/STable/components/Rows/TextIconRow';
import STablePagination from 'components/atoms/STable/components/STablePagination';
import STableSearch from 'components/atoms/STable/components/STableSearch';
import STableTitle from 'components/atoms/STable/components/STableTitle';
import SText from 'components/atoms/SText';
import { CompanyFlowTableSection } from 'components/organisms/main/CompanyFlow/CompanyFlowTableSection';
import { initialExamRiskState } from 'components/organisms/modals/ModalEditExamRisk/hooks/useEditExams';
import { initialCompanySelectState } from 'components/organisms/modals/ModalSelectCompany';

import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import { persistKeys, usePersistedState } from '@v2/hooks/usePersistState';
import { useTablePageLimit } from '@v2/hooks/useTablePageLimit';

import EditIcon from 'assets/icons/SEditIcon';
import { SExamIcon } from 'assets/icons/SExamIcon';

import { matrixRiskMap } from 'core/constants/maps/matriz-risk.constant';
import { ModalEnum } from 'core/enums/modal.enums';
import { QueryEnum } from 'core/enums/query.enums';
import { useModal } from 'core/hooks/useModal';
import { usePreventAction } from 'core/hooks/usePreventAction';
import {
  TableCheckSelect,
  TableCheckSelectAll,
  useTableSelect,
} from 'core/hooks/useTableSelect';
import { useTableSearchAsync } from 'core/hooks/useTableSearchAsync';
import { useThrottle } from 'core/hooks/useThrottle';
import { ICompany } from 'core/interfaces/api/ICompany';
import { IExamToRisk } from 'core/interfaces/api/IExam';
import { IPcmsoExamDefaults } from 'core/interfaces/api/IPcmsoExamDefaults';
import { useMutBulkDeleteExamRisk } from 'core/services/hooks/mutations/checklist/exams/useMutBulkDeleteExamRisk/useMutBulkDeleteExamRisk';
import {
  IBulkExamRiskPatch,
  useMutBulkUpdateExamRisk,
} from 'core/services/hooks/mutations/checklist/exams/useMutBulkUpdateExamRisk/useMutBulkUpdateExamRisk';
import { useMutCopyExamRisk } from 'core/services/hooks/mutations/checklist/exams/useMutCopyExamRisk/useMutCopyExamRisk';
import { useMutUpdatePcmsoExamDefaults } from 'core/services/hooks/mutations/checklist/exams/useMutUpdatePcmsoExamDefaults/useMutUpdatePcmsoExamDefaults';
import { IQueryExam } from 'core/services/hooks/queries/useQueryExams/useQueryExams';
import { useQueryExamsRisk } from 'core/services/hooks/queries/useQueryExamsRisk/useQueryExamsRisk';
import { useQueryPcmsoExamDefaults } from 'core/services/hooks/queries/useQueryPcmsoExamDefaults/useQueryPcmsoExamDefaults';
import { queryClient } from 'core/services/queryClient';
import { getCompanyName } from 'core/utils/helpers/companyName';
import { mapPcmsoDefaultsToExamRisk } from 'core/utils/helpers/pcmsoExamDefaults';
import SFlex from 'components/atoms/SFlex';
import { SButton } from 'components/atoms/SButton';
import { ApplyExamRiskSuggestionsModal } from './ApplyExamRiskSuggestionsModal';
import { CompanyExamRiskAiSuggestionsModal } from './CompanyExamRiskAiSuggestionsModal';
import { UncoveredRisksAiSection } from './UncoveredRisksAiSection';
import { BulkEditExamRiskModal } from './BulkEditExamRiskModal';
import { PcmsoExamDefaultsModal } from './PcmsoExamDefaultsModal';
import { CharacterizationStatusChip } from './CharacterizationStatusChip';
import { LibraryStatusChip } from './LibraryStatusChip';
import { getExamAge, getExamPeriodic } from './exam-risk-display.util';
import { useFetchExamRiskLinkStatus } from '@v2/services/medicine/company-exam-risk-link-status/hooks/useFetchExamRiskLinkStatus';
import { refetchExamRiskLinkStatusQueries } from '@v2/services/medicine/company-exam-risk-link-status/hooks/refetch-exam-risk-link-status';
import type { IExamRiskLinkStatusItem } from '@v2/services/medicine/company-exam-risk-link-status/company-exam-risk-link-status.types';
import {
  buildExamRiskStatusBannerParts,
  canShowApplyRecommendedExams,
  hasExamRiskStatusBannerWarnings,
  isExamRiskLinkPending,
  resolveApplyRecommendedExams,
} from '@v2/services/medicine/company-exam-risk-link-status/pcmso-link-status-display.util';

const PERIODICITY_LEGEND =
  'A = Admissional · P = Periódico · M = Mudança · R = Retorno · D = Demissional';
const SEX_LEGEND = 'M = Masculino · F = Feminino';

const renderLegendCell = (text: string, tooltip?: string) => {
  const cell = <TextIconRow clickable text={text} />;

  if (!tooltip) return cell;

  return (
    <STooltip
      title={tooltip}
      minLength={0}
      withWrapper
      placement="top"
      boxProps={{ sx: { width: '100%', height: '100%' } }}
    >
      {cell}
    </STooltip>
  );
};

export { getExamAge, getExamPeriodic } from './exam-risk-display.util';

// Rótulo amigável do grau de risco (qualitativo/quantitativo). Vazio/null/0
// (não informado) → '-'. Níveis 1..5 usam o label do mapa da matriz.
const getRiskDegreeLabel = (value?: number | null) => {
  if (!value) return '-';
  return matrixRiskMap[value as keyof typeof matrixRiskMap]?.label || '-';
};

type ApplySuggestionsContext = {
  riskId: string;
  riskName: string;
  missingExams: IExamRiskLinkStatusItem['missingRecommendedExams'];
};

type AiSuggestionsContext = {
  riskId: string;
  riskName: string;
};

type ExamRiskColumnKey =
  | 'RISK'
  | 'EXAM'
  | 'LIBRARY_STATUS'
  | 'PERIODICITY'
  | 'SEX'
  | 'AGE'
  | 'VALIDITY'
  | 'CONSIDER_DAYS'
  | 'MIN_QUALITATIVE'
  | 'MIN_QUANTITATIVE';

type SortField = 'risk' | 'exam' | 'validity';

type ColumnDef = {
  key: ExamRiskColumnKey;
  label: string;
  width: string;
  sortField?: SortField;
  justify?: string;
};

const COLUMN_DEFS: ColumnDef[] = [
  { key: 'RISK', label: 'Risco', width: 'minmax(250px, 5fr)', sortField: 'risk' },
  { key: 'EXAM', label: 'Exame', width: 'minmax(150px, 5fr)', sortField: 'exam' },
  { key: 'PERIODICITY', label: 'Periodicidade', width: '120px' },
  { key: 'SEX', label: 'Sexo', width: '55px' },
  { key: 'AGE', label: 'Faixa etária', width: '135px' },
  {
    key: 'VALIDITY',
    label: 'Periodicidade (meses)',
    width: '130px',
    sortField: 'validity',
    justify: 'center',
  },
  {
    key: 'CONSIDER_DAYS',
    label: 'Considerar (dias)',
    width: '120px',
    justify: 'center',
  },
  { key: 'MIN_QUALITATIVE', label: 'Qualitativo mínimo', width: '130px' },
  { key: 'MIN_QUANTITATIVE', label: 'Quantitativo mínimo', width: '130px' },
];

export const ExamsRiskTable: FC<
  { children?: any } & BoxProps & {
      rowsPerPage?: number;
      onSelectData?: (company: IExamToRisk) => void;
      selectedData?: IExamToRisk[];
      query?: IQueryExam;
      companyFlowSticky?: boolean;
      companyFlowBelowTabs?: boolean;
      enableBulkActions?: boolean;
      showPcmsoStatus?: boolean;
      workspaceId?: string;
    }
> = ({
  rowsPerPage,
  onSelectData,
  selectedData,
  query,
  companyFlowSticky = false,
  companyFlowBelowTabs = false,
  enableBulkActions = false,
  showPcmsoStatus = false,
  workspaceId,
}) => {
  const { handleSearchChange, search, page, setPage } = useTableSearchAsync();
  const [sort, setSort] = useState<{ field: SortField; order: 'asc' | 'desc' } | null>(
    null,
  );
  const [severitySort, setSeveritySort] = useState<'asc' | 'desc' | null>(null);
  const [showPendingOnly, setShowPendingOnly] = useState(false);
  const [hiddenColumns, setHiddenColumns] = usePersistedState<
    Record<string, boolean>
  >(persistKeys.COLUMNS_EXAM_RISK, {});
  const { pageLimit, pageSizeOptions, createPageSizeChangeHandler } =
    useTablePageLimit(undefined, persistKeys.LIMIT_EXAM_RISK);

  const isSelect = !!onSelectData;
  const effectiveLimit = rowsPerPage ?? pageLimit;

  const {
    orderBy: _ignoredOrderBy,
    orderByDirection: _ignoredOrderDir,
    ...restQuery
  } = (query ?? {}) as Record<string, unknown>;

  const {
    data: exams,
    isLoading: loadExams,
    isError,
    count,
    companyId,
    isFetching,
    isRefetching,
    refetch,
  } = useQueryExamsRisk(
    page,
    {
      search,
      workspaceId,
      ...restQuery,
      ...(sort ? { orderBy: sort.field, orderByDirection: sort.order } : {}),
    },
    effectiveLimit,
  );

  const linkIds = useMemo(
    () => (exams?.length ? exams.map((exam) => exam.id).join(',') : undefined),
    [exams],
  );

  const {
    data: pcmsoStatusData,
    isLoading: loadPcmsoStatus,
    isError: pcmsoStatusError,
  } = useFetchExamRiskLinkStatus(
    {
      companyId: companyId || '',
      workspaceId,
      linkIds,
      onlyPcmso: true,
      includeSummary: true,
    },
    showPcmsoStatus && Boolean(companyId),
  );

  const statusByLinkId = useMemo(() => {
    const map = new Map<number, IExamRiskLinkStatusItem>();
    pcmsoStatusData?.items.forEach((item) => map.set(item.linkId, item));
    return map;
  }, [pcmsoStatusData]);

  const statusByRiskExamKey = useMemo(() => {
    const map = new Map<string, IExamRiskLinkStatusItem>();
    pcmsoStatusData?.items.forEach((item) => {
      map.set(`${item.riskId}:${item.examId}`, item);
    });
    return map;
  }, [pcmsoStatusData]);

  const getStatusItemForRow = (row: IExamToRisk) =>
    statusByLinkId.get(row.id) ??
    statusByRiskExamKey.get(`${row.riskId}:${row.examId}`);

  const missingExamsByRiskId = useMemo(() => {
    const map = new Map<string, IExamRiskLinkStatusItem['missingRecommendedExams']>();

    pcmsoStatusData?.items.forEach((item) => {
      if (!item.missingRecommendedExams?.length) return;

      const current = map.get(item.riskId) ?? [];
      if (item.missingRecommendedExams.length >= current.length) {
        map.set(item.riskId, item.missingRecommendedExams);
      }
    });

    return map;
  }, [pcmsoStatusData]);

  const applyRecommendedExamsContext = useMemo(
    () => ({
      missingExamsByRiskId,
    }),
    [missingExamsByRiskId],
  );

  const columnDefs = useMemo(() => {
    if (!showPcmsoStatus) return COLUMN_DEFS;
    const examIndex = COLUMN_DEFS.findIndex((def) => def.key === 'EXAM');
    const next = [...COLUMN_DEFS];
    next.splice(examIndex + 1, 0, {
      key: 'LIBRARY_STATUS',
      label: 'Na Biblioteca?',
      width: '140px',
    });
    return next;
  }, [showPcmsoStatus]);

  const columnsConfig = useMemo(
    () => columnDefs.map(({ key, label }) => ({ value: key, label })),
    [columnDefs],
  );

  const displayExams = useMemo(() => {
    let rows = [...(exams ?? [])];

    if (showPcmsoStatus && showPendingOnly) {
      rows = rows.filter((row) =>
        isExamRiskLinkPending(getStatusItemForRow(row)),
      );
    }

    if (showPcmsoStatus && severitySort) {
      rows.sort((left, right) => {
        const leftOrder =
          getStatusItemForRow(left)?.severityOrder ?? Number.MAX_SAFE_INTEGER;
        const rightOrder =
          getStatusItemForRow(right)?.severityOrder ?? Number.MAX_SAFE_INTEGER;
        return severitySort === 'asc'
          ? leftOrder - rightOrder
          : rightOrder - leftOrder;
      });
    }

    return rows;
  }, [
    exams,
    showPcmsoStatus,
    showPendingOnly,
    severitySort,
    statusByLinkId,
    statusByRiskExamKey,
  ]);

  const { onStackOpenModal } = useModal();
  const copyExamMutation = useMutCopyExamRisk();
  const bulkUpdateMutation = useMutBulkUpdateExamRisk();
  const bulkDeleteMutation = useMutBulkDeleteExamRisk();
  const { preventWarn, preventDelete } = usePreventAction();

  const { data: pcmsoDefaults } = useQueryPcmsoExamDefaults(
    companyId,
    !isSelect,
  );
  const pcmsoDefaultsMutation = useMutUpdatePcmsoExamDefaults();
  const [pcmsoDefaultsOpen, setPcmsoDefaultsOpen] = useState(false);
  const [applySuggestionsOpen, setApplySuggestionsOpen] = useState(false);
  const [applySuggestionsContext, setApplySuggestionsContext] =
    useState<ApplySuggestionsContext | null>(null);
  const [aiSuggestionsOpen, setAiSuggestionsOpen] = useState(false);
  const [aiSuggestionsContext, setAiSuggestionsContext] =
    useState<AiSuggestionsContext | null>(null);

  const isBulkMode = enableBulkActions && !isSelect;
  const {
    selectedData: selectedIds,
    onToggleSelected,
    onToggleAll,
    onIsSelected,
    setSelectedData: setSelectedIds,
  } = useTableSelect();

  // Edição em lote só pode atuar sobre vínculos da própria empresa. Vínculos
  // herdados/contratante (companyId diferente) não são editáveis em lote —
  // a API os ignora, então impedimos a seleção para evitar alteração parcial
  // silenciosa. Caso a linha não traga companyId, tratamos como editável
  // (comportamento legado) para não bloquear a empresa atual.
  const isRowEditable = (row: IExamToRisk) =>
    !row.companyId || row.companyId === companyId;

  const editablePageIds = (exams ?? [])
    .filter((exam) => isRowEditable(exam))
    .map((exam) => exam.id);
  const isAllPageSelected =
    editablePageIds.length > 0 &&
    editablePageIds.every((id) => onIsSelected(id));
  const [bulkEditOpen, setBulkEditOpen] = useState(false);

  const onPageSizeChange = createPageSizeChangeHandler((patch) => {
    if (patch.page) setPage(patch.page);
  });

  const onToggleSort = (field: SortField) => {
    setSeveritySort(null);
    setSort((prev) => {
      if (prev?.field !== field) return { field, order: 'asc' };
      if (prev.order === 'asc') return { field, order: 'desc' };
      return null;
    });
    setPage(1);
  };

  const onToggleSeveritySort = () => {
    setSort(null);
    setSeveritySort((prev) => {
      if (!prev) return 'asc';
      if (prev === 'asc') return 'desc';
      return null;
    });
  };

  const isHidden = (key: ExamRiskColumnKey) =>
    key in hiddenColumns ? hiddenColumns[key] : false;

  const visibleDefs = columnDefs.filter((def) => !isHidden(def.key));

  const onImportExams = () => {
    onStackOpenModal(ModalEnum.COMPANY_SELECT, {
      title: 'Selecione a Empresa que deseja copiar os exames',
      onSelect: (companySelected: ICompany) => {
        preventWarn(
          <SText textAlign={'justify'}>
            Você tem certeza que deseja importar toda a relação de Exame e
            riscos da empresa <b>{getCompanyName(companySelected)}</b>
            <SText fontSize={13} mt={6} textAlign={'justify'}>
              Exames que já estão presentes na tabela atual serão ignorados na
              importação (Caso já possua um exame de &quot;Audiometria&quot;
              vinculado ao Ruído, ele não será considerado na importação caso a
              outra empresa possua)
            </SText>
          </SText>,
          () =>
            copyExamMutation.mutateAsync({
              companyId,
              fromCompanyId: companySelected.id,
            }),
          { confirmText: 'Importar', tag: 'add' },
        );
      },
    } as Partial<typeof initialCompanySelectState>);
  };

  const onAddExam = () => {
    // Novo vínculo abre pré-preenchido com os padrões de PCMSO da empresa.
    // Empresa sem configuração → patch vazio → mantém o comportamento atual.
    onStackOpenModal(ModalEnum.EXAM_RISK, {
      ...(mapPcmsoDefaultsToExamRisk(pcmsoDefaults) as object),
    } as typeof initialExamRiskState);
  };

  const onSavePcmsoDefaults = async (defaults: IPcmsoExamDefaults) => {
    await pcmsoDefaultsMutation.mutateAsync({ ...defaults, companyId });
    setPcmsoDefaultsOpen(false);
  };

  const onEditExam = (exam: IExamToRisk) => {
    onStackOpenModal(ModalEnum.EXAM_RISK, {
      ...(exam as any),
    } as typeof initialExamRiskState);
  };

  const onSelectRow = (exam: IExamToRisk) => {
    if (isSelect) {
      onSelectData(exam);
    } else onEditExam(exam);
  };

  const onRefetchThrottle = useThrottle(() => {
    refetch();
    queryClient.invalidateQueries([QueryEnum.EXAMS_RISK_DATA]);
    queryClient.invalidateQueries([QueryEnum.EXAMS_RISK]);
    void refetchExamRiskLinkStatusQueries();
  }, 1000);

  const onOpenApplySuggestions = (statusItem: IExamRiskLinkStatusItem) => {
    const missingExams = resolveApplyRecommendedExams(
      statusItem,
      applyRecommendedExamsContext,
    );

    if (!missingExams.length) return;

    setApplySuggestionsContext({
      riskId: statusItem.riskId,
      riskName: statusItem.risk.name,
      missingExams,
    });
    setApplySuggestionsOpen(true);
  };

  const onCloseApplySuggestions = () => {
    setApplySuggestionsOpen(false);
    setApplySuggestionsContext(null);
  };

  const onOpenAiSuggestions = (context: AiSuggestionsContext) => {
    setAiSuggestionsContext(context);
    setAiSuggestionsOpen(true);
  };

  const onCloseAiSuggestions = () => {
    setAiSuggestionsOpen(false);
    setAiSuggestionsContext(null);
  };

  const onClearSelection = () => setSelectedIds([]);

  const onConfirmBulkEdit = async (patch: IBulkExamRiskPatch) => {
    if (selectedIds.length === 0) return;
    await bulkUpdateMutation.mutateAsync({ ids: selectedIds, patch, companyId });
    setBulkEditOpen(false);
    onClearSelection();
    onRefetchThrottle();
  };

  const onBulkDelete = () => {
    if (selectedIds.length === 0) return;
    preventDelete(
      async () => {
        await bulkDeleteMutation.mutateAsync({ ids: selectedIds, companyId });
        onClearSelection();
        onRefetchThrottle();
      },
      `Você tem certeza que deseja remover ${selectedIds.length} vínculo(s) selecionado(s)? Esta ação não pode ser desfeita.`,
      { confirmText: 'Remover' },
    );
  };

  const tableColumns = `${isBulkMode ? '40px ' : selectedData ? '15px ' : ''}${visibleDefs
    .map((def) => def.width)
    .join(' ')} ${showPcmsoStatus ? '108px' : '80px'}`;

  const renderSortableHeader = (def: ColumnDef): ReactElement => {
    const active = sort?.field === def.sortField;
    return (
      <STableHRow
        justifyContent={def.justify as any}
        sx={{ cursor: 'pointer', userSelect: 'none' }}
        onClick={() => def.sortField && onToggleSort(def.sortField)}
      >
        {def.label}
        {!active && (
          <UnfoldMoreIcon sx={{ fontSize: 14, ml: 0.5, color: 'grey.400' }} />
        )}
        {active && sort?.order === 'asc' && (
          <ArrowUpwardIcon sx={{ fontSize: 14, ml: 0.5, color: 'primary.main' }} />
        )}
        {active && sort?.order === 'desc' && (
          <ArrowDownwardIcon
            sx={{ fontSize: 14, ml: 0.5, color: 'primary.main' }}
          />
        )}
      </STableHRow>
    );
  };

  const tableChrome = (
    <>
      {!isSelect && (
        <STableTitle
          subtitle={
            <>
              Aqui você pode relacionar exames a riscos especificos
              <SText fontSize={11}>
                (Exemplo: Todos os cargos que possuirem o risco de Ruído e o
                exame de Audiometria estiver vinculado, todos os empregados
                terão que realizar tal exame)
              </SText>
            </>
          }
          icon={SExamIcon}
        >
          Exames
        </STableTitle>
      )}
      <STableSearch
        onAddClick={onAddExam}
        onExportClick={onImportExams}
        onChange={(e) => handleSearchChange(e.target.value)}
        loadingReload={loadExams || isFetching || isRefetching}
        onReloadClick={onRefetchThrottle}
      >
        <Box ml={2}>
          <STableColumnsButton
            columns={columnsConfig}
            hiddenColumns={hiddenColumns}
            setHiddenColumns={setHiddenColumns}
          />
        </Box>
        {showPcmsoStatus && !isSelect && (
          <Box ml={2}>
            <FormControlLabel
              control={
                <Switch
                  size="small"
                  checked={showPendingOnly}
                  onChange={(event) => setShowPendingOnly(event.target.checked)}
                />
              }
              label={
                <SText fontSize={12} whiteSpace="nowrap">
                  Mostrar só pendências
                </SText>
              }
              sx={{ mr: 0 }}
            />
          </Box>
        )}
        {!isSelect && (
          <Box ml={2}>
            <SButton
              xsmall
              variant="outlined"
              onClick={() => setPcmsoDefaultsOpen(true)}
              sx={{ width: 'auto', whiteSpace: 'nowrap' }}
            >
              Padrões de PCMSO
            </SButton>
          </Box>
        )}
      </STableSearch>
      {showPcmsoStatus && !isSelect && pcmsoStatusData?.summary && (
        <Alert
          severity={
            hasExamRiskStatusBannerWarnings(pcmsoStatusData) ? 'warning' : 'info'
          }
          sx={{ mt: 2, mb: 1, py: 0.5 }}
        >
          <SText fontSize={12}>
            {buildExamRiskStatusBannerParts(pcmsoStatusData).join(' · ')}
          </SText>
        </Alert>
      )}
      {showPcmsoStatus && pcmsoStatusError && (
        <Alert severity="warning" sx={{ mt: 2, mb: 1, py: 0.5 }}>
          <SText fontSize={12}>
            Não foi possível carregar o status PCMSO desta página.
          </SText>
        </Alert>
      )}
      {isBulkMode && selectedIds.length > 0 && (
        <SFlex
          align="center"
          gap={8}
          mt={2}
          mb={1}
          sx={{
            backgroundColor: 'grey.100',
            borderRadius: 1,
            px: 6,
            py: 3,
            flexWrap: 'wrap',
          }}
        >
          <SText fontSize={14} fontWeight={600}>
            {selectedIds.length} selecionado(s)
          </SText>
          <SButton
            xsmall
            variant="contained"
            onClick={() => setBulkEditOpen(true)}
            sx={{ width: 'auto' }}
          >
            Editar em lote
          </SButton>
          <SButton
            xsmall
            variant="outlined"
            color="error"
            loading={bulkDeleteMutation.isLoading}
            onClick={onBulkDelete}
            sx={{ width: 'auto' }}
          >
            Remover selecionados
          </SButton>
          <SButton
            xsmall
            variant="text"
            onClick={onClearSelection}
            sx={{ width: 'auto' }}
          >
            Limpar seleção
          </SButton>
        </SFlex>
      )}
    </>
  );

  const tableHeader = (
    <STableHeader>
      {isBulkMode ? (
        <STableHRow>
          <TableCheckSelectAll
            isSelected={isAllPageSelected}
            onToggleAll={() => onToggleAll(editablePageIds)}
          />
        </STableHRow>
      ) : (
        selectedData && <STableHRow></STableHRow>
      )}
      {visibleDefs.map((def) =>
        def.key === 'LIBRARY_STATUS' ? (
          <STableHRow
            key={def.key}
            sx={{ cursor: 'pointer', userSelect: 'none' }}
            onClick={onToggleSeveritySort}
          >
            {def.label}
            {!severitySort && (
              <UnfoldMoreIcon sx={{ fontSize: 14, ml: 0.5, color: 'grey.400' }} />
            )}
            {severitySort === 'asc' && (
              <ArrowUpwardIcon sx={{ fontSize: 14, ml: 0.5, color: 'primary.main' }} />
            )}
            {severitySort === 'desc' && (
              <ArrowDownwardIcon
                sx={{ fontSize: 14, ml: 0.5, color: 'primary.main' }}
              />
            )}
          </STableHRow>
        ) : def.sortField ? (
          cloneElement(renderSortableHeader(def), { key: def.key })
        ) : (
          <STableHRow key={def.key} justifyContent={def.justify as any}>
            {def.label}
          </STableHRow>
        ),
      )}
      <STableHRow justifyContent="center">Ações</STableHRow>
    </STableHeader>
  );

  const renderCell = (def: ColumnDef, row: IExamToRisk): ReactElement | null => {
    switch (def.key) {
      case 'RISK': {
        if (!showPcmsoStatus) {
          return <TextIconRow clickable text={row.risk?.name || '-'} />;
        }

        const statusItem = getStatusItemForRow(row);

        return (
          <TextIconRow clickable sx={{ minWidth: 0, width: '100%' }}>
            <SFlex align="center" gap={1} sx={{ minWidth: 0, width: '100%' }}>
              <Box onClick={(event) => event.stopPropagation()}>
                <CharacterizationStatusChip
                  statusItem={statusItem}
                  loading={loadPcmsoStatus}
                />
              </Box>
              <SText
                fontSize={12}
                lineNumber={1}
                className="table-row-text"
                sx={{ minWidth: 0, flex: 1 }}
              >
                {row.risk?.name || '-'}
              </SText>
            </SFlex>
          </TextIconRow>
        );
      }
      case 'EXAM':
        return <TextIconRow clickable text={row.exam?.name || '-'} />;
      case 'LIBRARY_STATUS': {
        const statusItem = getStatusItemForRow(row);
        return (
          <Box onClick={(event) => event.stopPropagation()}>
            <LibraryStatusChip
              statusItem={statusItem}
              loading={loadPcmsoStatus}
              applyRecommendedExamsContext={applyRecommendedExamsContext}
            />
          </Box>
        );
      }
      case 'PERIODICITY':
        return renderLegendCell(
          getExamPeriodic(row).text || '-',
          PERIODICITY_LEGEND,
        );
      case 'SEX': {
        const sexText =
          (row.isMale ? 'M' : '') + (row.isFemale ? ' F' : '') || '-';
        return renderLegendCell(
          sexText,
          sexText === '-' ? undefined : SEX_LEGEND,
        );
      }
      case 'AGE': {
        const ageText = getExamAge(row) || '-';
        return renderLegendCell(
          ageText,
          ageText === 'todas' ? 'todas as faixas etárias' : undefined,
        );
      }
      case 'VALIDITY':
        return (
          <TextIconRow
            clickable
            justifyContent="center"
            text={
              row?.validityInMonths ? row?.validityInMonths + ' meses' : '-'
            }
          />
        );
      case 'CONSIDER_DAYS':
        return (
          <TextIconRow
            clickable
            justifyContent="center"
            text={row?.considerBetweenDays ? String(row.considerBetweenDays) : '-'}
          />
        );
      case 'MIN_QUALITATIVE':
        return (
          <TextIconRow clickable text={getRiskDegreeLabel(row?.minRiskDegree)} />
        );
      case 'MIN_QUANTITATIVE':
        return (
          <TextIconRow
            clickable
            text={getRiskDegreeLabel(row?.minRiskDegreeQuantity)}
          />
        );
      default:
        return null;
    }
  };

  const tableBody = (
    <STableBody<(typeof exams)[0]>
      rowsData={displayExams}
      hideLoadMore
      rowsInitialNumber={effectiveLimit}
      contentEmpty={
        isError
          ? 'Erro ao carregar os exames. Tente recarregar.'
          : showPendingOnly
            ? 'Nenhuma pendência PCMSO nesta página.'
            : 'Nenhum exame vinculado a risco encontrado.'
      }
      renderRow={(row) => {
        return (
          <STableRow onClick={() => onSelectRow(row)} clickable key={row.id}>
            {isBulkMode ? (
              <Box onClick={(e) => e.stopPropagation()}>
                {isRowEditable(row) ? (
                  <TableCheckSelect
                    isSelected={onIsSelected(row.id)}
                    onToggleSelected={() => onToggleSelected(row.id)}
                  />
                ) : (
                  <STooltip
                    title="Vínculo herdado; edição em lote indisponível"
                    placement="right"
                  >
                    {/* span garante tooltip mesmo com o checkbox desabilitado */}
                    <span>
                      <SCheckBox label="" checked={false} disabled />
                    </span>
                  </STooltip>
                )}
              </Box>
            ) : (
              selectedData && (
                <SCheckBox
                  label=""
                  checked={!!selectedData.find((exam) => exam.id === row.id)}
                />
              )
            )}
            {visibleDefs.map((def) => {
              const cell = renderCell(def, row);
              return cell ? cloneElement(cell, { key: def.key }) : null;
            })}
            <SFlex
              center
              gap={0.5}
              sx={{ justifyContent: 'center', width: '100%', minWidth: 72 }}
            >
              {showPcmsoStatus && (() => {
                const statusItem = getStatusItemForRow(row);
                const showPlaylistAdd = canShowApplyRecommendedExams(
                  statusItem,
                  applyRecommendedExamsContext,
                );

                if (!showPlaylistAdd || !statusItem) return null;

                return (
                  <IconButtonRow
                    icon={<PlaylistAddIcon />}
                    tooltipTitle="Adicionar exames recomendados"
                    sx={{ mx: 0 }}
                    onClick={(e) => {
                      e.stopPropagation();
                      onOpenApplySuggestions(statusItem);
                    }}
                  />
                );
              })()}
              <IconButtonRow
                icon={<EditIcon />}
                sx={{ mx: 0 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onEditExam(row);
                }}
              />
            </SFlex>
          </STableRow>
        );
      }}
    />
  );

  const tablePagination = (
    <STablePagination
      mt={2}
      registersPerPage={effectiveLimit}
      totalCountOfRegisters={loadExams ? undefined : count}
      currentPage={page}
      onPageChange={setPage}
      pageSizeOptions={pageSizeOptions}
      onRegistersPerPageChange={onPageSizeChange}
    />
  );

  const bulkEditModal = isBulkMode ? (
    <BulkEditExamRiskModal
      open={bulkEditOpen}
      count={selectedIds.length}
      isSaving={bulkUpdateMutation.isLoading}
      onClose={() => setBulkEditOpen(false)}
      onConfirm={onConfirmBulkEdit}
    />
  ) : null;

  const pcmsoDefaultsModal = !isSelect ? (
    <PcmsoExamDefaultsModal
      open={pcmsoDefaultsOpen}
      isSaving={pcmsoDefaultsMutation.isLoading}
      initialValue={pcmsoDefaults}
      onClose={() => setPcmsoDefaultsOpen(false)}
      onConfirm={onSavePcmsoDefaults}
    />
  ) : null;

  const applySuggestionsModal =
    showPcmsoStatus && applySuggestionsContext && companyId ? (
      <ApplyExamRiskSuggestionsModal
        open={applySuggestionsOpen}
        companyId={companyId}
        workspaceId={workspaceId}
        riskId={applySuggestionsContext.riskId}
        riskName={applySuggestionsContext.riskName}
        missingExams={applySuggestionsContext.missingExams}
        onClose={onCloseApplySuggestions}
        onSuccess={onRefetchThrottle}
      />
    ) : null;

  const aiSuggestionsModal =
    showPcmsoStatus && aiSuggestionsContext && companyId ? (
      <CompanyExamRiskAiSuggestionsModal
        open={aiSuggestionsOpen}
        companyId={companyId}
        workspaceId={workspaceId}
        riskId={aiSuggestionsContext.riskId}
        riskName={aiSuggestionsContext.riskName}
        onClose={onCloseAiSuggestions}
        onApplied={onRefetchThrottle}
      />
    ) : null;

  const uncoveredRisksSection =
    showPcmsoStatus ? (
      <UncoveredRisksAiSection
        risks={pcmsoStatusData?.uncoveredRisks ?? []}
        onSuggestExams={(risk) =>
          onOpenAiSuggestions({
            riskId: risk.riskId,
            riskName: risk.riskName,
          })
        }
      />
    ) : null;

  if (companyFlowSticky) {
    return (
      <>
        <CompanyFlowTableSection
          chrome={tableChrome}
          supplementary={uncoveredRisksSection}
          columns={tableColumns}
          loading={loadExams || copyExamMutation.isLoading}
          rowsNumber={effectiveLimit}
          header={tableHeader}
          footer={tablePagination}
          belowModuleTabs={companyFlowBelowTabs}
        >
          {tableBody}
        </CompanyFlowTableSection>
        {bulkEditModal}
        {pcmsoDefaultsModal}
        {applySuggestionsModal}
        {aiSuggestionsModal}
      </>
    );
  }

  return (
    <>
      {tableChrome}
      {uncoveredRisksSection}
      <STable
        columns={tableColumns}
        loading={loadExams || copyExamMutation.isLoading}
        rowsNumber={effectiveLimit}
      >
        {tableHeader}
        {tableBody}
      </STable>
      {tablePagination}
      {bulkEditModal}
      {pcmsoDefaultsModal}
      {applySuggestionsModal}
      {aiSuggestionsModal}
    </>
  );
};
