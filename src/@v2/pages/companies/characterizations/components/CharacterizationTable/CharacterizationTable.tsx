import { useRouter } from 'next/router';

import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { STableAddButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableAddButton/STableAddButton';
import { setOrderByTable } from '@v2/components/organisms/STable/helpers/set-order-by-table.helper';
import { SCharacterizationTable } from '@v2/components/organisms/STable/implementation/SCharacterizationTable/SCharacterizationTable';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { useFetchBrowseCharaterizations } from '@v2/services/security/characterization/browse/hooks/useFetchBrowseCharacterization';
import { CharacterizationOrderByEnum } from '@v2/services/security/characterization/browse/service/browse-characterization.types';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import { ICharacterizationFilterProps } from './CharacterizationTable.types';
import { STableButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/STableButton';
import AddIcon from '@mui/icons-material/Add';
import { STableFilterButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableFilterButton/STableFilterButton';
import { STableSortButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableSortButton/STableSortButton';
import { STableColumnsButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableColumnsButton/STableColumnsButton';
import { Box } from '@mui/material';
import { STableButtonDivider } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButtonDivider/STableButtonDivider';
import { STableSearchContent } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchContent/STableSearchContent';
import { STableExportButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableExportButton/STableExportButton';
import { STableImportButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableButton/components/STableImportButton/STableImportButton';
import { SFlex } from '@v2/components/atoms/SFlex/SFlex';
import { STableFilterChip } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChip/STableFilterChip';
import { STableFilterChipList } from '@v2/components/organisms/STable/addons/addons-table/STableFilterChipList/STableFilterChipList';
import { SInput } from '@v2/components/forms/SInput/SInput';

export const CharacterizationTable = () => {
  const router = useRouter();

  const companyId = router.query.companyId as string;
  const workspaceId = router.query.workspaceId as string;

  const { queryParams, setQueryParams } =
    useQueryParamsState<ICharacterizationFilterProps>();

  const { characterizations, isLoading } = useFetchBrowseCharaterizations({
    companyId,
    workspaceId,
    filters: {
      search: queryParams.search,
    },
    orderBy: queryParams.orderBy || [
      {
        field: CharacterizationOrderByEnum.TYPE,
        order: 'asc',
      },
      {
        field: CharacterizationOrderByEnum.ORDER,
        order: 'asc',
      },
      {
        field: CharacterizationOrderByEnum.NAME,
        order: 'asc',
      },
    ],
    pagination: {
      page: queryParams.page || 1,
      limit: queryParams.limit || 10,
    },
  });

  const onOrderBy = (order: IOrderByParams<CharacterizationOrderByEnum>) => {
    const orderBy = setOrderByTable(order, queryParams.orderBy || []);
    setQueryParams({ orderBy });
  };

  return (
    <>
      <STableSearch
        search={queryParams.search}
        onSearch={(search) => setQueryParams({ search })}
      >
        <STableSearchContent>
          <STableAddButton onClick={() => null} />
          <STableColumnsButton onClick={() => null} />
          <STableFilterButton onClick={() => null} />
          <STableButtonDivider />
          <STableExportButton onClick={() => null} />
          <STableImportButton onClick={() => null} />
        </STableSearchContent>
      </STableSearch>
      <STableFilterChipList>
        {[].map(() => (
          <STableFilterChip
            key={1}
            leftLabel="status"
            label={'Ativo'}
            onDelete={() => null}
          />
        ))}
      </STableFilterChipList>
      <SCharacterizationTable
        data={characterizations?.results}
        isLoading={isLoading}
        pagination={characterizations?.pagination}
        orderBy={queryParams.orderBy}
        setPage={(page) => setQueryParams({ page })}
        setOrderBy={onOrderBy}
      />
    </>
  );
};
