export type ChemicalConcentrationKind =
  | 'EXACT'
  | 'RANGE'
  | 'CONFIDENTIAL'
  | 'NOT_INFORMED'
  | 'UNDETERMINED';

export type ChemicalIngredientPayload = {
  chemicalName: string;
  cas?: string | null;
  concentrationKind: ChemicalConcentrationKind;
  exactPercent?: number | null;
  minPercent?: number | null;
  maxPercent?: number | null;
  riskFactorId?: string | null;
  sortOrder?: number;
};

export type ChemicalIngredientSummary = {
  id: string;
  chemicalName: string;
  cas: string | null;
  concentrationKind: ChemicalConcentrationKind;
  exactPercent: number | null;
  minPercent: number | null;
  maxPercent: number | null;
  riskFactorId: string | null;
  riskFactor?: ChemicalRiskOption | null;
};

export type ChemicalProductListItem = {
  id: string;
  companyId: string;
  workspaceId: string;
  tradeName: string;
  manufacturer: string | null;
  isPureSubstance: boolean;
  status: 'ACTIVE' | 'ARCHIVED';
  ingredientCount: number;
  compositionExactSum?: number;
  compositionIncomplete?: boolean;
  hasConfidentialIngredient?: boolean;
  hasUnlinkedIngredient?: boolean;
  ingredients?: ChemicalIngredientSummary[];
  activeComposition: {
    id: string;
    versionNumber: number;
    sourceType: string;
  } | null;
  activeFispq: {
    id: string;
    versionLabel: string | null;
    issuedAt: string | null;
    publishedForEmployees: boolean;
    publishedAt: string | null;
    file: { id: string; name: string; url: string } | null;
  } | null;
};

export type ChemicalRiskOption = {
  id: string;
  name: string;
  cas: string | null;
  system: boolean;
  companyId: string;
  type: string;
};

export type ParsedFispqIngredient = {
  chemicalName: string;
  cas: string | null;
  concentrationKind: ChemicalConcentrationKind;
  exactPercent: number | null;
  minPercent: number | null;
  maxPercent: number | null;
  sortOrder?: number;
  pending?: boolean;
  pendingReason?: string | null;
  riskFactorId?: string | null;
  riskFactor?: ChemicalRiskOption | null;
  matchStatus?: 'MATCHED' | 'NO_MATCH' | 'NO_CAS';
};

export type ParseFispqResult = {
  fileId: string;
  fileName: string;
  fileUrl: string;
  fileSize: number;
  extractable: boolean;
  message: string | null;
  persisted: false;
  preview: {
    tradeName: string | null;
    manufacturer: string | null;
    versionLabel: string | null;
    issuedAt: string | null;
    language: string | null;
    section3Text: string | null;
    ingredients: ParsedFispqIngredient[];
  } | null;
};

export type ChemicalProductDetail = ChemicalProductListItem & {
  documents: Array<{
    id: string;
    versionLabel: string | null;
    issuedAt: string | null;
    language: string | null;
    status: string;
    publishedForEmployees: boolean;
    publishedAt: string | null;
    file: { id: string; name: string; url: string; size: number };
  }>;
  compositionVersions: Array<{
    id: string;
    versionNumber: number;
    sourceType: string;
    status: string;
    ingredients: Array<{
      id: string;
      chemicalName: string;
      cas: string | null;
      concentrationKind: ChemicalConcentrationKind;
      exactPercent: number | null;
      minPercent: number | null;
      maxPercent: number | null;
      riskFactorId: string | null;
      riskFactor?: ChemicalRiskOption | null;
      sortOrder: number;
    }>;
  }>;
  compositionWarnings?: string[];
};

export type ChemicalExcelIssue = {
  sheet: string;
  row: number | null;
  field: string | null;
  receivedValue: string | null;
  normalizedValue: string | null;
  severity: 'ERROR' | 'WARNING';
  code: string;
  message: string;
  suggestedAction: string | null;
};

export type ChemicalExcelMatchCandidate = {
  riskFactorId: string;
  riskFactorName: string;
  officialCas: string | null;
  confidence: number;
  reason: string;
};

export type ChemicalExcelIngredientDecision =
  | 'AUTO'
  | 'MANUAL_LINK'
  | 'LEAVE_UNLINKED';

export type ChemicalExcelIngredientOverride = {
  groupKey: string;
  sourceRow: number;
  riskFactorId: string | null;
  decision: ChemicalExcelIngredientDecision;
};

export type ChemicalPrepareTargetField =
  | 'tradeName'
  | 'manufacturer'
  | 'component'
  | 'cas'
  | 'exactPercent'
  | 'minPercent'
  | 'maxPercent'
  | 'concentrationKind'
  | 'fispqVersion'
  | 'fispqDate'
  | 'language'
  | 'observation'
  | 'isPure';

export type ChemicalPrepareColumnMapping = Partial<
  Record<ChemicalPrepareTargetField, string | null>
>;

export type ChemicalPrepareAnalyzeResult = {
  persisted: false;
  fileName: string;
  sheets: Array<{
    name: string;
    score: number;
    headerCount: number;
    dataRowCount: number;
    headers: string[];
  }>;
  suggestedSheetName: string | null;
  sheetAmbiguous: boolean;
  selectedSheetName: string | null;
  headers: string[];
  mappingSuggestions: Array<{
    field: ChemicalPrepareTargetField;
    label: string;
    sourceHeader: string | null;
    confidence: number;
    autoDetected: boolean;
  }>;
  mapping: ChemicalPrepareColumnMapping;
  requiredFieldsMissing: ChemicalPrepareTargetField[];
  sampleRows: Array<Record<string, string>>;
};

export type ChemicalPrepareExportSummary = {
  totalSourceRows: number;
  totalOutputRows: number;
  products: number;
  components: number;
  autoLinkedByCas: number;
  autoLinkedByExactName: number;
  autoLinkedBySynonym: number;
  matchedEquivalence: number;
  reviewRequired: number;
  noMatch: number;
  invalidCas: number;
  officialCasFilled: number;
  officialCasPending: number;
  ignoredEmptyRows: number;
  ignoredDuplicateRows: number;
  readErrors: number;
};

export type ChemicalPreparePreviewResult = {
  persisted: false;
  fileName: string;
  layoutVersion: string;
  importLayoutVersion: string;
  sheetName: string;
  mapping: ChemicalPrepareColumnMapping;
  summary: ChemicalPrepareExportSummary;
  downloadReady: boolean;
  aiCurationEligibleCount?: number;
  pendingItems?: ChemicalAiCurationPendingItem[];
};

export type AiCurationSuggestionType =
  | 'EXISTING_RISK_MATCH'
  | 'CHEMICAL_IDENTITY'
  | 'SPLIT_COMPONENT'
  | 'INSUFFICIENT_EVIDENCE';

export type AiCurationConfidence = 'HIGH' | 'MEDIUM' | 'LOW';

export type AiCurationEvidence = {
  sourceType: 'INTERNAL_CATALOG' | 'EXTERNAL_SOURCE' | 'AI_REASONING';
  sourceName: string;
  sourceReference?: string | null;
  field: string;
  value: string | null;
  excerpt?: string | null;
  retrievedAt?: string | null;
};

export type AiChemicalCandidate = {
  riskFactorId?: string | null;
  officialName: string | null;
  cas: string | null;
  synonyms: string[];
  confidence: AiCurationConfidence;
  rationale: string;
  warnings: string[];
  evidences: AiCurationEvidence[];
  phase2IdentityProposalReady?: boolean;
};

export type AiCurationSuggestion = {
  sourceRowId: string;
  originalText: string;
  type: AiCurationSuggestionType;
  candidates: AiChemicalCandidate[];
  splitCandidates?: AiChemicalCandidate[];
  confidence: AiCurationConfidence;
  identityConfidence?: AiCurationConfidence;
  identityStatus?: 'confirmed' | 'probable' | 'insufficient';
  catalogLinkConfidence?: AiCurationConfidence;
  catalogLinkStatus?: 'exact' | 'class' | 'multiple' | 'none';
  rationale: string;
  requiresHumanConfirmation: true;
  identityCacheHit?: boolean;
  diagnostics?: {
    query: string;
    classification:
      | 'SINGLE_CHEMICAL'
      | 'MULTIPLE_CHEMICALS'
      | 'GENERIC_CLASS'
      | 'INSUFFICIENT_TEXT';
    variants: Array<{ value: string; source: string }>;
    attempts: ChemicalIdentitySearchAttempt[];
    candidateDiscards: Array<{ candidate: string; reason: string }>;
    internalMatches?: Array<{
      riskFactorName: string;
      matchedBy: 'name' | 'synonym' | 'cas';
      matchKind: 'exact' | 'class';
      reason: string;
    }>;
    finalReason: string;
    secondaryTradeHypothesis?: {
      cleanedTradeName: string;
      accepted: boolean;
      reason: string;
    } | null;
    identityResolution?: {
      aiExpansionUsed: boolean;
      usedTradeNameSecondary: boolean;
      conflict: boolean;
      conflictReason: string | null;
      confidenceFloor: 'HIGH' | 'MEDIUM' | 'LOW';
      coherenceWarnings?: string[];
      coherenceIssueKinds?: string[];
      pubChemCalls: number;
      cacheHits: number;
      hypothesisAttempts: Array<{
        query: string;
        source: string;
        outcome: string;
        preferredCas: string | null;
        selectedCid: string | null;
        cacheHit: boolean;
        reason: string;
      }>;
    } | null;
  };
};

export type ChemicalIdentitySearchAttempt = {
  query: string;
  provider: 'PUBCHEM';
  outcome:
    | 'NO_CID'
    | 'CID_FOUND'
    | 'CAS_WITH_PROVENANCE'
    | 'CAS_WITHOUT_PROVENANCE'
    | 'PROVIDER_ERROR'
    | 'SKIPPED';
  cids: string[];
  selectedCid?: string | null;
  preferredCas?: string | null;
  reason: string;
};

export type ChemicalAiCurationPendingItem = {
  sourceRowId: string;
  sourceRow: number;
  sourceSheet: string;
  tradeName: string;
  manufacturer: string | null;
  componentOriginal: string;
  componentNormalized: string;
  chemicalQueryText?: string | null;
  textClassification?:
    | 'SINGLE_CHEMICAL'
    | 'MULTIPLE_CHEMICALS'
    | 'GENERIC_CLASS'
    | 'INSUFFICIENT_TEXT'
    | null;
  casReceived: string | null;
  matchStatus: string;
  concentrationKindLabel: string;
  exactPercent: number | null;
  minPercent: number | null;
  maxPercent: number | null;
  observation: string | null;
  deterministicCandidates: Array<{
    riskFactorId: string;
    riskFactorName: string;
    officialCas: string | null;
    confidence: number;
    reason: string;
  }>;
  externalIdentity?: {
    query: string;
    chemicalQueryText?: string | null;
    classification?:
      | 'SINGLE_CHEMICAL'
      | 'MULTIPLE_CHEMICALS'
      | 'GENERIC_CLASS'
      | 'INSUFFICIENT_TEXT'
      | null;
    queryVariants?: string[];
    queryVariantDetails?: Array<{ value: string; source: string }>;
    searchAttempts?: ChemicalIdentitySearchAttempt[];
    candidateDiscards?: Array<{ candidate: string; reason: string }>;
    splitQueries: string[];
    matchedInternalRiskFactorIds: string[];
    /** Compat: somente preferredCas (nunca todos os RN). */
    allCasFromProvider: string[];
    preferredCas?: string | null;
    preferredCasList?: string[];
    registryNumbers?: Array<{
      value: string;
      source: string;
      sourceName?: string | null;
    }>;
    classMatchWarnings?: string[];
    internalMatchKind?: 'exact' | 'class' | 'none';
    evidences: AiCurationEvidence[];
    providerWarnings: string[];
    providerError?: string | null;
  } | null;
};

export type ChemicalAiCurationDecisionAction =
  | 'CONFIRM_EXISTING'
  | 'CONFIRM_SPLIT'
  | 'REJECT'
  | 'KEEP_UNLINKED'
  | 'MANUAL_FACTOR';

export type ChemicalAiCurationDecision = {
  sourceRowId: string;
  action: ChemicalAiCurationDecisionAction;
  riskFactorId?: string | null;
  officialName?: string | null;
  cas?: string | null;
  split?: Array<{
    officialName: string;
    cas?: string | null;
    riskFactorId?: string | null;
  }>;
  suggestionType?: AiCurationSuggestionType | null;
  confidence?: AiCurationConfidence | null;
  rationale?: string | null;
  evidences?: AiCurationEvidence[];
};

export type ChemicalAiCurationSuggestResult = {
  persisted: false;
  fileName: string;
  eligibleTotal: number;
  processedCount: number;
  skippedAlreadySafe: number;
  suggestions: AiCurationSuggestion[];
  failures: Array<{ sourceRowId: string; message: string }>;
  model: string | null;
  promptKey: string;
  promptSource: string;
  externalSourcesUsed: boolean;
  externalProvider?: 'PUBCHEM' | null;
  phase2ContractsReady: true;
};

export type ChemicalValidateSafeCasConsolidation = {
  productKey: string;
  tradeName: string;
  cas: string;
  survivorRow: number;
  absorbedRows: number[];
  keptComponentOriginal: string;
  keptOfficialName: string | null;
  aliases: string[];
  sourceRows: number[];
  sourceSheets: string[];
  absorbedDecisionLabels: string[];
  reason: 'SAFE_SAME_CAS';
};

export type ChemicalValidatePreviewResult = {
  persisted: false;
  fileName: string;
  sourceSheet: string;
  canProceedHint: boolean;
  correctedWorkbookAvailable?: boolean;
  consolidations?: ChemicalValidateSafeCasConsolidation[];
  summary: {
    components: number;
    products: number;
    autoLinkedByCas: number;
    autoLinkedByExactName: number;
    autoLinkedBySynonym: number;
    matchedEquivalence: number;
    reviewRequired: number;
    noMatch: number;
    userAddedCas: number;
    invalidCas: number;
    conflicts: number;
    accepted: number;
    corrected: number;
    pending: number;
    errors: number;
    warnings: number;
    infos: number;
    readyToImport: number;
    safeCasConsolidations?: number;
  };
  components: Array<{
    row: number;
    tradeName: string;
    manufacturer: string | null;
    componentOriginal: string;
    casEffective: string | null;
    casOfficial: string | null;
    userAddedCas: boolean;
    matchStatus: string | null;
    matchStatusLabel: string | null;
    riskFactorName: string | null;
    officialName: string | null;
    situation: string;
    componentStatus:
      | 'ACCEPTED'
      | 'CORRECTED'
      | 'PENDING'
      | 'CONFLICT'
      | 'ERROR';
    readyToImport: boolean;
    autoFixes: string[];
    issues: Array<{
      severity: 'ERROR' | 'WARNING' | 'INFO';
      code: string;
      message: string;
      row: number | null;
    }>;
  }>;
  issues: Array<{
    severity: 'ERROR' | 'WARNING' | 'INFO';
    code: string;
    message: string;
    row: number | null;
    field: string | null;
  }>;
};

export type ChemicalExcelImportPreview = {
  layoutVersion: string;
  fileName: string;
  persisted: false;
  canCommit: boolean;
  totals: {
    products: number;
    ingredients: number;
    errors: number;
    warnings: number;
    autoLinkedByCas: number;
    autoLinkedByExactName?: number;
    autoLinkedBySynonym?: number;
    matchedEquivalence?: number;
    reviewRequired?: number;
    noMatch?: number;
    withoutRiskFactor: number;
    possibleDuplicates: number;
  };
  products: Array<{
    groupKey: string;
    sourceRows: number[];
    tradeNameReceived: string;
    tradeNameNormalized: string;
    manufacturerNormalized: string | null;
    isPureSubstance: boolean;
    action: 'CREATE_NEW' | 'POSSIBLE_DUPLICATE' | 'SKIP_INVALID';
    similarProductName: string | null;
    groupingAmbiguous: boolean;
    compositionComplete: boolean;
    ingredients: Array<{
      sourceRows: number[];
      chemicalNameReceived: string;
      chemicalNameNormalized: string;
      casReceived?: string | null;
      casNormalized: string | null;
      officialCas?: string | null;
      concentrationKind: ChemicalConcentrationKind | null;
      exactPercent: number | null;
      minPercent: number | null;
      maxPercent: number | null;
      matchStatus: string;
      matchStatusLabel?: string;
      confidence?: number | null;
      linkSource?: 'AUTO' | null;
      decision?: ChemicalExcelIngredientDecision;
      riskFactorId: string | null;
      riskFactorName: string | null;
      officialRiskName: string | null;
      candidates?: ChemicalExcelMatchCandidate[];
      issues: ChemicalExcelIssue[];
    }>;
    issues: ChemicalExcelIssue[];
  }>;
  issues: ChemicalExcelIssue[];
};
