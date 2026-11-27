export type Metric = {
  score: number | null;
  respondents: number | null;
  selections: number | null;
  protected: boolean;
};
export type Indicator = Metric & {
  key: string;
  id: string;
  name: string;
  questionIds: string[];
  scaleId?: string;
};
export type Performance = {
  total: number;
  responded: number;
  pending: number;
  adherence: number | null;
};
export type PsychReport = {
  organizationalPerformance: (Performance & {
    id: string;
    name: string;
    type: string;
  })[];
  registeredMeasures: {
    sector: string;
    risk: string;
    type: string;
    accepted: boolean;
    name: string | null;
    origin: string | null;
  }[];
  matrix: {
    probability: number;
    cells: { severity: number; level: number }[];
  }[];
  factorLinks: {
    id: string;
    name: string;
    questions: string[];
    dimensions: string[];
  }[];
  profile: {
    id: string;
    text: string;
    distributionProtected: boolean;
    options: { text: string; percentage: number; count: number }[];
  }[];
  method: string;
  title: string;
  applicationId: string;
  formId: string;
  formName: string;
  companyId: string;
  seriesId: string | null;
  cycleNumber: number | null;
  startedAt: string | null;
  endedAt: string | null;
  asOf: string;
  unit: { key: string; name: string };
  performance: Performance;
  submissions: number | null;
  participationGoal: number | null;
  scales: Indicator[];
  dimensions: Indicator[];
  sectors: (Performance &
    Metric & {
      id: string;
      name: string;
      anonymityMinimum: number;
      anonymityBlocked: boolean;
      dimensionScores: (Metric & { key: string; name: string })[];
    })[];
  evolution: { date: string; newResponses: number }[];
  groups: {
    id: string;
    name: string;
    questions: (Metric & {
      id: string;
      text: string;
      type: string;
      responseCount: number | null;
      distributionProtected: boolean;
      options: {
        id: string;
        text: string;
        value: number | null;
        count: number;
        percentage: number;
      }[];
    })[];
  }[];
  factors: {
    entityId: string;
    entity: string;
    establishment: string;
    riskId: string;
    name: string;
    probabilitySource: string;
    scopeProtected: boolean;
    severity: number | null;
    probability: number | null;
    level: number | null;
    protected: boolean;
    inInventory: boolean;
  }[];
  hierarchyGroups: (Performance & {
    id: string;
    name: string;
    sectorCount: number;
    hierarchyIds: string[];
    members: { id: string; name: string }[];
    anonymityMinimum: number;
    anonymityBlocked: boolean;
    scopeProtected: boolean;
  })[];
  questionnaireDigest: string;
  warnings: string[];
};
export type PsychComparison = {
  risks?: {
    entity: string;
    name: string;
    before: number | null;
    after: number | null;
    beforeProbability: number | null;
    afterProbability: number | null;
    severityChanged: boolean | null;
    status: string;
  }[];
  available: boolean;
  reason?: string;
  beforeTitle?: string;
  beforeCreatedAt?: string;
  scales?: {
    name: string;
    before: number | null;
    after: number | null;
    delta: number | null;
  }[];
  dimensions?: {
    name: string;
    before: number | null;
    after: number | null;
    delta: number | null;
  }[];
  adherence?: {
    before: number | null;
    after: number | null;
    delta: number | null;
  };
};
export type PsychContext = {
  units: { key: string; name: string }[];
  snapshot: PsychReport;
  versions: {
    id: string;
    createdAt: string;
    unit: { key: string; name: string };
  }[];
  comparison: PsychComparison;
};
