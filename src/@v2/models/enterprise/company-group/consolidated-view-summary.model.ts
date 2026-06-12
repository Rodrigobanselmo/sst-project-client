import { ConsolidatedViewCapabilitiesModel } from './consolidated-view-capability.enum';
import { ConsolidatedViewEligibleApplicationModel } from './consolidated-view-eligibility.model';

export type ConsolidatedViewSummaryModel = {
  mode: 'virtual_consolidated';
  businessGroupId: number;
  businessGroupName: string;
  formId: string;
  formName: string;
  includedFormIds: string[];
  structureFingerprint: string;
  applications: ConsolidatedViewEligibleApplicationModel[];
  totals: {
    totalParticipants: number;
    totalAnswers: number;
    totalResponded: number;
    totalNotResponded: number;
    completionPercent: number;
  };
  capabilities: ConsolidatedViewCapabilitiesModel;
};
