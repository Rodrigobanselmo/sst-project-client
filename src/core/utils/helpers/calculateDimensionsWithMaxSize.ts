export function calculateDimensionsWithMaxSize({
  width,
  height,
  maxWidth,
  maxHeight,
}: {
  width?: number;
  height?: number;
  maxWidth?: number;
  maxHeight?: number;
}): { width: number; height: number } {
  if (!width || !height || !maxWidth || !maxHeight)
    return { width: 0, height: 0 };

  if (width > maxWidth || height > maxHeight) {
    const widthRatio = maxWidth / width;
    const heightRatio = maxHeight / height;
    const scale = Math.min(widthRatio, heightRatio);

    width *= scale;
    height *= scale;
  }

  return { width, height };
}
