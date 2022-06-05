export interface IProbability {
  id: string;
  intensity?: number;
  intensityResult?: number;
  intensityLt?: number;
  minDurationJT?: number;
  minDurationEO?: number;
  chancesOfHappening?: number;
  frequency?: number;
  history?: number;
  medsImplemented?: number;
  riskFactorDataAfterId?: string;
  riskFactorDataId?: string;
  riskId?: string;
  riskFactorGroupDataId?: number;
}
