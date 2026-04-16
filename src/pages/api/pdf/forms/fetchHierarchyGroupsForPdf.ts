import { FormRoutes } from '@v2/constants/routes/forms.routes';
import type { HierarchyGroupForIndicators } from '@v2/pages/companies/forms/pages/application/pages/view/components/FormApplicationView/components/FormQuestionsDashboard/helpers/buildParticipantGroupsForIndicators';
import { bindUrlParams } from '@v2/utils/bind-ul-params';

type ApiClientLike = {
  get<T>(url: string): Promise<{ data: T }>;
};

/**
 * Chamada auxiliar para o mesmo endpoint da tela (hierarchy-groups).
 * No PDF (Next API route) falhas comuns (403, 404, rede) não devem derrubar a exportação:
 * sem grupos hierárquicos o dataset usa só o merge/filtro já aplicado em buildParticipantGroups.
 */
export async function fetchHierarchyGroupsForPdf(
  apiClient: ApiClientLike,
  companyId: string,
  applicationId: string,
): Promise<HierarchyGroupForIndicators[]> {
  try {
    const { data } = await apiClient.get<HierarchyGroupForIndicators[]>(
      bindUrlParams({
        path: FormRoutes.HIERARCHY_GROUP.PATH,
        pathParams: { companyId, applicationId },
      }),
    );
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}
