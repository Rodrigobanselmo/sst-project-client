export function appendTranscribedGuidance(
  current: string,
  transcription: string,
): string {
  const next = transcription.trim();
  if (!next) return current;
  const previous = current.trimEnd();
  if (!previous) return next;
  return `${previous}\n${next}`;
}
