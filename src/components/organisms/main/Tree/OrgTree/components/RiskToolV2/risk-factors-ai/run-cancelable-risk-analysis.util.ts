/** Guards dispatch and incorporation, including StrictMode cleanup and late responses. */
export async function runCancelableRiskAnalysis<T>(
  signal: AbortSignal,
  run: () => Promise<T>,
  apply: (result: T) => void,
): Promise<void> {
  await Promise.resolve();
  if (signal.aborted) return;
  const result = await run();
  if (!signal.aborted) apply(result);
}
