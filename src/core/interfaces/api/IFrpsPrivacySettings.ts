export type FrpsRiskAnalysisAiMinParticipants = 1 | 2 | 3;

export type IFrpsPrivacySettings = {
  indicatorsMinParticipants: 3;
  riskAnalysisAiMinParticipants: FrpsRiskAnalysisAiMinParticipants;
  riskAnalysisAiMinParticipantsIsDefault: boolean;
  allowPartialResults: boolean;
  canEdit: boolean;
};

export type IUpdateFrpsPrivacySettings = {
  allowPartialResults?: boolean;
  riskAnalysisAiMinParticipants?: FrpsRiskAnalysisAiMinParticipants;
};
