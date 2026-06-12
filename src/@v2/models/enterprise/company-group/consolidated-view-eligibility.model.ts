import { ConsolidatedViewExclusionReasonEnum } from './consolidated-view-exclusion-reason.enum';

export type ConsolidatedViewEligibleApplicationModel = {
  applicationId: string;
  applicationName: string;
  companyId: string;
  companyLabel: string;
  totalParticipants: number;
  totalAnswers: number;
};

export type ConsolidatedViewEligibleSetModel = {
  formId: string;
  formName: string;
  includedFormIds: string[];
  structureFingerprint: string;
  applications: ConsolidatedViewEligibleApplicationModel[];
};

export type ConsolidatedViewExcludedApplicationModel = {
  applicationId: string;
  applicationName: string;
  companyId: string;
  companyLabel: string;
  reason: ConsolidatedViewExclusionReasonEnum;
};

export type ConsolidatedViewEligibilityModel = {
  companyGroupId: number;
  companyGroupName: string;
  hasEligibleSet: boolean;
  eligibleSets: ConsolidatedViewEligibleSetModel[];
  excludedApplications: ConsolidatedViewExcludedApplicationModel[];
};
