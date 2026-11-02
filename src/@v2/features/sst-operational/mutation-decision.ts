export type SstDecision = {
  intent: 'CORRECTION' | 'NEW_CONDITION';
  effectiveFrom: string;
  reason: string;
  expectedHead: string;
};
export type SstDecisionRequest = {
  companyId?: string;
  expectedHead: string;
  message?: string;
  affectedEmployments?: number;
};

export class SstMutationCancelledError extends Error {
  readonly code = 'SST_MUTATION_CANCELLED';

  constructor() {
    super('Alteração cancelada. Confira os dados antes de salvar novamente.');
  }
}

export function isSstMutationCancelled(error: unknown): boolean {
  return Boolean(
    error &&
      typeof error === 'object' &&
      'code' in error &&
      error.code === 'SST_MUTATION_CANCELLED',
  );
}

export function askSstDecision(
  request: string | SstDecisionRequest,
): Promise<SstDecision> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined')
      return reject(new Error('A alteração exige decisão sobre o período.'));
    window.dispatchEvent(
      new CustomEvent('sst-condition-decision', {
        detail: {
          ...(typeof request === 'string'
            ? { expectedHead: request }
            : request),
          resolve,
          reject,
        },
      }),
    );
  });
}
