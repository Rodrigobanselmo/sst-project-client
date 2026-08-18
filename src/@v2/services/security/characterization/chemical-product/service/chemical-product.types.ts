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

export type ChemicalCompositionDisclosure =
  | 'DECLARED'
  | 'PARTIAL'
  | 'UNINDIVIDUALIZED';

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
    compositionDisclosure?: ChemicalCompositionDisclosure | null;
    compositionDisclosureNote?: string | null;
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
    aiContext?: {
      sections: {
        section2?: string;
        section8?: string;
        section10?: string;
        section11?: string;
      };
      excerpt?: string;
      truncated: boolean;
      charCount: number;
    };
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
    compositionDisclosure?: ChemicalCompositionDisclosure | null;
    compositionDisclosureNote?: string | null;
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

/** Identidade química confirmada/corrigida (opcional; payloads legados omitem). */
export type ChemicalAiCurationIdentity = {
  officialName: string;
  cas?: string | null;
  synonyms?: string[];
  origin: 'AI' | 'HUMAN';
  manualSource?: string;
  manualJustification?: string;
  originalSuggestion?: {
    officialName?: string;
    cas?: string | null;
  };
};

export type ChemicalAiCurationSplitPartResolution = {
  action: 'MANUAL_FACTOR' | 'KEEP_UNLINKED' | 'REJECT_PART';
  riskFactorId?: string;
};

/**
 * Parte de CONFIRM_SPLIT.
 * Legado: apenas officialName + cas? + riskFactorId?.
 * Novo: identity / resolution / partId / include / originalText.
 */
export type ChemicalAiCurationSplitPart = {
  partId?: string;
  /** Ausente no legado = incluída. */
  include?: boolean;
  originalText?: string;
  officialName?: string;
  cas?: string | null;
  riskFactorId?: string | null;
  identity?: ChemicalAiCurationIdentity;
  resolution?: ChemicalAiCurationSplitPartResolution;
};

export type ChemicalAiCurationDecision = {
  sourceRowId: string;
  action: ChemicalAiCurationDecisionAction;
  riskFactorId?: string | null;
  officialName?: string | null;
  cas?: string | null;
  /** Identidade manual/confirmada no item (opcional; legado omitido). */
  identity?: ChemicalAiCurationIdentity;
  split?: ChemicalAiCurationSplitPart[];
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

export type ChemicalOccupationalApplyStatus =
  | 'APPLY_SAFE'
  | 'UNIT_REVIEW_REQUIRED'
  | 'UNPARSEABLE'
  | 'NOT_FOUND';

export type ChemicalOccupationalConversionVerification =
  | 'CONVERSION_VERIFIED'
  | 'UNIT_REVIEW_REQUIRED'
  | 'NOT_APPLICABLE';

export type ChemicalOccupationalAlternateRepresentation = {
  numeric: string;
  unit: string;
  rawFragment: string;
};

export type ChemicalOccupationalConversionTrace = {
  molecularWeight: number;
  molecularWeightSource: 'PUBCHEM' | 'OSHA_CHEMICAL_DB';
  molecularWeightSourceUrl: string | null;
  temperatureC: number;
  pressureAtm: number;
  formula: string;
  originalValue: string;
  originalUnit: string;
  convertedValue: string;
  convertedUnit: string;
  verificationStatus: ChemicalOccupationalConversionVerification;
  publishedAlternate: string | null;
  calculatedAlternate: string | null;
  relativeError: number | null;
};

export type ChemicalOccupationalValue = {
  /** Expressão bruta da fonte (evidência / UI). */
  value: string;
  /** Número para o campo RiskFactor — nunca "400 ppm (1200 mg/m³)". */
  formValue: string | null;
  unit: string | null;
  applyStatus: ChemicalOccupationalApplyStatus;
  primaryUnitFromSource?: string | null;
  alternateRepresentations?: ChemicalOccupationalAlternateRepresentation[];
  source: 'NIOSH_POCKET_GUIDE' | 'OSHA_OCCUPATIONAL_CHEMICAL_DB';
  sourceName: string;
  sourceUrl: string | null;
  sourceField?: string;
  retrievedAt: string;
  raw: string;
  numericValue?: string | null;
  hasMultipleUnits?: boolean;
  notes?: string | null;
  conversion?: ChemicalOccupationalConversionTrace | null;
  conversionVerification?: ChemicalOccupationalConversionVerification | null;
};

export type ChemicalOccupationalSearchStatus =
  | 'FOUND'
  | 'NOT_FOUND'
  | 'REVIEW_REQUIRED'
  | 'INCOMPLETE';

export type ChemicalOccupationalSearchAudit = {
  v: 1;
  status: ChemicalOccupationalSearchStatus;
  searchedAt: string;
  cas: string;
  sourcesConsulted: string[];
  providers: Array<{
    provider: string;
    outcome: string;
    reason: string;
  }>;
  summary: {
    hasAnyLimit: boolean;
    unitReviewRequired: boolean;
    message: string | null;
  };
};

export type ChemicalOccupationalEnrichResult = {
  identity: {
    cas: string;
    officialName: string | null;
  };
  occupationalData: {
    cas: string;
    queriedName: string | null;
    matchKind: 'CAS' | 'NAME' | 'NONE';
    matchConfidence: 'HIGH' | 'MEDIUM' | 'LOW';
    niosh: {
      relTwa: ChemicalOccupationalValue | null;
      stel: ChemicalOccupationalValue | null;
      ceiling: ChemicalOccupationalValue | null;
      idlh: ChemicalOccupationalValue | null;
      unit: string | null;
      respirator: ChemicalOccupationalValue | null;
      sourceName: string;
      sourceUrl: string | null;
      pocketGuideName: string | null;
      notes: string | null;
      found: boolean;
    } | null;
    osha: {
      pel: ChemicalOccupationalValue | null;
      stel: ChemicalOccupationalValue | null;
      ceiling: ChemicalOccupationalValue | null;
      unit: string | null;
      sourceName: string;
      sourceUrl: string | null;
      analyteName: string | null;
      notes: string | null;
      found: boolean;
    } | null;
    suggestedUnit: string | null;
    targetUnit?: string | null;
    unitConflict: boolean;
    unitReviewRequired?: boolean;
    unitConflictDetails: string[];
    molecularWeight?: {
      molecularWeight: number;
      source: 'PUBCHEM' | 'OSHA_CHEMICAL_DB';
      sourceUrl: string | null;
      sourceField: string;
    } | null;
    attempts: Array<{
      provider: string;
      query: string;
      matchKind: string;
      outcome: string;
      reason: string;
    }>;
    warnings: string[];
    traces: Array<{
      riskField: string;
      source: string;
      sourceName: string;
      sourceField: string;
      raw: string;
      normalizedValue: string;
      formValue?: string | null;
      numericValue: string | null;
      unit: string | null;
      applyStatus?: ChemicalOccupationalApplyStatus;
      hasMultipleUnits: boolean;
      alternateRepresentations?: ChemicalOccupationalAlternateRepresentation[];
      sourceUrl: string | null;
      conversion?: ChemicalOccupationalConversionTrace | null;
      conversionVerification?: ChemicalOccupationalConversionVerification | null;
    }>;
    notFoundMessage: string | null;
    retrievedAt: string;
  };
  prefill: {
    nioshRel: string | null;
    nioshStel: string | null;
    nioshCeiling: string | null;
    ipvs: string | null;
    oshaPel: string | null;
    oshaStel: string | null;
    oshaCeiling: string | null;
    unit: string | null;
    breather: string | null;
    json: {
      ipvs?: {
        unit?: string;
        reference?: string;
        origin?: string;
      };
      occupationalSearch?: ChemicalOccupationalSearchAudit;
    } | null;
  };
  sourcesConsulted: Array<
    'NIOSH_POCKET_GUIDE' | 'OSHA_OCCUPATIONAL_CHEMICAL_DB'
  >;
  enabled: boolean;
  searchAudit: ChemicalOccupationalSearchAudit;
  searchAuditPersisted?: boolean;
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

export type ChemicalSurveyStatus =
  | 'RASCUNHO'
  | 'LEVANTAMENTO_EM_ANDAMENTO'
  | 'LEVANTAMENTO_CONCLUIDO'
  | 'AGUARDANDO_ANALISE_TECNICA';

export type ChemicalUseScenarioBoardKind = 'SCENARIO' | 'PENDING_SURVEY';

export type ChemicalUseScenarioPresentationStatus =
  | ChemicalSurveyStatus
  | 'PENDENTE_DE_LEVANTAMENTO';

export type ChemicalSurveyPreviewSourceRawLine = {
  sourceRow: number;
  component: string | null;
  percentRaw: string | null;
  tradeName: string;
  manufacturer: string | null;
};

export type ChemicalUseScenarioActivityRiskFactor = {
  id: string;
  name: string;
  cas: string | null;
  system: boolean;
  companyId: string;
  type: string;
};

export type ChemicalUseScenarioActivityRiskResolution =
  | {
      status: 'RESOLVED';
      resolution: 'SOURCE_ROW' | 'CHEMICAL_SOURCE_KEY';
      sourceRow: number;
      component: string | null;
      componentOriginal: string | null;
      ingredientId: string;
      riskFactor: ChemicalUseScenarioActivityRiskFactor;
    }
  | {
      status: 'UNRESOLVED';
      resolution: 'NO_MATCH' | 'AMBIGUOUS' | 'UNLINKED';
      sourceRow: number;
      component: string | null;
      componentOriginal: string | null;
      ingredientId: string | null;
      riskFactor: null;
    };

export type ChemicalUseScenarioListItem = {
  id: string;
  chemicalProductId: string;
  surveyStatus: ChemicalSurveyStatus;
  activityName: string | null;
  sectorSnapshot: string | null;
  exposureGroupSnapshot: string | null;
  exposedRolesSnapshot: string | null;
  frequencyCount: number | null;
  frequencyPeriod: string | null;
  durationMinutes: number | null;
  quantity: string | null;
  quantityUnit: string | null;
  peakContactMoment: string | null;
  controlMeasures: string | null;
  linachHint: string | null;
  relevanceHint: string | null;
  sourceSheet: string | null;
  sourceRows: number[];
  sourceProductLabel: string | null;
  sourceRaw: {
    lines: ChemicalSurveyPreviewSourceRawLine[];
  } | null;
  activityRiskOrigin?: 'TECHNICAL_PROVENANCE' | 'PRODUCT_COMPOSITION';
  activityRiskResolutions?: ChemicalUseScenarioActivityRiskResolution[];
  activityRiskFactors?: ChemicalUseScenarioActivityRiskFactor[];
  product: {
    id: string;
    tradeName: string;
    manufacturer: string | null;
    isPureSubstance: boolean;
    status: string;
    activeComposition: {
      id: string;
      compositionDisclosure?: ChemicalCompositionDisclosure | null;
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
        importTrace?: {
          sourceRow?: number | null;
          sourceSheet?: string | null;
          componentOriginal?: string | null;
          chemicalSourceKey?: string | null;
        } | null;
      }>;
    } | null;
  };
};

export type ChemicalUseScenarioBoardRow = Omit<
  ChemicalUseScenarioListItem,
  'surveyStatus'
> & {
  kind: ChemicalUseScenarioBoardKind;
  surveyStatus: ChemicalSurveyStatus | null;
  presentationStatus: ChemicalUseScenarioPresentationStatus;
};

export type ChemicalSurveyProductKeyMapEntry = {
  tradeName: string;
  manufacturer?: string | null;
  chemicalProductId: string;
};

export type ChemicalSurveyPreviewScenario = {
  clusterKey: string;
  productResolution: 'MATCH_UNIQUE' | 'MATCH_AMBIGUOUS' | 'MATCH_NOT_FOUND';
  automaticResolution?: 'MATCH_UNIQUE' | 'MATCH_AMBIGUOUS' | 'MATCH_NOT_FOUND';
  resolutionSource?: 'AUTOMATIC' | 'MANUAL' | null;
  chemicalProductId: string | null;
  productCandidates: Array<{
    id: string;
    tradeName: string;
    manufacturer: string | null;
  }>;
  productKey: string;
  tradeName: string;
  manufacturer: string | null;
  activityName: string | null;
  sectorSnapshot: string | null;
  exposureGroupSnapshot: string | null;
  exposedRolesSnapshot: string | null;
  frequencyCount: number | null;
  frequencyPeriod: string | null;
  durationMinutes: number | null;
  quantity: string | null;
  quantityUnit: string | null;
  peakContactMoment: string | null;
  controlMeasures: string | null;
  linachHint: string | null;
  relevanceHint: string | null;
  sourceSheet: string;
  sourceRows: number[];
  sourceProductLabel: string;
  sourceRaw: {
    lines: ChemicalSurveyPreviewSourceRawLine[];
  };
  canCommit: boolean;
  blockers: string[];
};

export type ChemicalSurveyImportPreview = {
  mode: 'SURVEY';
  fileName: string;
  sheetName: string;
  summary: {
    sourceRows: number;
    scenarioClusters: number;
    matchUnique: number;
    matchAmbiguous: number;
    matchNotFound: number;
    canCommitCount: number;
    blockedCount: number;
  };
  scenarios: ChemicalSurveyPreviewScenario[];
  productKeys: Array<{
    productKey: string;
    tradeName: string;
    manufacturer: string | null;
    resolution: string;
    chemicalProductId: string | null;
  }>;
};
