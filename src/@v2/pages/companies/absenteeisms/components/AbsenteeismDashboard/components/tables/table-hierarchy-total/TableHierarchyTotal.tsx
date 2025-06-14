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
import { SAbsenteeismHierarchyTotalTable } from '@v2/components/organisms/STable/implementation/absenteeism/SAbsenteeismHierarchyTotalTable/SAbsenteeismHierarchyTotalTable';
import { IAbsenteeismFilterProps } from '@v2/components/organisms/STable/implementation/absenteeism/SAbsenteeismHierarchyTotalTable/SAbsenteeismHierarchyTotalTable.types';
import { useOrderBy } from '@v2/hooks/useOrderBy';
import { orderByTranslation } from '@v2/models/.shared/translations/orden-by.translation';
import { AbsenteeismTotalHierarchyResultBrowseModel } from '@v2/models/absenteeism/models/absenteeism-total-hierarchy/absenteeism-total-hierarchy-browse-result.model';
import { orderByAbsenteeismHierarchyTotalTranslation } from '@v2/models/absenteeism/translations/orden-by-absenteeism-hierarchy-total.translation';
import { useFetchBrowseAbsenteeismHierarchyTotal } from '@v2/services/absenteeism/dashboard/browse-absenteeism-hierarchy/hooks/useFetchBrowseAbsenteeismHierarchy';
import {
  AbsenteeismHierarchyTotalOrderByEnum,
  AbsenteeismHierarchyTypeEnum,
} from '@v2/services/absenteeism/dashboard/browse-absenteeism-hierarchy/service/browse-absenteeism-hierarchy.service';
import { useEffect, useState } from 'react';
import { GraphTitle } from '../../graphs/components/GraphTitle/GraphTitle';
import { SSearchSelect } from '@v2/components/forms/fields/SSearchSelect/SSearchSelect';
import { AbsenteeismHierarchyTypeTranslation } from '@v2/models/absenteeism/translations/absenteeism-hierarchy-type.translatio';
import { SButton } from '@v2/components/atoms/SButton/SButton';
import { useCompareState } from '../../../store/compare.store';
import { STableButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/STableButton';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';

interface Props extends FilterTypesProps {
  companyId: string;
}

const limit = 6;
const table = TablesSelectEnum.ABSENTEEISM_DASH_HIERARCHY;

export const TableHierarchyTotal = ({ companyId, ...props }: Props) => {
  const [params, setParams] = useState<IAbsenteeismFilterProps>({
    orderBy: [
      {
        field: AbsenteeismHierarchyTotalOrderByEnum.AVERAGE_DAYS,
        order: 'desc',
      },
    ],
  });
  const [showGraphs, setShowGraphs] = useState(false);
  const setParamsPrev = (newParams: IAbsenteeismFilterProps) => {
    setParams((prev) => ({ ...prev, ...newParams }));
  };

  const { data, isLoading } = useFetchBrowseAbsenteeismHierarchyTotal({
    companyId,
    filters: {
      search: params.search,
      type: params.type || AbsenteeismHierarchyTypeEnum.SECTOR,
      ...props,
    },
    orderBy: params.orderBy || [
      {
        field: AbsenteeismHierarchyTotalOrderByEnum.AVERAGE_DAYS,
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
      orderByAbsenteeismHierarchyTotalTranslation[field],
  });

  const { onCleanData, onFilterData, paramsChipList } = useTableState({
    data: params,
    setData: setParamsPrev,
    chipMap: {
      search: null,
      type: null,
      hierarchiesIds: null,
    },
    cleanData: {
      search: '',
      type: null,
      orderBy: [],
      hierarchiesIds: [],
      page: 1,
      limit,
    },
  });

  const onChangeOrder = (field: AbsenteeismHierarchyTotalOrderByEnum) => {
    setParamsPrev({
      orderBy: [
        {
          field,
          order: 'desc',
        },
      ],
    });
  };

  const setGraph1 = useCompareState((state) => state.setGraph1);
  const setGraph2 = useCompareState((state) => state.setGraph2);
  const setGraph3 = useCompareState((state) => state.setGraph3);
  const setCompare = useCompareState((state) => state.setCompare);

  const onCreateGraphs = () => {
    setGraph3(
      data?.results.map((item) => ({
        label: item.availableList.at(-1)?.name || '',
        value: item.total,
      })) || [],
    );

    setGraph2(
      data?.results.map((item) => ({
        label: item.availableList.at(-1)?.name || '',
        value: item.totalDays,
      })) || [],
    );

    setGraph1(
      data?.results.map((item) => ({
        label: item.availableList.at(-1)?.name || '',
        value: Math.round(item.averageDays * 100),
      })) || [],
    );

    setShowGraphs(true);
  };

  const onSelectColumn = (params: {
    id: string;
    type: AbsenteeismHierarchyTypeEnum;
  }) => {
    setCompare(params);
  };

  useEffect(() => {
    if (showGraphs) onCreateGraphs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data]);

  return (
    <SPaper sx={{ p: 10, overflow: 'scroll' }}>
      <SFlex justify="space-between">
        <GraphTitle
          title="Cargos/Setores com mais atestados"
          textProps={{
            mb: 10,
          }}
        />
        <SFlex gap={10}>
          <SSearchSelect
            inputProps={{ sx: { width: 300 } }}
            options={data?.typeList || []}
            label="Status"
            getOptionLabel={(option) =>
              AbsenteeismHierarchyTypeTranslation[option]
            }
            getOptionValue={(option) => option}
            onChange={(option) => {
              onFilterData({ type: option });
            }}
            component={() => (
              <SButton
                color="paper"
                minWidth={120}
                variant="outlined"
                text={
                  params.type
                    ? AbsenteeismHierarchyTypeTranslation[params.type]
                    : 'Setor'
                }
              />
            )}
          />

          <SButtonGroup
            onChange={(option) => onChangeOrder(option.value)}
            value={
              params.orderBy?.[0]?.field ||
              AbsenteeismHierarchyTotalOrderByEnum.AVERAGE_DAYS
            }
            buttonProps={{
              sx: {
                minWidth: 160,
              },
            }}
            options={[
              {
                label: 'Taxa de Absenteísmo',
                value: AbsenteeismHierarchyTotalOrderByEnum.AVERAGE_DAYS,
              },
              {
                label: 'Dias Perdidos',
                value: AbsenteeismHierarchyTotalOrderByEnum.TOTAL_DAYS,
              },
              {
                label: 'Total de Atestados',
                value: AbsenteeismHierarchyTotalOrderByEnum.TOTAL,
              },
            ]}
          />
        </SFlex>
      </SFlex>
      <STableSearch
        autoFocus={false}
        search={params.search}
        onSearch={(search) => onFilterData({ search })}
      >
        <STableSearchContent>
          <STableButton
            onClick={onCreateGraphs}
            color="info"
            text={'Gerar Gráficos'}
            loading={isLoading}
            icon={<AutoGraphIcon sx={{ fontSize: 16 }} />}
          />
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
      <SAbsenteeismHierarchyTotalTable
        table={table}
        filterColumns={{}}
        filters={params}
        setFilters={onFilterData}
        data={data}
        onSelectColumn={onSelectColumn}
        isLoading={isLoading}
        pagination={data?.pagination}
        setPage={(page) => onFilterData({ page })}
        setOrderBy={onOrderBy}
      />
    </SPaper>
  );
};
