import type { IBrowseEsocialProceduresParams } from '../service/esocial-procedure.types';

export const esocialProcedureQueryKeys = {
  all: () => ['esocial-procedure'],
  browse: (params?: IBrowseEsocialProceduresParams) => [
    'esocial-procedure',
    'browse',
    params ?? {},
  ],
  detail: (procedureCode: string) => [
    'esocial-procedure',
    'detail',
    procedureCode,
  ],
};
