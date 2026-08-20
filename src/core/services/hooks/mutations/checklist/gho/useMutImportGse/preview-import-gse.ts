import queryString from 'query-string';

import { ApiRoutesEnum } from 'core/enums/api-routes.enums';
import { api } from 'core/services/apiClient';

export interface IImportGsePreviewParams {
  companyId: string;
  companyCopyFromId: string;
  sourceWorkspaceId: string;
  sourceHomogeneousGroupId: string;
  sourceRiskFactorGroupDataId: string;
  name?: string;
}

export interface IImportGsePreview {
  sourceHomogeneousGroupId: string;
  sourceName: string;
  sourceDescription: string;
  directRiskCount: number;
  nameConflict: boolean;
}

export async function previewImportGse(params: IImportGsePreviewParams) {
  const { companyId, ...query } = params;
  const qs = queryString.stringify(query);
  const response = await api.get<IImportGsePreview>(
    `${ApiRoutesEnum.GHO}/import-preview/${companyId}?${qs}`,
  );
  return response.data;
}
