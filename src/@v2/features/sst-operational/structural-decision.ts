import type {
  StructuralAction,
  StructuralTarget,
} from './structural-review-model';
export type StructuralDecisionRequest = {
  companyId: string;
  target: StructuralTarget;
  action?: StructuralAction;
  effectiveFrom?: string;
  resolve: (result: unknown) => void;
  reject: (failure: Error) => void;
};
export function askStructuralDecision(
  input: Omit<StructuralDecisionRequest, 'resolve' | 'reject'>,
): Promise<any> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined')
      return reject(
        new Error(
          'Este cadastro exige uma revisão do período antes de ser encerrado.',
        ),
      );
    window.dispatchEvent(
      new CustomEvent('sst-structural-decision', {
        detail: { ...input, resolve, reject },
      }),
    );
  });
}
