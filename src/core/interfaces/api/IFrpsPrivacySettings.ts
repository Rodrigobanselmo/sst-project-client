export type FrpsParticipantGrant = { userId: number; level: 'IDENTITY' | 'ANSWERS' };
export type FrpsRiskAnalysisAiMinParticipants = 1 | 2 | 3;

export type IFrpsPrivacySettings = {
  indicatorsMinParticipants: 3;
  riskAnalysisAiMinParticipants: FrpsRiskAnalysisAiMinParticipants;
  riskAnalysisAiMinParticipantsIsDefault: boolean;
  allowPartialResults: boolean;
  canEdit: boolean;
  restrictParticipantIdentity?: boolean;
  participantGrants?: FrpsParticipantGrant[];
  eligibleUsers?: { userId:number; name:string; email:string; medicalRegistration?: {councilType:string;councilUF:string;councilId:string}|null }[];
};

export type IUpdateFrpsPrivacySettings = {
  restrictParticipantIdentity?: boolean;
  participantGrants?: FrpsParticipantGrant[];
  confirmIndividualAccess?: boolean;
  allowPartialResults?: boolean;
  riskAnalysisAiMinParticipants?: FrpsRiskAnalysisAiMinParticipants;
};
