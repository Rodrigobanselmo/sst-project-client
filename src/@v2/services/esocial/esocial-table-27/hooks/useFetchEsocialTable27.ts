import { useFetch } from '@v2/hooks/api/useFetch';

import { browseEsocialTable27 } from '../service/esocial-table-27.service';
import { esocialTable27QueryKeys } from './esocial-table-27.query-keys';

export const useFetchEsocialTable27 = (enabled = true) =>
  useFetch({
    queryKey: esocialTable27QueryKeys.browse(),
    queryFn: () => browseEsocialTable27(),
    enabled,
    refetchOnMount: true,
  });
