export function replaceSubstring(
  originalString: string,
  offset: number,
  length: number,
  replacementText: string,
): string {
  return (
    originalString.substring(0, offset) +
    replacementText +
    originalString.substring(offset + length)
  );
}
