export interface EditManyCharacterizationParams {
  companyId: string;
  workspaceId: string;
  ids: string[];
  stageId?: number | null;
}
