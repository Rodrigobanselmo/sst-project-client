import { QueryKeyFormEnum } from '@v2/constants/enums/form-query-key.enum';
import { useFetch } from '@v2/hooks/api/useFetch';
import {
  readFormPreliminaryLibraryBlock,
  ReadFormPreliminaryLibraryBlockParams,
} from '../service/read-form-preliminary-library-block.service';

export const useFetchReadFormPreliminaryLibraryBlock = (
  params: ReadFormPreliminaryLibraryBlockParams & { enabled?: boolean },
) => {
  const { enabled = true, ...readParams } = params;

  const { data, ...response } = useFetch({
    queryFn: async () => readFormPreliminaryLibraryBlock(readParams),
    queryKey: [
      QueryKeyFormEnum.FORM_PRELIMINARY_LIBRARY_BLOCKS,
      'read',
      readParams.companyId,
      readParams.blockId,
    ],
    enabled: enabled && !!readParams.companyId && !!readParams.blockId,
  });

  return {
    ...response,
    block: data,
  };
};
