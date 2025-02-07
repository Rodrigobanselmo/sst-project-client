import { SSearchSelectMultiple } from '@v2/components/forms/fields/SSearchSelect/SSearchSelectMultiple';
import { ICommentFilterProps } from '@v2/components/organisms/STable/implementation/SCommentTable/SCommentTable.types';
import { useFetchBrowseCommentCreators } from '@v2/services/security/action-plan/user/browse-comment-creators/hooks/useFetchBrowseCommentCreators';
import { useState } from 'react';

interface CommentTableFilterCommentCreatorProps {
  companyId: string;
  onFilterData: (props: ICommentFilterProps) => void;
  filters: ICommentFilterProps;
}

export const CommentTableFilterCommentCreator = ({
  onFilterData,
  filters,
  companyId,
}: CommentTableFilterCommentCreatorProps) => {
  const [search, setSearch] = useState('');

  const { creators, isLoading } = useFetchBrowseCommentCreators({
    companyId,
    filters: {
      search: search,
    },
    pagination: {
      page: 1,
      limit: 10,
    },
  });

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
