/**
 * Recovery of leftover unsaved state from a PREVIOUS editor session.
 * Distinct from current-session dirty and from 409 optimistic lock.
 */
export const DOCUMENT_MODEL_RECOVERY_CONTINUE_ACTION = 'Continuar editando';

export function shouldPromptDocumentModelRecovery(args: {
  leftoverUnsavedOnOpen: boolean;
  recoveryAlreadyResolved: boolean;
  saveInProgress: boolean;
}): boolean {
  if (args.recoveryAlreadyResolved) return false;
  if (args.saveInProgress) return false;
  return args.leftoverUnsavedOnOpen;
}

/** Continuar editando never persists. It only dismisses the prompt. */
export function documentModelRecoveryContinuePersists(): false {
  return false;
}
