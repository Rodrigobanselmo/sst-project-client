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
import { useFetchBrowseFormParticipants } from '@v2/services/forms/form-participants/browse-form-participants/hooks/useFetchBrowseFormParticipants';
import { FormParticipantsOrderByEnum } from '@v2/services/forms/form-participants/browse-form-participants/service/browse-form-participants.types';
import { FormParticipantsTableFilter } from './components/FormParticipantsTableFilter/FormParticipantsTableFilter';
import { FormParticipantsFilterSummary } from './components/FormParticipantsFilterSummary';
import { FormParticipantsGroupedByEstablishment } from './components/FormParticipantsGroupedByEstablishment';
import { FormParticipantsGroupedByEstablishmentSector } from './components/FormParticipantsGroupedByEstablishmentSector';
import { FormParticipantsGroupedBySector } from './components/FormParticipantsGroupedBySector';
import { FormParticipantsRecorteExportButton } from './components/FormParticipantsRecorteExportButton';
import { useFormParticipantsActions } from './hooks/useFormParticipantsActions';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';
import { useConfirmationModal } from '@v2/components/organisms/SModal/hooks/useConfirmationModal';
import { useMutateSendFormReminder } from '@v2/services/forms/form-participants';
import { useSystemSnackbar } from '@v2/hooks/useSystemSnackbar';
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  SelectChangeEvent,
} from '@mui/material';
import { useCallback, useEffect, useMemo, useState } from 'react';

const GROUP_FETCH_CAP = 10_000;

type ParticipantsViewMode =
  | 'list'
  | 'grouped'
  | 'grouped_establishment'
  | 'grouped_establishment_sector';

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

  const participantWorkspacesCount =
    formApplication?.participants.workspaces.length ?? 0;
  const showGroupedByEstablishment = participantWorkspacesCount > 1;

  useEffect(() => {
    if (
      (viewMode === 'grouped_establishment' ||
        viewMode === 'grouped_establishment_sector') &&
      !showGroupedByEstablishment
    ) {
      setViewMode('list');
    }
  }, [viewMode, showGroupedByEstablishment]);

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

  const groupedFetchLimit = Math.min(
    GROUP_FETCH_CAP,
    Math.max(filterSummaryForUi.totalParticipants, 1),
  );

  const { formParticipants: groupedParticipants, isLoading: groupedLoading } =
    useFetchBrowseFormParticipants({
      companyId,
      applicationId,
      filters: browseFilters,
      orderBy: [
        {
          field: FormParticipantsOrderByEnum.HIERARCHY,
          order: 'asc',
        },
        {
          field: FormParticipantsOrderByEnum.NAME,
          order: 'asc',
        },
      ],
      pagination: { page: 1, limit: groupedFetchLimit },
      enabled:
        viewMode === 'grouped' ||
        viewMode === 'grouped_establishment' ||
        viewMode === 'grouped_establishment_sector',
    });

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

  const onViewModeChange = (e: SelectChangeEvent<ParticipantsViewMode>) => {
    setViewMode(e.target.value as ParticipantsViewMode);
  };

  const isGroupedViewMode =
    viewMode === 'grouped' ||
    viewMode === 'grouped_establishment' ||
    viewMode === 'grouped_establishment_sector';

  const isPartialGroupedFetch =
    isGroupedViewMode &&
    filterSummaryForUi.totalParticipants > GROUP_FETCH_CAP;

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
            groupedFetchLimit={groupedFetchLimit}
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
      <Box sx={{ mb: 2, maxWidth: 360 }}>
        <FormControl fullWidth size="small">
          <InputLabel id="form-participants-view-mode">
            Modo de visualização
          </InputLabel>
          <Select<ParticipantsViewMode>
            labelId="form-participants-view-mode"
            label="Modo de visualização"
            value={viewMode}
            onChange={onViewModeChange}
          >
            <MenuItem value="list">Lista detalhada</MenuItem>
            <MenuItem value="grouped">Agrupado por setor</MenuItem>
            {showGroupedByEstablishment ? (
              <MenuItem value="grouped_establishment">
                Agrupado por estabelecimento
              </MenuItem>
            ) : null}
            {showGroupedByEstablishment ? (
              <MenuItem value="grouped_establishment_sector">
                Agrupado por estabelecimento e setor
              </MenuItem>
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
      ) : viewMode === 'grouped_establishment' ? (
        <FormParticipantsGroupedByEstablishment
          rows={groupedParticipants?.results ?? []}
          isLoading={groupedLoading}
          fetchCap={GROUP_FETCH_CAP}
          isPartialFetch={isPartialGroupedFetch}
        />
      ) : viewMode === 'grouped_establishment_sector' ? (
        <FormParticipantsGroupedByEstablishmentSector
          rows={groupedParticipants?.results ?? []}
          isLoading={groupedLoading}
          fetchCap={GROUP_FETCH_CAP}
          isPartialFetch={isPartialGroupedFetch}
        />
      ) : (
        <FormParticipantsGroupedBySector
          rows={groupedParticipants?.results ?? []}
          isLoading={groupedLoading}
          fetchCap={GROUP_FETCH_CAP}
          isPartialFetch={isPartialGroupedFetch}
        />
      )}
    </>
  );
};
