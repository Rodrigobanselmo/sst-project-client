import { ConsolidatedViewEligibleApplicationModel } from './consolidated-view-eligibility.model';

export type ConsolidatedViewParticipantModel = {
  participantId: number;
  applicationId: string;
  companyId: string;
  companyLabel: string;
  workspaceLabel: string | null;
  hierarchyLabel: string;
  sectorLabel: string;
  officeLabel: string | null;
  name: string;
  cpf: string;
  email: string;
  phone: string | null;
  hasAnswered: boolean;
};

export type ConsolidatedViewParticipantsModel = {
  mode: 'virtual_consolidated';
  businessGroupId: number;
  businessGroupName: string;
  applications: ConsolidatedViewEligibleApplicationModel[];
  totals: {
    totalParticipants: number;
    totalResponded: number;
    totalNotResponded: number;
    completionPercent: number;
  };
  filterSummary: {
    totalParticipants: number;
    respondedCount: number;
    notRespondedCount: number;
    responseRatePercent: number;
  };
  participants: ConsolidatedViewParticipantModel[];
  pagination: {
    page: number;
    limit: number;
    total: number;
  };
};
