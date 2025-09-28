import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { BrowseFormHierarchiesParams } from '../service/browse-form-hierarchies.types';
import { browseFormHierarchies } from '../service/browse-form-hierarchies.service';

export const useFetchBrowseFormHierarchies = (
  params: BrowseFormHierarchiesParams,
) => {
  const { data, ...response } = useFetch({
    queryFn: async () => {
      return browseFormHierarchies(params);
    },
    queryKey: [QueryKeyFormEnum.FORM_HIERARCHIES, params.companyId, params],
  });

  return {
    ...response,
    hierarchies: data,
  };
};
