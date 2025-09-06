export type IFormApplicationRiskLogBrowseModelMapper = {
  entityId: string;
  probability: number;
  riskId: string;
}[];

export interface FormApplicationRiskLogParams {
  companyId: string;
  applicationId: string;
}
