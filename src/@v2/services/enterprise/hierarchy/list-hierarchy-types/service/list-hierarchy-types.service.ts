import { CompanyRoutes } from '@v2/constants/routes/company.routes';
import {
  HierarchiesTypesModel,
  IHierarchiesTypesModel,
} from '@v2/models/enterprise/models/hierarchy/hierarchies-types.model';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';
import { ListHierarchyTypesParams } from './list-hierarchy-types.types';
import { HierarchyRoutes } from '@v2/constants/routes/hierarchy.routes';

export async function listHierarchyTypes({
  companyId,
  workspaceId,
}: ListHierarchyTypesParams) {
  const response = await api.get<IHierarchiesTypesModel>(
    bindUrlParams({
      path: HierarchyRoutes.HIERARCHY.LIST_TYPES,
      pathParams: { companyId },
      queryParams: {
        workspaceId,
      },
    }),
  );

  return new HierarchiesTypesModel(response.data);
}
