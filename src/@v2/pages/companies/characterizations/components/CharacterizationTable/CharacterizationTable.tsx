import { useRouter } from 'next/router';

import { SCharacterizationTable } from '@v2/components/organisms/STable/implementation/SCharacterizationTable/SCharacterizationTable';
import { useFetchBrowseCharaterizations } from '@v2/services/security/characterization/browse/hooks/useFetchBrowseCharacterization';
import { useQueryParamsState } from '@v2/hooks/useQueryParamsState';
import { ICharacterizationFilterProps } from './CharacterizationTable.types';
import { useEffect } from 'react';
import { STableSearch } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/STableSearch';
import { STableAddButton } from '@v2/components/organisms/STable/addons/addons-table/STableSearch/components/STableSearchAddButton/STableSearchAddButton';

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
    pagination: {
      page: queryParams.page || 1,
      limit: queryParams.limit || 10,
    },
  });

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
        setPage={(page) => setQueryParams({ page })}
      />
    </>
  );
};
