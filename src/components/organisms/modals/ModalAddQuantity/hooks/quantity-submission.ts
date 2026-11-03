/** Keep the editor/draft until its actual save callback settles. A temporal
 * decision cancelled by the author is not a successful save or an unhandled
 * browser exception; all other failures remain visible to the caller. */
export async function submitQuantityCallback({
  save,
  close,
  isCancelled,
}: {
  save: () => unknown | Promise<unknown>;
  close: () => void;
  isCancelled: (error: unknown) => boolean;
}): Promise<'SAVED' | 'CANCELLED'> {
  try {
    await save();
  } catch (error) {
    if (isCancelled(error)) return 'CANCELLED';
    throw error;
  }
  close();
  return 'SAVED';
}
