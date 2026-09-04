import { IActionPlanFilterProps } from '@v2/components/organisms/STable/implementation/SActionPlanTable/SActionPlanTable.types';
import { ActionPlanDocumentFormat } from '@v2/services/export/action-plan/service/download-action-plan-document.types';
import { ExportActionPlanParams } from '@v2/services/export/action-plan/service/export-action-plan.types';

export type ActionPlanScreenExportFilters = Omit<
  ExportActionPlanParams,
  'companyId' | 'workspaceId' | 'orderBy'
>;

export const buildActionPlanScreenExportFilters = ({
  queryParams,
  userId,
}: {
  queryParams: IActionPlanFilterProps;
  userId?: number;
}): ActionPlanScreenExportFilters => ({
  search: queryParams.search || undefined,
  occupationalRisks: queryParams.occupationalRisks,
  status: queryParams.status,
  isExpired: queryParams.isExpired || undefined,
  riskTypes: queryParams.riskTypes,
  riskSubTypes: queryParams.riskSubTypes?.map((subType) => subType.id),
  responsibleIds: userId
    ? [userId]
    : queryParams.responsibles?.map((resp) => Number(resp.id)),
  hierarchyIds: queryParams.hierarchies?.map((hierarchy) => hierarchy.id),
  generateSourceIds: queryParams.generateSources?.map((source) => source.id),
});

export const buildActionPlanWordDownloadPayload = ({
  companyId,
  workspaceId,
  format,
  queryParams,
  userId,
}: {
  companyId: string;
  workspaceId: string;
  format: ActionPlanDocumentFormat;
  queryParams: IActionPlanFilterProps;
  userId?: number;
}) => ({
  companyId,
  workspaceId,
  format,
  applyScreenFilters: true as const,
  ...buildActionPlanScreenExportFilters({ queryParams, userId }),
});
