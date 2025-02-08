import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { IDocumentControlFilterProps } from '@v2/components/organisms/STable/implementation/SDocumentControlTable/SDocumentControlTable.types';
import { useState } from 'react';

interface DocumentControlTableFilterTypeProps {
  companyId: string;
  onFilterData: (props: IDocumentControlFilterProps) => void;
  filters: IDocumentControlFilterProps;
}

export const DocumentControlTableFilterType = ({
  onFilterData,
  filters,
  companyId,
}: DocumentControlTableFilterTypeProps) => {
  const [search, setSearch] = useState('');

  // const { creators, isLoading } = useFetchBrowseDocumentControlCreators({
  //   companyId,
  //   filters: {
  //     search: search,
  //   },
  //   pagination: {
  //     page: 1,
  //     limit: 10,
  //   },
  // });

  const creators = { results: [] };
  const isLoading = false;

  const options = [...(creators?.results || [])];

  return (
    <SSearchSelectMultiple
      value={filters.creators || []}
      boxProps={{ flex: 1 }}
      options={options}
      onSearch={setSearch}
      loading={isLoading}
      label="Responsável"
      getOptionLabel={(option) => option.name}
      getOptionValue={(option) => option.id}
      onChange={(option) =>
        onFilterData({
          creators: option.map((res) => ({
            id: res.id,
            name: res.name,
          })),
        })
      }
    />
  );
};
