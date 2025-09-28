import { FormRoutes } from '@v2/constants/routes/forms.routes';
import {
  FormApplicationReadPublicModel,
  IFormApplicationReadPublicModel,
} from '@v2/models/form/models/form-application/form-application-read-public.model';
import { HierarchyTypeEnum } from '@v2/models/security/enums/hierarchy-type.enum';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export interface PublicFormApplicationParams {
  applicationId: string;
  encrypt?: string;
}

export async function publicFormApplication({
  applicationId,
  encrypt,
}: PublicFormApplicationParams) {
  const response = await api.get<{
    data: IFormApplicationReadPublicModel | null;
    isTesting: boolean;
    hasAlreadyAnswered: boolean;
    isPublic: boolean;
    hierarchyId?: string;
    employeeId?: string;
    options: {
      hierarchies: {
        id: string;
        name: string;
        type: HierarchyTypeEnum;
        parentId: string;
      }[];
    };
  }>(
    bindUrlParams({
      path: FormRoutes.FORM_APPLICATION.PATH_PUBLIC,
      pathParams: { applicationId },
      queryParams: { encrypt },
    }),
  );

  return {
    data: response.data?.data
      ? new FormApplicationReadPublicModel(response.data.data)
      : null,
    hierarchyId: response.data?.hierarchyId,
    employeeId: response.data?.employeeId,
    isTesting: response.data?.isTesting,
    hasAlreadyAnswered: response.data?.hasAlreadyAnswered,
    isPublic: response.data?.isPublic,
    options: response.data?.options,
  };
}
