export type IFormApplicationRiskLogBrowseModelMapper = {
  entityId: string;
  probability: number;
  riskId: string;
  existsInInventory?: boolean;
}[];

export interface FormApplicationRiskLogParams {
  companyId: string;
  applicationId: string;
}
