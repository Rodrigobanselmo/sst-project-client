import type { IRiskData } from 'core/interfaces/api/IRiskData';
import type { Result } from '@v2/services/security/characterization/characterization/ai-analyze-characterization/service/ai-analyze-characterization.types';
import type { RiskFactorAiScopeRequest } from '../risk-factors-ai-scope.util';
import type { RiskFactorAiPendingSuggestion } from '../risk-factor-ai-pending.util';
import type { AiRiskOccurrenceIdentity } from './ai-risk-occurrence.identity';

export type RiskByOccurrenceAiCandidate = Partial<
  Omit<IRiskData, 'startDate' | 'endDate' | 'probabilityAuthority'>
> & {
  startDate?: Date | string | null;
  endDate?: Date | string | null;
  probabilityAuthority?: unknown;
};

export type RiskByOccurrenceAiAdapter = {
  identity: AiRiskOccurrenceIdentity;
  row: IRiskData;
  canApproveProbability: (row: RiskByOccurrenceAiCandidate) => boolean;
  activate: () => void;
  isResponseCurrent: (result: Result) => boolean;
  validate: (row: RiskByOccurrenceAiCandidate) => boolean;
  subscribeInactive: (close: () => void) => () => void;
  analyze: (
    request: RiskFactorAiScopeRequest,
    signal: AbortSignal,
  ) => Promise<Result>;
  prepareAcceptance: (
    suggestion: RiskFactorAiPendingSuggestion,
    row: RiskByOccurrenceAiCandidate,
  ) => { isActive: () => boolean; beforeWrite: () => Promise<boolean> } | null;
  readSavedRow: () => Promise<IRiskData | undefined>;
};
