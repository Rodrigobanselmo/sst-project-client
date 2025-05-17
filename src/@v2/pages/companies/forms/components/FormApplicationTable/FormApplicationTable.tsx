import { STableFilterChip } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { STableInfoSection } from '@v2/components/organisms/STable/addons/addons-table/STableInfoSection/STableInfoSection';
import { STableAddButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableAddButton/STableAddButton';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import { STableFilterButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { useTableState } from '@v2/components/organisms/STable/hooks/useTableState';
import { FormApplicationColumnsEnum } from '@v2/components/organisms/STable/implementation/SFormApplicationTable/enums/form-application-columns.enum';
import { commentColumns } from '@v2/components/organisms/STable/implementation/SFormApplicationTable/maps/fomr-application-column-map';
import { useOrderBy } from '@v2/hooks/useOrderBy';
import { persistKeys, usePersistedState } from '@v2/hooks/usePersistState';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { orderByTranslation } from '@v2/models/.shared/translations/orden-by.translation';
import { useFormApplicationActions } from './hooks/useFormApplicationActions';
import { FormApplicationTableFilter } from './components/FormApplicationTableFilter/FormApplicationTableFilter';
import { IFormApplicationFilterProps } from '@v2/components/organisms/STable/implementation/SFormApplicationTable/SFormApplicationTable.types';
import { FormApplicationOrderByEnum } from '@v2/services/forms/form-application/browse-form-application/service/browse-form-application.types';
import { useFetchBrowseFormApplication } from '@v2/services/forms/form-application/browse-form-application/hooks/useFetchBrowseFormApplication';
import { orderByFormApplicationTranslation } from '@v2/models/form/translations/orden-by-form-application.translation';
import { SFormApplicationTable } from '@v2/components/organisms/STable/implementation/SFormApplicationTable/SFormApplicationTable';

const limit = 15;

export const FormApplicationTable = ({ companyId }: { companyId: string }) => {
  const [hiddenColumns, setHiddenColumns] = usePersistedState<
    Record<FormApplicationColumnsEnum, boolean>
  >(persistKeys.COLUMNS_FORMS_APPLICATION, {} as any);

  const { onFormApplicationAdd, onFormApplicationClick } =
    useFormApplicationActions({
      companyId,
    });

  const { queryParams, setQueryParams } =
    useQueryParamsState<IFormApplicationFilterProps>();

  const { formApplication, isLoading } = useFetchBrowseFormApplication({
    companyId,
    filters: {
      search: queryParams.search,
      status: queryParams.status,
    },
    orderBy: queryParams.orderBy || [
      {
        field: FormApplicationOrderByEnum.STATUS,
        order: 'desc',
      },
      {
        field: FormApplicationOrderByEnum.CREATED_AT,
        order: 'desc',
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
    getLeftLabel: ({ field }) => orderByFormApplicationTranslation[field],
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
            status: queryParams.status?.filter((type) => type !== value),
          }),
      }),
    },
    cleanData: {
      search: '',
      status: [],
      orderBy: [],
      page: 1,
      limit,
    },
  });

  return (
    <>
      <STableSearch
        search={queryParams.search}
        onSearch={(search) => onFilterData({ search })}
      >
        <STableSearchContent>
          <STableAddButton onClick={onFormApplicationAdd} />
          <STableColumnsButton
            showLabel
            hiddenColumns={hiddenColumns}
            setHiddenColumns={setHiddenColumns}
            columns={commentColumns}
          />
          <STableFilterButton>
            <FormApplicationTableFilter
              data={formApplication?.filters}
              onFilterData={onFilterData}
              filters={queryParams}
              companyId={companyId}
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
      <SFormApplicationTable
        filters={queryParams}
        setFilters={onFilterData}
        filterColumns={{}}
        setHiddenColumns={(hidden) =>
          setHiddenColumns({ ...hiddenColumns, ...hidden })
        }
        hiddenColumns={hiddenColumns}
        onSelectRow={(row) => onFormApplicationClick(row.id)}
        data={formApplication?.results}
        isLoading={isLoading}
        pagination={formApplication?.pagination}
        setPage={(page) => onFilterData({ page })}
        setOrderBy={onOrderBy}
      />
    </>
  );
};
