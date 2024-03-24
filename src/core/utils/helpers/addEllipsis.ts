export function addEllipsisIfNeeded(
  text: string,
  maxLength: number,
  atEnd = true,
  middlePosition: number = Math.floor(text.length / 2),
): string {
  if (text.length <= maxLength) {
    return text;
  }

  if (atEnd) {
    return text.substring(0, maxLength) + '...';
  } else {
    if (middlePosition < 0 || middlePosition >= text.length) {
      throw new Error('Invalid middle position');
    }
    const remainingLength = maxLength - 3; // Subtracting length of "..."
    const startLength = Math.floor(remainingLength / 2);
    const endLength = remainingLength - startLength;
    return (
      text.substring(0, startLength) +
      '...' +
      text.substring(text.length - endLength)
    );
  }
}
