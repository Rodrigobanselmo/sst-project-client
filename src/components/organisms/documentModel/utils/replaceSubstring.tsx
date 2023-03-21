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

export function replaceLink(
  originalString: string,
  offset: number,
  length: number,
) {
  return (
    <>
      {originalString.substring(0, offset)}{' '}
      <span style={{ color: 'blueviolet', textDecoration: 'underline' }}>
        {originalString.substring(offset, offset + length)}
      </span>{' '}
      {originalString.substring(offset + length)}
    </>
  );
}
