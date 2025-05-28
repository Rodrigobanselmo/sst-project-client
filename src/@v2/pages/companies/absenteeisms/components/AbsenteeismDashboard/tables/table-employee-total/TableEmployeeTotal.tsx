import { SButtonGroup } from '@v2/components/atoms/SButtonGroup/SButtonGroup';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { SPaper } from '@v2/components/atoms/SPaper/SPaper';
import { STableFilterChip } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { STableInfoSection } from '@v2/components/organisms/STable/addons/addons-table/STableInfoSection/STableInfoSection';
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
import { useState } from 'react';

const limit = 6;
const table = TablesSelectEnum.ABSENTEEISM_DASH_EMPLOYEE;

export const TableEmployeeTotal = ({ companyId }: { companyId: string }) => {
  const [params, setParams] = useState<IAbsenteeismFilterProps>({});
  const setParamsPrev = (newParams: IAbsenteeismFilterProps) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const { data, isLoading } = useFetchBrowseAbsenteeismEmployeeTotal({
    companyId,
    filters: {
      search: params.search,
    },
    orderBy: params.orderBy || [
      {
        field: AbsenteeismEmployeeTotalOrderByEnum.TOTAL,
        order: 'desc',
      },
    ],
    pagination: {
      page: params.page || 1,
      limit: params.limit || limit,
    },
  });

  const { onOrderBy, orderChipList } = useOrderBy({
    orderByList: params.orderBy,
    setOrderBy: (orderBy) => setParamsPrev({ orderBy }),
    getLabel: ({ order }) => orderByTranslation[order],
    getLeftLabel: ({ field }) =>
      orderByAbsenteeismEmployeeTotalTranslation[field],
  });

  const { onCleanData, onFilterData, paramsChipList } = useTableState({
    data: params,
    setData: setParamsPrev,
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

  const onChangeOrder = (value: AbsenteeismEmployeeTotalOrderByEnum) => {
    setParamsPrev({
      orderBy: [
        {
          field: value,
          order: 'desc',
        },
      ],
    });
  };

  return (
    <SPaper sx={{ p: 10 }}>
      <SFlex justify="space-between">
        <GraphTitle
          title="Funcionários com mais atestados"
          textProps={{
            mb: 10,
          }}
        />
        <SButtonGroup
          onChange={(option) => onChangeOrder(option.value)}
          value={
            params.orderBy?.[0]?.field ||
            AbsenteeismEmployeeTotalOrderByEnum.TOTAL
          }
          buttonProps={{
            sx: {
              minWidth: 150,
            },
          }}
          options={[
            {
              label: 'Total de Atestados',
              value: AbsenteeismEmployeeTotalOrderByEnum.TOTAL,
            },
            {
              label: 'Dias Perdidos',
              value: AbsenteeismEmployeeTotalOrderByEnum.TOTAL_DAYS,
            },
          ]}
        />
      </SFlex>
      <STableSearch
        autoFocus={false}
        search={params.search}
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
        filters={params}
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
