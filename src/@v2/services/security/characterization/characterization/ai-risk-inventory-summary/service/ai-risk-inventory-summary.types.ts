export type AiRiskInventorySummaryParams = {
  companyId: string;
  workspaceId: string;
  characterizationId: string;
};

export type AiRiskInventorySummaryResult = {
  intent: 'GENERATE_RISK_INVENTORY_SUMMARY';
  riskInventorySummary: string;
};
