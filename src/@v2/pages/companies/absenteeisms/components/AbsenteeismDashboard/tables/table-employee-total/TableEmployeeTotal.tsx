import { Box } from '@mui/material';
import { ResponsivePie } from '@nivo/pie';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { STableFilterChip } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { STableInfoSection } from '@v2/components/organisms/STable/addons/addons-table/STableInfoSection/STableInfoSection';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { TablesSelectEnum } from '@v2/components/organisms/STable/hooks/useTableSelect';
import { useTableState } from '@v2/components/organisms/STable/hooks/useTableState';
import { SAbsenteeismEmployeeTotalTable } from '@v2/components/organisms/STable/implementation/absenteeism/SAbsenteeismEmployeeTotalTable/SAbsenteeismEmployeeTotalTable';
import { IAbsenteeismFilterProps } from '@v2/components/organisms/STable/implementation/absenteeism/SAbsenteeismEmployeeTotalTable/SAbsenteeismEmployeeTotalTable.types';
import { useOrderBy } from '@v2/hooks/useOrderBy';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { orderByTranslation } from '@v2/models/.shared/translations/orden-by.translation';
import { AbsenteeismTotalEmployeeResultBrowseModel } from '@v2/models/absenteeism/models/absenteeism-total-employee/absenteeism-total-employee-browse-result.model';
import { orderByAbsenteeismEmployeeTotalTranslation } from '@v2/models/absenteeism/translations/orden-by-absenteeism-employee-total.translation';
import { useFetchBrowseAbsenteeismEmployeeTotal } from '@v2/services/absenteeism/dashboard/browse-absenteeism-employee/hooks/useFetchBrowseAbsenteeismEmployee';
import { AbsenteeismEmployeeTotalOrderByEnum } from '@v2/services/absenteeism/dashboard/browse-absenteeism-employee/service/browse-absenteeism-employee.service';
import { GraphTitle } from '../../graphs/components/GraphTitle/GraphTitle';

const limit = 5;
const table = TablesSelectEnum.ABSENTEEISM_DASH_EMPLOYEE;

export const TableEmployeeTotal = ({ companyId }: { companyId: string }) => {
  const { queryParams, setQueryParams } =
    useQueryParamsState<IAbsenteeismFilterProps>();

  const { data, isLoading } = useFetchBrowseAbsenteeismEmployeeTotal({
    companyId,
    filters: {
      search: queryParams.search,
    },
    orderBy: queryParams.orderBy || [
      {
        field: AbsenteeismEmployeeTotalOrderByEnum.TOTAL,
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
    getLeftLabel: ({ field }) =>
      orderByAbsenteeismEmployeeTotalTranslation[field],
  });

  const { onCleanData, onFilterData, paramsChipList } = useTableState({
    data: queryParams,
    setData: setQueryParams,
    chipMap: {
      search: null,
      hierarchiesIds: null,
    },
    cleanData: {
      search: '',
      orderBy: [],
      hierarchiesIds: [],
      page: 1,
      limit,
    },
  });

  const onSelectRow = (second: AbsenteeismTotalEmployeeResultBrowseModel) => {
    console.log('Selected row:', second);
  };

  return (
    <SPaper sx={{ p: 10 }}>
      <GraphTitle
        title="Funcionários com mais atestados"
        textProps={{
          mb: 10,
        }}
      />
      <STableSearch
        search={queryParams.search}
        onSearch={(search) => onFilterData({ search })}
      >
        <STableSearchContent>{null}</STableSearchContent>
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
      <SAbsenteeismEmployeeTotalTable
        table={table}
        filterColumns={{}}
        filters={queryParams}
        setFilters={onFilterData}
        onSelectRow={(row) => onSelectRow(row)}
        data={data?.results}
        isLoading={isLoading}
        pagination={data?.pagination}
        setPage={(page) => onFilterData({ page })}
        setOrderBy={onOrderBy}
      />
    </SPaper>
  );
};
