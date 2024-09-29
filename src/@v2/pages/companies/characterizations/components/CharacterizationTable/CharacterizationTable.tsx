import { useRouter } from 'next/router';

import { SCharacterizationTable } from '@v2/components/organisms/STable/implementation/SCharacterizationTable/SCharacterizationTable';
import { useFetchBrowseCharaterizations } from '@v2/services/security/characterization/browse/hooks/useFetchBrowseCharacterization';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { ICharacterizationFilterProps } from './CharacterizationTable.types';
import { useEffect } from 'react';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { STableAddButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchAddButton/STableSearchAddButton';
import { CharacterizationOrderByEnum } from '@v2/services/security/characterization/browse/service/browse-characterization.types';
import { IOrderByParams } from '@v2/types/order-by-params.type';
import { TableProvider } from '@v2/context/TableContext';
import { setOrderByTable } from '@v2/components/organisms/STable/helpers/set-order-by-table.helper';

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
        <STableAddButton onClick={() => null} />
      </STableSearch>
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
