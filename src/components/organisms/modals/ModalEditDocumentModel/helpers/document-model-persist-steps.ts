export type DocumentModelPersistStep = 'metadata' | 'content';

export function planDocumentModelPersistSteps(args: {
  hasModelId: boolean;
  isMetadataDirty: boolean;
  documentDirty: boolean;
}): DocumentModelPersistStep[] {
  if (!args.hasModelId) return ['metadata'];

  const steps: DocumentModelPersistStep[] = [];
  if (args.isMetadataDirty) steps.push('metadata');
  if (args.documentDirty) steps.push('content');
  return steps;
}

/** Combined persist actions should emit a single success snackbar from the final step. */
export function shouldSuppressMetadataPersistSuccessSnackbar(
  steps: DocumentModelPersistStep[],
): boolean {
  return steps.includes('metadata') && steps.includes('content');
}
