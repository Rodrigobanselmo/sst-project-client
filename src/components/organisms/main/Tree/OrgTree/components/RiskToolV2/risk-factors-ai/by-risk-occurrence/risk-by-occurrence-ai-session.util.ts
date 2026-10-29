import type { AiRiskAnalysisSessionSnapshot } from 'components/organisms/modals/ModalAddCharacterization/utils/ai-risk-analysis-session-storage.util';
import {
  AiRiskOccurrenceIdentity,
  aiRiskOccurrenceContextKey,
  createAiRiskOccurrenceIdentity,
} from './ai-risk-occurrence.identity';

/** Same pending-review/acceptance keys as the published flow. No new-risk suggestions. */
export type RiskOccurrenceAiPendingState = Pick<
  AiRiskAnalysisSessionSnapshot,
  | 'existingRiskReviews'
  | 'appliedModularSuggestionKeys'
  | 'dismissedModularSuggestionKeys'
  | 'userGuidance'
>;
export type OccurrenceSessionStorage = Pick<Storage, 'getItem' | 'setItem'>;
export type RiskOccurrenceAiOperation = Readonly<{
  identity: AiRiskOccurrenceIdentity;
  key: string;
  signal: AbortSignal;
  isCurrent: () => boolean;
}>;
export type RiskOccurrenceAcceptanceLease = Readonly<{
  identity: AiRiskOccurrenceIdentity;
  isCurrent: () => boolean;
}>;

/** One instance per by-risk modal. Prepared infrastructure, not mounted in the UI in stage 1. */
export class RiskByOccurrenceAiSession {
  private readonly listeners = new Set<() => void>();
  private active: AiRiskOccurrenceIdentity | null = null;
  private contextRevision = 0;
  private operationRevision = 0;
  private operation?: AbortController;
  private readonly memory = new Map<string, string>();
  private disposed = false;
  private readonly operations = new WeakSet<object>();
  private readonly leases = new WeakSet<object>();
  private readonly started = new WeakSet<object>();

  constructor(private readonly storage?: OccurrenceSessionStorage) {}

  activate(identity: AiRiskOccurrenceIdentity | null): void {
    if (this.disposed) throw new Error('SESSION_DISPOSED');
    const next = identity ? createAiRiskOccurrenceIdentity(identity) : null;
    if (
      (this.active ? aiRiskOccurrenceContextKey(this.active) : null) ===
      (next ? aiRiskOccurrenceContextKey(next) : null)
    )
      return;
    this.cancelOperation();
    this.contextRevision++;
    this.active = next;
    this.listeners.forEach((listener) => listener());
  }

  isActive(identity: AiRiskOccurrenceIdentity): boolean {
    return (
      !this.disposed &&
      !!this.active &&
      aiRiskOccurrenceContextKey(this.active) ===
        aiRiskOccurrenceContextKey(identity)
    );
  }

  subscribe(listener: () => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  cancelOperation(): void {
    this.operation?.abort();
    this.operation = undefined;
    this.operationRevision++;
    // Pending sessions are deliberately left intact.
  }

  startOperation(): RiskOccurrenceAiOperation {
    if (!this.active || this.disposed) throw new Error('NO_ACTIVE_OCCURRENCE');
    this.cancelOperation();
    const controller = new AbortController();
    this.operation = controller;
    const revision = this.operationRevision;
    const contextRevision = this.contextRevision;
    const identity = this.active;
    const operation = Object.freeze({
      identity,
      key: aiRiskOccurrenceContextKey(identity),
      signal: controller.signal,
      isCurrent: () =>
        !this.disposed &&
        !controller.signal.aborted &&
        revision === this.operationRevision &&
        contextRevision === this.contextRevision,
    });
    this.operations.add(operation);
    return operation;
  }

  async run<T>(
    operation: RiskOccurrenceAiOperation,
    work: (
      identity: AiRiskOccurrenceIdentity,
      signal: AbortSignal,
    ) => Promise<T>,
    apply: (result: T) => void,
  ): Promise<'applied' | 'cancelled'> {
    if (!this.operations.has(operation) || this.started.has(operation))
      return 'cancelled';
    this.started.add(operation);
    await Promise.resolve();
    if (!operation.isCurrent()) return 'cancelled';
    try {
      const result = await work(operation.identity, operation.signal);
      if (!this.operations.has(operation) || !operation.isCurrent())
        return 'cancelled';
      apply(result);
      return 'applied';
    } catch (error) {
      if (!this.operations.has(operation) || !operation.isCurrent())
        return 'cancelled';
      throw error;
    }
  }

  /** Capture before a confirmation; changing away and back still invalidates this lease. */
  captureAcceptance(
    analysisIdentity: AiRiskOccurrenceIdentity,
    suggestion: { riskId: string; riskFactorDataId?: string },
  ): RiskOccurrenceAcceptanceLease | null {
    const identity = createAiRiskOccurrenceIdentity(analysisIdentity);
    if (
      !this.active ||
      this.disposed ||
      aiRiskOccurrenceContextKey(this.active) !==
        aiRiskOccurrenceContextKey(identity) ||
      suggestion.riskId !== identity.riskId ||
      suggestion.riskFactorDataId !== identity.riskFactorDataId
    )
      return null;
    const revision = this.contextRevision;
    const lease = Object.freeze({
      identity,
      isCurrent: () =>
        !this.disposed &&
        revision === this.contextRevision &&
        !!this.active &&
        aiRiskOccurrenceContextKey(this.active) ===
          aiRiskOccurrenceContextKey(identity),
    });
    this.leases.add(lease);
    return lease;
  }

  /** Call after human confirmation, immediately before the EXISTING write mechanism. No writes here. */
  async canAccept(
    lease: RiskOccurrenceAcceptanceLease,
    revalidate: (
      identity: AiRiskOccurrenceIdentity,
    ) => Promise<
      | { eligible: false }
      | { eligible: true; identity: AiRiskOccurrenceIdentity }
    >,
  ): Promise<boolean> {
    if (!this.leases.has(lease) || !lease.isCurrent()) return false;
    const result = await revalidate(lease.identity);
    return (
      result.eligible &&
      aiRiskOccurrenceContextKey(result.identity) ===
        aiRiskOccurrenceContextKey(lease.identity) &&
      lease.isCurrent()
    );
  }

  saveOperationPending(
    operation: RiskOccurrenceAiOperation,
    state: RiskOccurrenceAiPendingState,
  ): boolean {
    if (!this.operations.has(operation) || !operation.isCurrent()) return false;
    this.savePending(operation.identity, state);
    return true;
  }

  savePending(
    identity: AiRiskOccurrenceIdentity,
    state: RiskOccurrenceAiPendingState,
  ): void {
    const id = createAiRiskOccurrenceIdentity(identity);
    const key = aiRiskOccurrenceContextKey(id);
    const snapshot = {
      ...state,
      existingRiskReviews: state.existingRiskReviews.filter(
        (review) =>
          review.riskId === id.riskId &&
          review.riskFactorDataId === id.riskFactorDataId,
      ),
    };
    const value = JSON.stringify({ version: 1, key, state: snapshot });
    this.memory.set(key, value);
    try {
      this.storage?.setItem(key, value);
    } catch {
      /* Unavailable storage retains the in-modal snapshot. */
    }
  }

  readPending(
    identity: AiRiskOccurrenceIdentity,
  ): RiskOccurrenceAiPendingState | null {
    const id = createAiRiskOccurrenceIdentity(identity);
    const key = aiRiskOccurrenceContextKey(id);
    let value = this.memory.get(key);
    try {
      value = value ?? this.storage?.getItem(key) ?? undefined;
    } catch {
      /* Memory fallback. */
    }
    if (!value) return null;
    try {
      const envelope = JSON.parse(value);
      const state = envelope.state as RiskOccurrenceAiPendingState;
      if (
        envelope.version !== 1 ||
        envelope.key !== key ||
        !state ||
        !Array.isArray(state.existingRiskReviews) ||
        !Array.isArray(state.appliedModularSuggestionKeys) ||
        !Array.isArray(state.dismissedModularSuggestionKeys) ||
        typeof state.userGuidance !== 'string'
      )
        return null;
      return {
        ...state,
        existingRiskReviews: state.existingRiskReviews.filter(
          (review) =>
            review &&
            review.riskId === id.riskId &&
            review.riskFactorDataId === id.riskFactorDataId,
        ),
      };
    } catch {
      return null;
    }
  }

  dispose(): void {
    this.cancelOperation();
    this.contextRevision++;
    this.active = null;
    this.disposed = true;
  }
}

/** Resolve lazily on mount; no access to window on module import / SSR. */
export function createRiskByOccurrenceAiSession(): RiskByOccurrenceAiSession {
  try {
    return new RiskByOccurrenceAiSession(
      typeof window === 'undefined' ? undefined : window.sessionStorage,
    );
  } catch {
    return new RiskByOccurrenceAiSession();
  }
}
