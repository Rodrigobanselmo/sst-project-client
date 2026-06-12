export enum ConsolidatedViewCapabilityStatusEnum {
  NOT_IMPLEMENTED = 'not_implemented',
  DISABLED = 'disabled',
}

export type ConsolidatedViewCapabilitiesModel = {
  participants: ConsolidatedViewCapabilityStatusEnum;
  charts: ConsolidatedViewCapabilityStatusEnum;
  indicators: ConsolidatedViewCapabilityStatusEnum;
  structuralGroupings: ConsolidatedViewCapabilityStatusEnum;
  riskAnalysisOperational: ConsolidatedViewCapabilityStatusEnum;
  riskNarrativeConcat: ConsolidatedViewCapabilityStatusEnum;
  indicatorsNarrative: ConsolidatedViewCapabilityStatusEnum;
  pdf: ConsolidatedViewCapabilityStatusEnum;
  emails: ConsolidatedViewCapabilityStatusEnum;
  reminders: ConsolidatedViewCapabilityStatusEnum;
  banner: ConsolidatedViewCapabilityStatusEnum;
  inventory: ConsolidatedViewCapabilityStatusEnum;
};
