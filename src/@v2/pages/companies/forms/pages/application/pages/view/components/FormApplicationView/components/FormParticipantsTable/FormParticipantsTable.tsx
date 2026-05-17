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
import { FormParticipantsTableFilter } from './components/FormParticipantsTableFilter/FormParticipantsTableFilter';
import { FormParticipantsFilterSummary } from './components/FormParticipantsFilterSummary';
import { FormParticipantsGroupedByEstablishment } from './components/FormParticipantsGroupedByEstablishment';
import { FormParticipantsGroupedByEstablishmentHierarchy } from './components/FormParticipantsGroupedByEstablishmentHierarchy';
import { FormParticipantsGroupedByEstablishmentSector } from './components/FormParticipantsGroupedByEstablishmentSector';
import { FormParticipantsGroupedByHierarchyType } from './components/FormParticipantsGroupedByHierarchyType';
import { FormParticipantsGroupedBySector } from './components/FormParticipantsGroupedBySector';
import {
  ESTABLISHMENT_HIERARCHY_GROUPING_CONFIGS,
  FLAT_HIERARCHY_GROUPING_CONFIGS,
  getEstablishmentHierarchyGroupingConfig,
  getFlatHierarchyGroupingConfig,
  getParticipantsViewModeSelectLabel,
  isGroupedViewMode,
  isParticipantsViewMode,
  type ParticipantsViewMode,
} from '@v2/models/form/helpers/form-participants-hierarchy-grouping.config';
import { FormParticipantsRecorteExportButton } from './components/FormParticipantsRecorteExportButton';
import { useFormParticipantsActions } from './hooks/useFormParticipantsActions';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';
import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { useMutateSendFormReminder } from '@v2/services/forms/form-participants';
import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';
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
  const showGroupedByEstablishment = participantWorkspacesCount > 1;
  const showEstablishmentViewModeOptions = showGroupedByEstablishment;

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

  const browseFilters = useMemo(
    () => ({
      search: queryParams.search,
      status: queryParams.status,
      hierarchyIds: queryParams.hierarchies?.map((h) => h.id),
    }),
    [queryParams.search, queryParams.status, queryParams.hierarchies],
  );

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
      status: (value) => ({
        leftLabel: 'Status',
        label: value,
        leftLabelBold: true,
        onDelete: () =>
          setQueryParams({
            page: 1,
            status: queryParams.status?.filter((status) => status !== value),
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
      status: [],
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

  const onCleanData = useCallback(() => {
    resetPersistedLimit();
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

  const REMINDER_LIMIT = 4;
  const reminderCount = formApplication?.reminderCount ?? 0;
  const isReminderLimitReached = reminderCount >= REMINDER_LIMIT;

  const sendReminderMutation = useMutateSendFormReminder();
  const { showConfirmation } = useConfirmationModal();
  const { showSnackBar } = useSystemSnackbar();

  const handleSendReminder = useCallback(async () => {
    if (!formApplication || !isAcceptingResponses || isReminderLimitReached) return;

    const confirmed = await showConfirmation({
      title: 'Enviar E-mail de Reforço',
      message: `O e-mail de reforço será enviado apenas para participantes que ainda não responderam ao formulário.\n\nParticipantes que já responderam não receberão.\n\nEste envio consome 1 das ${REMINDER_LIMIT - reminderCount} rodadas restantes (${reminderCount}/${REMINDER_LIMIT} utilizadas).`,
      confirmText: 'Enviar Reforço',
      cancelText: 'Cancelar',
      variant: 'info',
    });

    if (!confirmed) return;

    sendReminderMutation.mutateAsync(
      { companyId, applicationId },
      {
        onSuccess: (data) => {
          const parts: string[] = [];
          parts.push(`${data.emailsSent} e-mail(s) enviado(s)`);
          if (data.skippedAlreadyAnswered > 0) {
            parts.push(`${data.skippedAlreadyAnswered} já responderam`);
          }
          parts.push(`Reforços: ${data.reminderCount}/${data.reminderLimit}`);

          showSnackBar(parts.join(' · '), { type: 'success' });
        },
      },
    );
  }, [formApplication, isAcceptingResponses, isReminderLimitReached, reminderCount, companyId, applicationId, showConfirmation, sendReminderMutation, showSnackBar]);

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
  const isPartialGroupedFetch =
    isGroupedViewMode(viewMode) &&
    groupedParticipants != null &&
    (filterSummaryForUi.totalParticipants > FORM_PARTICIPANTS_GROUPED_FETCH_CAP ||
      groupedRowsCount < filterSummaryForUi.totalParticipants);

  const groupedTableProps = useMemo(
    () => ({
      rows: groupedRows,
      isLoading: groupedTableLoading,
      fetchCap: FORM_PARTICIPANTS_GROUPED_FETCH_CAP,
      isPartialFetch: isPartialGroupedFetch,
    }),
    [groupedRows, groupedTableLoading, isPartialGroupedFetch],
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

    switch (viewMode) {
      case 'grouped_establishment':
        return <FormParticipantsGroupedByEstablishment {...groupedTableProps} />;
      case 'grouped_establishment_sector':
        return (
          <FormParticipantsGroupedByEstablishmentSector {...groupedTableProps} />
        );
      case 'grouped':
        return <FormParticipantsGroupedBySector {...groupedTableProps} />;
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
      default:
        return null;
    }
  };

  return (
    <>
      <FormParticipantsFilterSummary
        summary={filterSummaryForUi}
        isLoading={isLoading}
      />
      <STableSearch
        search={queryParams.search}
        onSearch={(search) => onFilterData({ search })}
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
            text={`Enviar Reforço (${reminderCount}/${REMINDER_LIMIT})`}
            icon={<SIconEmail fontSize="16px" />}
            color="primary"
            loading={sendReminderMutation.isPending}
            disabled={!isAcceptingResponses || isReminderLimitReached}
            tooltip={
              isReminderLimitReached
                ? `Limite de ${REMINDER_LIMIT} rodadas de reforço atingido`
                : !isAcceptingResponses
                  ? 'Formulário não está aceitando respostas'
                  : `Enviar e-mail de reforço para quem ainda não respondeu (${reminderCount}/${REMINDER_LIMIT})`
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
            {flatHierarchySubSector.map((config) => (
              <MenuItem key={config.viewMode} value={config.viewMode}>
                {config.selectLabel}
              </MenuItem>
            ))}
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
