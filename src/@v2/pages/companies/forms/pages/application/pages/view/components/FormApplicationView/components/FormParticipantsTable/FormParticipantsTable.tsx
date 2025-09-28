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
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { orderByTranslation } from '@v2/models/.shared/translations/orden-by.translation';
import { orderByFormParticipantsTranslation } from '@v2/models/form/translations/orden-by-form-participants.translation';
import { useFetchBrowseFormParticipants } from '@v2/services/forms/form-participants/browse-form-participants/hooks/useFetchBrowseFormParticipants';
import { FormParticipantsOrderByEnum } from '@v2/services/forms/form-participants/browse-form-participants/service/browse-form-participants.types';
import { FormParticipantsTableFilter } from './components/FormParticipantsTableFilter/FormParticipantsTableFilter';
import { useFormParticipantsActions } from './hooks/useFormParticipantsActions';
import { FormApplicationReadModel } from '@v2/models/form/models/form-application/form-application-read.model';
import { FormApplicationStatusEnum } from '@v2/models/form/enums/form-status.enum';

const limit = 15;

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

  const { formParticipants, isLoading } = useFetchBrowseFormParticipants({
    companyId,
    applicationId,
    filters: {
      search: queryParams.search,
      status: queryParams.status,
      hierarchyIds: queryParams.hierarchies?.map((h) => h.id),
    },
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
      limit: queryParams.limit || limit,
    },
  });

  const { onOrderBy, orderChipList } = useOrderBy({
    orderByList: queryParams.orderBy,
    setOrderBy: (orderBy) => setQueryParams({ orderBy }),
    getLabel: ({ order }) => orderByTranslation[order],
    getLeftLabel: ({ field }) => orderByFormParticipantsTranslation[field],
  });

  const { onCleanData, onFilterData, paramsChipList } = useTableState({
    data: queryParams,
    setData: setQueryParams,
    chipMap: {
      search: null,
      status: (value) => ({
        leftLabel: 'Status',
        label: value,
        onDelete: () =>
          setQueryParams({
            page: 1,
            status: queryParams.status?.filter((status) => status !== value),
          }),
      }),
      hierarchies: (value) => ({
        leftLabel: 'Hierarquia',
        label: value.name,
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
      limit,
    },
  });

  // Check if form is accepting responses
  const isAcceptingResponses =
    formApplication?.status === FormApplicationStatusEnum.PROGRESS;

  return (
    <>
      <STableSearch
        search={queryParams.search}
        onSearch={(search) => onFilterData({ search })}
      >
        <STableSearchContent>
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
          {[...orderChipList, ...paramsChipList]?.map((chip) => (
            <STableFilterChip
              key={1}
              leftLabel={chip.leftLabel}
              label={chip.label}
              onDelete={chip.onDelete}
            />
          ))}
        </STableFilterChipList>
      </STableInfoSection>
      <SFormParticipantsTable
        filters={queryParams}
        setFilters={onFilterData}
        filterColumns={{}}
        setHiddenColumns={(hidden) =>
          setHiddenColumns({ ...hiddenColumns, ...hidden })
        }
        hiddenColumns={hiddenColumns}
        onSelectRow={(row) => onFormParticipantClick(row)}
        data={formParticipants?.results || []}
        isLoading={isLoading}
        pagination={formParticipants?.pagination}
        setPage={(page) => onFilterData({ page })}
        setOrderBy={onOrderBy}
        formApplication={formApplication}
      />
    </>
  );
};
