import { CharacterizationRoutes } from '@v2/constants/routes/characterization.routes';
import { bindUrlParams } from '@v2/utils/bind-ul-params';
import { api } from 'core/services/apiClient';

export type ExistingControlSuggestionApiField =
  | 'medidasAdministrativasExistentes'
  | 'medidasEngenhariaExistentes';

export async function updateExistingControlSuggestion(params: {
  companyId: string;
  workspaceId: string;
  riskFactorDataId: string;
  action: 'dismiss' | 'confirm';
  field: ExistingControlSuggestionApiField;
  text: string;
}): Promise<void> {
  await api.post(
    bindUrlParams({
      path: CharacterizationRoutes.CHARACTERIZATION.EXISTING_CONTROL_SUGGESTION,
      pathParams: {
        companyId: params.companyId,
        workspaceId: params.workspaceId,
        riskFactorDataId: params.riskFactorDataId,
        action: params.action,
      },
    }),
    { field: params.field, text: params.text },
  );
}
