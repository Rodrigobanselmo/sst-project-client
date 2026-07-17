export type ChemicalDialogCloseReason =
  | 'backdropClick'
  | 'escapeKeyDown'
  | 'closeButton'
  | string;

/**
 * Pure close policy for chemical inventory dialogs.
 * - backdrop never closes while there is a draft
 * - ESC / Cancel never discard silently when dirty
 */
export function resolveChemicalDialogClose(params: {
  reason: ChemicalDialogCloseReason;
  hasDraft: boolean;
  userConfirmedDiscard: boolean;
}): 'keep-open' | 'ask-confirm' | 'close' {
  const { reason, hasDraft, userConfirmedDiscard } = params;

  if (reason === 'backdropClick') {
    return hasDraft ? 'keep-open' : 'close';
  }

  if (reason === 'escapeKeyDown' || reason === 'closeButton') {
    if (!hasDraft) return 'close';
    return userConfirmedDiscard ? 'close' : 'ask-confirm';
  }

  if (!hasDraft) return 'close';
  return userConfirmedDiscard ? 'close' : 'ask-confirm';
}
