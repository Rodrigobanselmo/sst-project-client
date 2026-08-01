import { useMutate } from '@v2/hooks/api/useMutate';
import { QueryEnum } from 'core/enums/query.enums';

import { deleteDevelopedRole } from '../service/exposure-group-assistant.service';
import type { DeleteDevelopedRoleParams } from '../service/exposure-group-assistant.types';
import { exposureGroupAssistantQueryKeys } from './exposure-group-assistant.query-keys';

export function useMutateDeleteDevelopedRole() {
  return useMutate({
    mutationFn: (params: DeleteDevelopedRoleParams) =>
      deleteDevelopedRole(params),
    invalidateManyQueryKeys: () => [
      [...exposureGroupAssistantQueryKeys.all],
      [QueryEnum.HIERARCHY],
      [QueryEnum.EMPLOYEES],
      [QueryEnum.EMPLOYEE_HISTORY_HIER],
    ],
  });
}
