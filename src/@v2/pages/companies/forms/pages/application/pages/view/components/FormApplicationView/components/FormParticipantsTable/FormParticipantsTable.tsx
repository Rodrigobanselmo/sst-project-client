import { STableFilterChip } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { STableInfoSection } from '@v2/components/organisms/STable/addons/addons-table/STableInfoSection/STableInfoSection';
import { STableFilterButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { STableButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/STableButton';
import { useTableState } from '@v2/components/organisms/STable/hooks/useTableState';
import { FormParticipantsColumnsEnum } from '@v2/components/organisms/STable/implementation/SFormParticipantsTable/enums/form-participants-columns.enum';
import { SFormParticipantsTable } from '@v2/components/organisms/STable/implementation/SFormParticipantsTable/SFormParticipantsTable';
import { SIconEmail } from '@v2/assets/icons/SIconEmail/SIconEmail';

import { IFormParticipantsFilterProps } from '@v2/components/organisms/STable/implementation/SFormParticipantsTable/SFormParticipantsTable.types';
import { useOrderBy } from '@v2/hooks/useOrderBy';
import { persistKeys, usePersistedState } from '@v2/hooks/usePersistState';
import { useTablePageLimit } from '@v2/hooks/useTablePageLimit';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { orderByTranslation } from '@v2/models/.shared/translations/orden-by.translation';
import { orderByFormParticipantsTranslation } from '@v2/models/form/translations/orden-by-form-participants.translation';
import { hierarchyTypeTranslation } from '@v2/models/security/translations/hierarchy-type.translation';
import { useFetchBrowseAllFormParticipantsForGrouping } from '@v2/services/forms/form-participants/browse-form-participants/hooks/useFetchBrowseAllFormParticipantsForGrouping';
import { useFetchBrowseFormParticipants } from '@v2/services/forms/form-participants/browse-form-participants/hooks/useFetchBrowseFormParticipants';
import { FORM_PARTICIPANTS_GROUPED_FETCH_CAP } from '@v2/services/forms/form-participants/browse-form-participants/service/browse-all-filtered-form-participants';
import { FormParticipantsOrderByEnum } from '@v2/services/forms/form-participants/browse-form-participants/service/browse-form-participants.types';
import { coerceParticipantSearchQuery } from '@v2/models/form/helpers/coerce-participant-search-query';
import { normalizeParticipantSearchTerm } from '@v2/models/form/helpers/normalize-participant-search-term';
import { FormParticipantsTableFilter } from './components/FormParticipantsTableFilter/FormParticipantsTableFilter';
import { FormParticipantsFilterSummary } from './components/FormParticipantsFilterSummary';
import { FormParticipantsGroupedByEstablishment } from './components/FormParticipantsGroupedByEstablishment';
import { FormParticipantsGroupedByEstablishmentHierarchy } from './components/FormParticipantsGroupedByEstablishmentHierarchy';
import { FormParticipantsGroupedByEstablishmentSector } from './components/FormParticipantsGroupedByEstablishmentSector';
import { FormParticipantsGroupedByHierarchyType } from './components/FormParticipantsGroupedByHierarchyType';
import { FormParticipantsGroupedByHierarchyGroup } from './components/FormParticipantsGroupedByHierarchyGroup';
import { FormParticipantsGroupedBySector } from './components/FormParticipantsGroupedBySector';
import { FormParticipantsGroupedBySectorWithHierarchyGroup } from './components/FormParticipantsGroupedBySectorWithHierarchyGroup';
import { FormParticipantsGroupedByCombinedHierarchy } from './components/FormParticipantsGroupedByCombinedHierarchy';
import {
  COMBINED_HIERARCHY_GROUPING_CONFIGS_WITHOUT_ESTABLISHMENT,
  COMBINED_HIERARCHY_GROUPING_CONFIGS_WITH_ESTABLISHMENT,
  ESTABLISHMENT_HIERARCHY_GROUPING_CONFIGS,
  FLAT_HIERARCHY_GROUPING_CONFIGS,
  getCombinedHierarchyGroupingConfig,
  getEstablishmentHierarchyGroupingConfig,
  getFlatHierarchyGroupingConfig,
  getHierarchyGroupGroupingConfig,
  getParticipantsViewModeSelectLabel,
  HIERARCHY_GROUP_GROUPING_CONFIGS,
  isGroupedViewMode,
  isHierarchyGroupViewMode,
  isParticipantsViewMode,
  type ParticipantsViewMode,
} from '@v2/models/form/helpers/form-participants-hierarchy-grouping.config';
import { useFetchBrowseHierarchyGroups } from '@v2/services/forms/hierarchy-group/browse-hierarchy-groups/hooks/useFetchBrowseHierarchyGroups';
import { FormParticipantsRecorteExportButton } from './components/FormParticipantsRecorteExportButton';
import { useFormParticipantsActions } from './hooks/useFormParticipantsActions';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';
import {
  countFormApplicationParticipantCompanies,
  shouldShowEstablishmentParticipantViewModes,
} from '@v2/models/form/helpers/form-participants-view-mode-visibility';
import {
  FORM_REMINDER_LIMIT,
  useSendFormReminderFlow,
} from '@v2/services/forms/form-participants/send-form-reminder';
import {
  Alert,
  Box,
  FormControl,
  InputLabel,
  ListSubheader,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type MouseEvent,
  type ReactNode,
} from 'react';

const isDev = process.env.NODE_ENV !== 'production';

function ViewModeSelectCategory({
  children,
  withTopSpacing = false,
}: {
  children: ReactNode;
  withTopSpacing?: boolean;
}) {
  return (
    <ListSubheader
      disableSticky
      sx={{
        fontWeight: 700,
        fontSize: '1rem',
        lineHeight: 1.5,
        color: 'primary.dark',
        pointerEvents: 'none',
        py: 0.5,
        backgroundColor: 'transparent',
        ...(withTopSpacing ? { mt: 1.5, pt: 1 } : {}),
      }}
    >
      {children}
    </ListSubheader>
  );
}

export const FormParticipantsTable = ({
  companyId,
  applicationId,
  formApplication,
}: {
  companyId: string;
  applicationId: string;
  formApplication?: FormApplicationReadModel;
}) => {
  const [hiddenColumns, setHiddenColumns] = usePersistedState<
    Record<FormParticipantsColumnsEnum, boolean>
  >(persistKeys.COLUMNS_FORMS_PARTICIPANTS, {} as any);

  const { onFormParticipantClick, onSendFormEmail, sendFormEmailMutation } =
    useFormParticipantsActions({
      companyId,
      applicationId,
    });

  const { queryParams, setQueryParams } =
    useQueryParamsState<IFormParticipantsFilterProps>();

  const [searchInput, setSearchInput] = useState(() =>
    coerceParticipantSearchQuery(queryParams.search),
  );

  useEffect(() => {
    const fromUrl = coerceParticipantSearchQuery(queryParams.search);
    setSearchInput((current) => (current === fromUrl ? current : fromUrl));
  }, [queryParams.search]);

  const {
    pageLimit,
    pageSizeOptions,
    resetPersistedLimit,
    createPageSizeChangeHandler,
    defaultLimit,
  } = useTablePageLimit(
    queryParams.limit,
    persistKeys.LIMIT_FORMS_PARTICIPANTS,
  );

  const [viewMode, setViewMode] = useState<ParticipantsViewMode>('list');
  const [viewModeMenuOpen, setViewModeMenuOpen] = useState(false);

  const participantWorkspacesCount =
    formApplication?.participants?.workspaces?.length ?? 0;
  const participantCompaniesCount = countFormApplicationParticipantCompanies(
    formApplication?.participants?.companies,
  );
  const showEstablishmentViewModeOptions =
    shouldShowEstablishmentParticipantViewModes({
      scopeType: formApplication?.scopeType,
      participantWorkspacesCount,
      participantCompaniesCount,
    });
  const showGroupedByEstablishment = showEstablishmentViewModeOptions;

  const flatHierarchyBeforeSector = useMemo(
    () =>
      FLAT_HIERARCHY_GROUPING_CONFIGS.filter(
        (c) => c.viewMode !== 'grouped_sub_sector',
      ),
    [],
  );

  const flatHierarchySubSector = useMemo(
    () =>
      FLAT_HIERARCHY_GROUPING_CONFIGS.filter(
        (c) => c.viewMode === 'grouped_sub_sector',
      ),
    [],
  );

  const establishmentHierarchyBeforeSubSector = useMemo(
    () =>
      ESTABLISHMENT_HIERARCHY_GROUPING_CONFIGS.filter(
        (c) => c.viewMode !== 'grouped_establishment_sub_sector',
      ),
    [],
  );

  const establishmentHierarchySubSector = useMemo(
    () =>
      ESTABLISHMENT_HIERARCHY_GROUPING_CONFIGS.filter(
        (c) => c.viewMode === 'grouped_establishment_sub_sector',
      ),
    [],
  );

  const browseFilters = useMemo(() => {
    const hasResponded =
      queryParams.responseFilter === 'responded'
        ? true
        : queryParams.responseFilter === 'not_responded'
          ? false
          : undefined;

    const normalizedSearch = searchInput.trim()
      ? normalizeParticipantSearchTerm(searchInput.trim())
      : undefined;

    return {
      search: normalizedSearch,
      hierarchyIds: queryParams.hierarchies?.map((h) => h.id),
      workspaceIds:
        queryParams.workspaces && queryParams.workspaces.length > 0
          ? queryParams.workspaces.map((w) => w.id)
          : undefined,
      hasResponded,
    };
  }, [
    searchInput,
    queryParams.hierarchies,
    queryParams.workspaces,
    queryParams.responseFilter,
  ]);

  const { formParticipants, isLoading } = useFetchBrowseFormParticipants({
    companyId,
    applicationId,
    filters: browseFilters,
    orderBy: queryParams.orderBy || [
      {
        field: FormParticipantsOrderByEnum.HAS_RESPONDED,
        order: 'desc',
      },
      {
        field: FormParticipantsOrderByEnum.HIERARCHY,
        order: 'asc',
      },
      {
        field: FormParticipantsOrderByEnum.NAME,
        order: 'asc',
      },
    ],
    pagination: {
      page: queryParams.page || 1,
      limit: pageLimit,
    },
  });

  const { onOrderBy, orderChipList: orderChipsBase } = useOrderBy({
    orderByList: queryParams.orderBy,
    setOrderBy: (orderBy) => setQueryParams({ orderBy }),
    getLabel: ({ order }) => orderByTranslation[order],
    getLeftLabel: ({ field }) => orderByFormParticipantsTranslation[field],
  });

  const orderChipList = useMemo(
    () => (orderChipsBase ?? []).map((c) => ({ ...c, leftLabelBold: true })),
    [orderChipsBase],
  );

  const {
    onCleanData: resetFromTableState,
    onFilterData,
    paramsChipList: paramsChipListBase,
  } = useTableState({
    data: queryParams,
    setData: setQueryParams,
    chipMap: {
      search: null,
      responseFilter: (value) => ({
        leftLabel: 'Resposta',
        label: value === 'responded' ? 'Responderam' : 'Não responderam',
        leftLabelBold: true,
        onDelete: () =>
          setQueryParams({
            page: 1,
            responseFilter: null,
          }),
      }),
      workspaces: (value) => ({
        leftLabel: 'Estabelecimento',
        label: value.name,
        leftLabelBold: true,
        onDelete: () =>
          setQueryParams({
            page: 1,
            workspaces: queryParams.workspaces?.filter(
              (w) => w.id !== value.id,
            ),
          }),
      }),
      hierarchies: (value) => ({
        leftLabel: value.type
          ? `${hierarchyTypeTranslation[value.type]}`
          : 'Hierarquia',
        label: value.name,
        leftLabelBold: true,
        onDelete: () =>
          setQueryParams({
            page: 1,
            hierarchies: queryParams.hierarchies?.filter(
              (h) => h.id !== value.id,
            ),
          }),
      }),
    },
    cleanData: {
      search: '',
      responseFilter: null,
      workspaces: [],
      hierarchies: [],
      orderBy: [],
      page: 1,
      limit: defaultLimit,
    },
  });

  const paramsChipList = useMemo(
    () =>
      (paramsChipListBase ?? []).map((c) => ({ ...c, leftLabelBold: true })),
    [paramsChipListBase],
  );

  const handleParticipantSearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      setSearchInput(trimmed);
      onFilterData({
        search: trimmed ? trimmed : (null as unknown as string),
      });
    },
    [onFilterData],
  );

  const onCleanData = useCallback(() => {
    resetPersistedLimit();
    setSearchInput('');
    resetFromTableState();
  }, [resetPersistedLimit, resetFromTableState]);

  const onPageSizeChange = createPageSizeChangeHandler(onFilterData);

  const filterSummaryForUi = useMemo(
    () =>
      formParticipants?.filterSummary ?? {
        totalParticipants: 0,
        respondedCount: 0,
        notRespondedCount: 0,
        responseRatePercent: 0,
      },
    [formParticipants?.filterSummary],
  );

  const groupedOrderBy = useMemo(
    () => [
      {
        field: FormParticipantsOrderByEnum.HIERARCHY,
        order: 'asc' as const,
      },
      {
        field: FormParticipantsOrderByEnum.NAME,
        order: 'asc' as const,
      },
    ],
    [],
  );

  const { hierarchyGroups: hierarchyGroupsRaw } = useFetchBrowseHierarchyGroups({
    companyId,
    applicationId,
  });

  const hierarchyGroupsForGrouping = useMemo(
    () =>
      hierarchyGroupsRaw.map((g) => ({
        id: g.id,
        name: g.name,
        hierarchyIds: g.hierarchyIds,
      })),
    [hierarchyGroupsRaw],
  );

  const {
    formParticipants: groupedParticipants,
    isLoading: groupedLoading,
    isError: groupedLoadError,
  } = useFetchBrowseAllFormParticipantsForGrouping({
    companyId,
    applicationId,
    filters: browseFilters,
    orderBy: groupedOrderBy,
    enabled: isGroupedViewMode(viewMode),
  });

  const groupedRows = groupedParticipants?.results ?? [];
  const groupedTableLoading =
    groupedLoading && groupedParticipants == null;
  const showGroupedLoadError =
    groupedLoadError && !groupedLoading && groupedParticipants == null;

  // Check if form is accepting responses
  const isAcceptingResponses =
    formApplication?.status === FormApplicationStatusEnum.PROGRESS;

  const reminderCount = formApplication?.reminderCount ?? 0;
  const isReminderLimitReached = reminderCount >= FORM_REMINDER_LIMIT;

  const { sendReminder, isSending: isSendingReminder } = useSendFormReminderFlow();

  const handleSendReminder = useCallback(() => {
    if (!formApplication) return;

    void sendReminder({
      companyId,
      applicationId,
      reminderCount,
      isAcceptingResponses,
      isShareableLink: formApplication.isShareableLink,
    });
  }, [
    applicationId,
    companyId,
    formApplication,
    isAcceptingResponses,
    reminderCount,
    sendReminder,
  ]);

  const hierarchyFilterDescription = useMemo(() => {
    if (!queryParams.hierarchies?.length) return '';
    return queryParams.hierarchies
      .map((h) =>
        h.type ? `${hierarchyTypeTranslation[h.type]} ${h.name}` : h.name,
      )
      .join('; ');
  }, [queryParams.hierarchies]);

  const orderByForExport = useMemo(
    () =>
      (queryParams.orderBy || []).filter((o) => o.order && o.order !== 'none'),
    [queryParams.orderBy],
  );

  const selectViewMode = useCallback(
    (next: ParticipantsViewMode) => {
      if (isDev) {
        console.debug('[FormParticipantsTable] selectViewMode', {
          previous: viewMode,
          next,
          participantWorkspacesCount,
          showGroupedByEstablishment,
          showEstablishmentViewModeOptions,
          workspaces: formApplication?.participants?.workspaces,
        });
      }
      setViewMode(next);
      setViewModeMenuOpen(false);
    },
    [
      viewMode,
      participantWorkspacesCount,
      showGroupedByEstablishment,
      showEstablishmentViewModeOptions,
      formApplication?.participants?.workspaces,
    ],
  );

  const handleEstablishmentViewModeSelect = useCallback(
    (mode: ParticipantsViewMode) => (event: MouseEvent<HTMLLIElement>) => {
      event.preventDefault();
      event.stopPropagation();
      selectViewMode(mode);
      queueMicrotask(() => setViewModeMenuOpen(false));
    },
    [selectViewMode],
  );

  const onViewModeChange = (e: SelectChangeEvent<string>) => {
    const value = e.target.value;
    if (isDev) {
      console.debug('[FormParticipantsTable] onChange', {
        rawValue: value,
        accepted: isParticipantsViewMode(value),
        participantWorkspacesCount,
        showEstablishmentViewModeOptions,
      });
    }
    if (!isParticipantsViewMode(value)) {
      setViewModeMenuOpen(false);
      return;
    }
    selectViewMode(value);
  };

  const groupedRowsCount = groupedRows.length;
  const recorteTotalParticipants = filterSummaryForUi.totalParticipants;
  const isGroupedOverCap =
    isGroupedViewMode(viewMode) &&
    groupedParticipants != null &&
    recorteTotalParticipants > FORM_PARTICIPANTS_GROUPED_FETCH_CAP;
  const isGroupedIncompleteFetch =
    isGroupedViewMode(viewMode) &&
    groupedParticipants != null &&
    !isGroupedOverCap &&
    recorteTotalParticipants > 0 &&
    groupedRowsCount < recorteTotalParticipants;

  const groupedTableProps = useMemo(
    () => ({
      rows: groupedRows,
      isLoading: groupedTableLoading,
      fetchCap: FORM_PARTICIPANTS_GROUPED_FETCH_CAP,
      isPartialFetch: false,
    }),
    [groupedRows, groupedTableLoading],
  );

  const renderGroupedContent = () => {
    if (showGroupedLoadError) {
      return (
        <Alert severity="error" sx={{ mb: 2 }}>
          Não foi possível carregar todos os participantes para o agrupamento.
          Tente novamente ou use a lista detalhada.
        </Alert>
      );
    }

    return (
      <>
        {isGroupedOverCap ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            O recorte tem mais de {FORM_PARTICIPANTS_GROUPED_FETCH_CAP}{' '}
            participantes. O agrupamento usa apenas os primeiros{' '}
            {FORM_PARTICIPANTS_GROUPED_FETCH_CAP} registros carregados; os totais
            podem estar incompletos. O resumo do topo continua refletindo o recorte
            completo.
          </Alert>
        ) : null}
        {isGroupedIncompleteFetch ? (
          <Alert severity="warning" sx={{ mb: 2 }}>
            Foram carregados {groupedRowsCount} de {recorteTotalParticipants}{' '}
            participantes do recorte para o agrupamento. Atualize a página ou use a
            lista detalhada se os totais parecerem incompletos. O resumo do topo
            continua refletindo o recorte completo ({recorteTotalParticipants}{' '}
            participantes).
          </Alert>
        ) : null}
        {(() => {
          switch (viewMode) {
      case 'grouped_establishment':
        return <FormParticipantsGroupedByEstablishment {...groupedTableProps} />;
      case 'grouped_establishment_sector':
        return (
          <FormParticipantsGroupedByEstablishmentSector {...groupedTableProps} />
        );
      case 'grouped':
        return <FormParticipantsGroupedBySector {...groupedTableProps} />;
      case 'grouped_hierarchy_group':
      case 'grouped_sector_hierarchy_group': {
        const hierarchyGroupConfig = getHierarchyGroupGroupingConfig(viewMode);
        if (!hierarchyGroupConfig) return null;
        if (viewMode === 'grouped_hierarchy_group') {
          return (
            <FormParticipantsGroupedByHierarchyGroup
              {...groupedTableProps}
              hierarchyGroups={hierarchyGroupsForGrouping}
              config={hierarchyGroupConfig}
            />
          );
        }
        return (
          <FormParticipantsGroupedBySectorWithHierarchyGroup
            {...groupedTableProps}
            hierarchyGroups={hierarchyGroupsForGrouping}
            config={hierarchyGroupConfig}
          />
        );
      }
      case 'grouped_directory':
      case 'grouped_management':
      case 'grouped_sub_sector': {
        const config = getFlatHierarchyGroupingConfig(viewMode);
        if (!config) return null;
        return (
          <FormParticipantsGroupedByHierarchyType
            {...groupedTableProps}
            config={config}
          />
        );
      }
      case 'grouped_establishment_directory':
      case 'grouped_establishment_management':
      case 'grouped_establishment_sub_sector': {
        const config = getEstablishmentHierarchyGroupingConfig(viewMode);
        if (!config) return null;
        return (
          <FormParticipantsGroupedByEstablishmentHierarchy
            {...groupedTableProps}
            config={config}
          />
        );
      }
      default: {
        const combinedConfig = getCombinedHierarchyGroupingConfig(viewMode);
        if (!combinedConfig) return null;
        return (
          <FormParticipantsGroupedByCombinedHierarchy
            {...groupedTableProps}
            config={combinedConfig}
          />
        );
      }
          }
        })()}
      </>
    );
  };

  return (
    <>
      <FormParticipantsFilterSummary
        summary={filterSummaryForUi}
        isLoading={isLoading}
      />
      <STableSearch
        search={searchInput}
        onSearch={handleParticipantSearch}
        inputProps={{ placeholder: 'Nome, CPF, e-mail ou telefone...' }}
      >
        <STableSearchContent>
          <FormParticipantsRecorteExportButton
            companyId={companyId}
            applicationId={applicationId}
            formApplication={formApplication}
            filters={browseFilters}
            orderBy={orderByForExport}
            hierarchyLabels={hierarchyFilterDescription}
            viewMode={viewMode}
            hierarchyGroups={
              isHierarchyGroupViewMode(viewMode)
                ? hierarchyGroupsForGrouping
                : undefined
            }
          />
          <STableButton
            onClick={() => onSendFormEmail()}
            text="Enviar Todos os Emails"
            icon={<SIconEmail fontSize="16px" />}
            color="info"
            loading={sendFormEmailMutation.isPending}
            disabled={!isAcceptingResponses}
            tooltip={
              isAcceptingResponses
                ? 'Enviar email para todos os participantes'
                : 'Formulário não está aceitando respostas'
            }
          />
          <STableButton
            onClick={handleSendReminder}
            text={`Enviar Reforço (${reminderCount}/${FORM_REMINDER_LIMIT})`}
            icon={<SIconEmail fontSize="16px" />}
            color="primary"
            loading={isSendingReminder}
            disabled={
              !isAcceptingResponses ||
              formApplication.isShareableLink ||
              isReminderLimitReached
            }
            tooltip={
              isReminderLimitReached
                ? `Limite de ${FORM_REMINDER_LIMIT} rodadas de reforço atingido`
                : !isAcceptingResponses
                  ? 'Formulário não está aceitando respostas'
                  : formApplication.isShareableLink
                    ? 'Reforço por e-mail não se aplica a link único compartilhável'
                    : `Enviar e-mail de reforço para quem ainda não respondeu (${reminderCount}/${FORM_REMINDER_LIMIT})`
            }
          />
          {/* <STableAddButton onClick={onFormParticipantAdd} /> */}
          {/* <STableColumnsButton
            showLabel
            hiddenColumns={hiddenColumns}
            setHiddenColumns={setHiddenColumns}
            columns={participantsColumns}
          /> */}
          <STableFilterButton>
            <FormParticipantsTableFilter
              onFilterData={onFilterData}
              filters={queryParams}
              companyId={companyId}
              applicationId={applicationId}
              formApplication={formApplication}
            />
          </STableFilterButton>
        </STableSearchContent>
      </STableSearch>
      <STableInfoSection>
        <STableFilterChipList onClean={onCleanData}>
          {[...orderChipList, ...paramsChipList]?.map((chip, idx) => (
            <STableFilterChip
              key={`${chip.leftLabel ?? 'chip'}-${String(chip.label)}-${idx}`}
              leftLabel={chip.leftLabel}
              leftLabelBold={chip.leftLabelBold}
              label={chip.label}
              onDelete={chip.onDelete}
            />
          ))}
        </STableFilterChipList>
      </STableInfoSection>
      <Box sx={{ mb: 2, maxWidth: 420 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="form-participants-view-mode">
            Modo de visualização
          </InputLabel>
          <Select
            labelId="form-participants-view-mode"
            label="Modo de visualização"
            value={viewMode}
            open={viewModeMenuOpen}
            onOpen={() => setViewModeMenuOpen(true)}
            onClose={() => setViewModeMenuOpen(false)}
            onChange={onViewModeChange}
            renderValue={(mode) =>
              getParticipantsViewModeSelectLabel(mode as ParticipantsViewMode)
            }
            MenuProps={{
              autoFocus: false,
              disableAutoFocusItem: true,
            }}
          >
            <ViewModeSelectCategory>Visualizações básicas</ViewModeSelectCategory>
            <MenuItem value="list">Lista detalhada</MenuItem>
            <ViewModeSelectCategory withTopSpacing>
              Por nível hierárquico
            </ViewModeSelectCategory>
            {flatHierarchyBeforeSector.map((config) => (
              <MenuItem key={config.viewMode} value={config.viewMode}>
                {config.selectLabel}
              </MenuItem>
            ))}
            <MenuItem value="grouped">Agrupado por setor</MenuItem>
            <ViewModeSelectCategory withTopSpacing>
              Agrupamentos de setores
            </ViewModeSelectCategory>
            {HIERARCHY_GROUP_GROUPING_CONFIGS.map((config) => (
              <MenuItem key={config.viewMode} value={config.viewMode}>
                {config.selectLabel}
              </MenuItem>
            ))}
            {flatHierarchySubSector.map((config) => (
              <MenuItem key={config.viewMode} value={config.viewMode}>
                {config.selectLabel}
              </MenuItem>
            ))}
            <ViewModeSelectCategory withTopSpacing>
              Combinações hierárquicas
            </ViewModeSelectCategory>
            {COMBINED_HIERARCHY_GROUPING_CONFIGS_WITHOUT_ESTABLISHMENT.map(
              (config) => (
                <MenuItem key={config.viewMode} value={config.viewMode}>
                  {config.selectLabel}
                </MenuItem>
              ),
            )}
            {showEstablishmentViewModeOptions ? (
              <>
                <ViewModeSelectCategory withTopSpacing>
                  Por estabelecimento
                </ViewModeSelectCategory>
                <MenuItem
                  value="grouped_establishment"
                  onMouseDown={handleEstablishmentViewModeSelect(
                    'grouped_establishment',
                  )}
                >
                  Agrupado por estabelecimento
                </MenuItem>
                <ViewModeSelectCategory withTopSpacing>
                  Estabelecimento + nível hierárquico
                </ViewModeSelectCategory>
                {establishmentHierarchyBeforeSubSector.map((config) => (
                  <MenuItem
                    key={config.viewMode}
                    value={config.viewMode}
                    onMouseDown={handleEstablishmentViewModeSelect(config.viewMode)}
                  >
                    {config.selectLabel}
                  </MenuItem>
                ))}
                <MenuItem
                  value="grouped_establishment_sector"
                  onMouseDown={handleEstablishmentViewModeSelect(
                    'grouped_establishment_sector',
                  )}
                >
                  Agrupado por estabelecimento e setor
                </MenuItem>
                {establishmentHierarchySubSector.map((config) => (
                  <MenuItem
                    key={config.viewMode}
                    value={config.viewMode}
                    onMouseDown={handleEstablishmentViewModeSelect(config.viewMode)}
                  >
                    {config.selectLabel}
                  </MenuItem>
                ))}
                <ViewModeSelectCategory withTopSpacing>
                  Estabelecimento + combinações hierárquicas
                </ViewModeSelectCategory>
                {COMBINED_HIERARCHY_GROUPING_CONFIGS_WITH_ESTABLISHMENT.map(
                  (config) => (
                    <MenuItem
                      key={config.viewMode}
                      value={config.viewMode}
                      onMouseDown={handleEstablishmentViewModeSelect(
                        config.viewMode as ParticipantsViewMode,
                      )}
                    >
                      {config.selectLabel}
                    </MenuItem>
                  ),
                )}
              </>
            ) : null}
          </Select>
        </FormControl>
      </Box>
      {viewMode === 'list' ? (
        <SFormParticipantsTable
          filters={queryParams}
          setFilters={onFilterData}
          filterColumns={{}}
          setHiddenColumns={(hidden) =>
            setHiddenColumns({ ...hiddenColumns, ...hidden })
          }
          hiddenColumns={hiddenColumns}
          onSelectRow={(row) => onFormParticipantClick(row)}
          data={formParticipants?.results ?? []}
          isLoading={isLoading}
          pagination={formParticipants?.pagination}
          setPage={(page) => onFilterData({ page })}
          setOrderBy={onOrderBy}
          formApplication={formApplication}
          pageSizeOptions={pageSizeOptions}
          onPageSizeChange={onPageSizeChange}
        />
      ) : (
        renderGroupedContent()
      )}
    </>
  );
};
