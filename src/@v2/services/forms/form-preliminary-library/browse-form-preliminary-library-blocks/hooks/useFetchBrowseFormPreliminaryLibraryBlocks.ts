import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import { browseFormPreliminaryLibraryBlocks } from '../service/browse-form-preliminary-library-blocks.service';
import { BrowseFormPreliminaryLibraryBlocksParams } from '../service/browse-form-preliminary-library-blocks.types';

export const getKeyBrowseFormPreliminaryLibraryBlocks = (
  params: BrowseFormPreliminaryLibraryBlocksParams,
) => [QueryKeyFormEnum.FORM_PRELIMINARY_LIBRARY_BLOCKS, params];

export const useFetchBrowseFormPreliminaryLibraryBlocks = (
  params: BrowseFormPreliminaryLibraryBlocksParams & { enabled?: boolean },
) => {
  const { enabled = true, ...browseParams } = params;

  const { data, ...response } = useFetch({
    queryFn: async () => browseFormPreliminaryLibraryBlocks(browseParams),
    queryKey: getKeyBrowseFormPreliminaryLibraryBlocks(browseParams),
    enabled,
  });

  return {
    ...response,
    browseResult: data,
  };
};
