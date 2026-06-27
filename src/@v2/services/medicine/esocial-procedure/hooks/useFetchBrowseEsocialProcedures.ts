import { useFetch } from '@v2/hooks/api/useFetch';

import { browseEsocialProcedures } from '../service/esocial-procedure.service';
import type { IBrowseEsocialProceduresParams } from '../service/esocial-procedure.types';
import { esocialProcedureQueryKeys } from './esocial-procedure.query-keys';

export const useFetchBrowseEsocialProcedures = (
  params: IBrowseEsocialProceduresParams,
  enabled = true,
) =>
  useFetch({
    queryKey: esocialProcedureQueryKeys.browse(params),
    queryFn: () => browseEsocialProcedures(params),
    enabled,
    refetchOnMount: true,
  });
