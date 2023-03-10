interface Replacement {
  offset: number;
  length: number;
  replacementText: string;
}

export function replaceMultiple(
  originalString: string,
  replacements: Replacement[],
): string {
  let newString = originalString;

  for (let i = 0; i < replacements.length; i++) {
    const replacement = replacements[i];
    newString =
      newString.slice(0, replacement.offset) +
      replacement.replacementText +
      newString.slice(replacement.offset + replacement.length);
    if (replacements[i + 1])
      replacements[i + 1].offset =
        replacements[i + 1].offset + (newString.length - originalString.length);
  }

  return newString;
}
