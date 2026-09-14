import { QueryEnum } from 'core/enums/query.enums';
import { queryClient } from 'core/services/queryClient';

export function invalidateEmployeeOrgViews() {
  queryClient.invalidateQueries([QueryEnum.EMPLOYEES]);
  queryClient.invalidateQueries([QueryEnum.HIERARCHY]);
}
